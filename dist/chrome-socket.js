"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _ramda = require("ramda");

var _timeout = _interopRequireDefault(require("./timeout"));

var _tlsUtils = _interopRequireDefault(require("./tls-utils"));

var _workerUtils = require("./worker-utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var TCPSocket = /*#__PURE__*/function () {
  function TCPSocket(_ref) {
    var _this = this;

    var host = _ref.host,
        port = _ref.port,
        options = _ref.options;

    _classCallCheck(this, TCPSocket);

    this.host = host;
    this.port = port;
    this.ssl = false;
    this.bufferedAmount = 0;
    this.readyState = 'connecting';
    this.binaryType = (0, _ramda.propOr)('arraybuffer', 'binaryType')(options);

    if (this.binaryType !== 'arraybuffer') {
      throw new Error('Only arraybuffers are supported!');
    }

    this._ca = options.ca;
    this._useTLS = (0, _ramda.propOr)(false, 'useSecureTransport')(options);
    this._useSTARTTLS = false;
    this._socketId = 0;
    this._useLegacySocket = false;
    this._useForgeTls = false; // handles writes during starttls handshake, chrome socket only

    this._startTlsBuffer = [];
    this._startTlsHandshakeInProgress = false;
    chrome.runtime.getPlatformInfo(function (platformInfo) {
      if (platformInfo.os.indexOf('cordova') !== -1) {
        // chrome.sockets.tcp.secure is not functional on cordova
        // https://github.com/MobileChromeApps/mobile-chrome-apps/issues/269
        _this._useLegacySocket = false;
        _this._useForgeTls = true;
      } else {
        _this._useLegacySocket = true;
        _this._useForgeTls = false;
      }

      if (_this._useLegacySocket) {
        _this._createLegacySocket();
      } else {
        _this._createSocket();
      }
    });
  }
  /**
   * Creates a socket using the deprecated chrome.socket API
   */


  _createClass(TCPSocket, [{
    key: "_createLegacySocket",
    value: function _createLegacySocket() {
      var _this2 = this;

      chrome.socket.create('tcp', {}, function (createInfo) {
        _this2._socketId = createInfo.socketId;
        chrome.socket.connect(_this2._socketId, _this2.host, _this2.port, function (result) {
          if (result !== 0) {
            _this2.readyState = 'closed';

            _this2._emit('error', chrome.runtime.lastError);

            return;
          }

          _this2._onSocketConnected();
        });
      });
    }
    /**
     * Creates a socket using chrome.sockets.tcp
     */

  }, {
    key: "_createSocket",
    value: function _createSocket() {
      var _this3 = this;

      chrome.sockets.tcp.create({}, function (createInfo) {
        _this3._socketId = createInfo.socketId; // register for data events on the socket before connecting

        chrome.sockets.tcp.onReceive.addListener(function (readInfo) {
          if (readInfo.socketId === _this3._socketId) {
            // process the data available on the socket
            _this3._onData(readInfo.data);
          }
        }); // register for data error on the socket before connecting

        chrome.sockets.tcp.onReceiveError.addListener(function (readInfo) {
          if (readInfo.socketId === _this3._socketId) {
            // socket closed remotely or broken
            _this3.close();
          }
        });
        chrome.sockets.tcp.setPaused(_this3._socketId, true, function () {
          chrome.sockets.tcp.connect(_this3._socketId, _this3.host, _this3.port, function (result) {
            if (result < 0) {
              _this3.readyState = 'closed';

              _this3._emit('error', chrome.runtime.lastError);

              return;
            }

            _this3._onSocketConnected();
          });
        });
      });
    }
    /**
     * Invoked once a socket has been connected:
     * - Kicks off TLS handshake, if necessary
     * - Starts reading from legacy socket, if necessary
     */

  }, {
    key: "_onSocketConnected",
    value: function _onSocketConnected() {
      var _this4 = this;

      var read = function read() {
        if (_this4._useLegacySocket) {
          // the tls handshake is done let's start reading from the legacy socket
          _this4._readLegacySocket();

          _this4._emit('open');
        } else {
          chrome.sockets.tcp.setPaused(_this4._socketId, false, function () {
            _this4._emit('open');
          });
        }
      };

      if (!this._useTLS) {
        return read();
      } // do an immediate TLS handshake if this._useTLS === true


      this._upgradeToSecure(function () {
        read();
      });
    }
    /**
     * Handles the rough edges for differences between chrome.socket and chrome.sockets.tcp
     * for upgrading to a TLS connection with or without forge
     */

  }, {
    key: "_upgradeToSecure",
    value: function _upgradeToSecure() {
      var _this5 = this;

      var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

      // invoked after chrome.socket.secure or chrome.sockets.tcp.secure have been upgraded
      var onUpgraded = function onUpgraded(tlsResult) {
        if (tlsResult !== 0) {
          _this5._emit('error', new Error('TLS handshake failed. Reason: ' + chrome.runtime.lastError.message));

          _this5.close();

          return;
        }

        _this5.ssl = true; // empty the buffer

        while (_this5._startTlsBuffer.length) {
          _this5.send(_this5._startTlsBuffer.shift());
        }

        callback();
      };

      if (!this._useLegacySocket && this.readyState !== 'open') {
        // use chrome.sockets.tcp.secure for TLS, not for STARTTLS!
        // use forge only for STARTTLS
        this._useForgeTls = false;
        chrome.sockets.tcp.secure(this._socketId, onUpgraded);
      } else if (this._useLegacySocket) {
        chrome.socket.secure(this._socketId, onUpgraded);
      } else if (this._useForgeTls) {
        // setup the forge tls client or webworker as tls fallback
        (0, _tlsUtils["default"])(this);
        callback();
      }
    }
  }, {
    key: "upgradeToSecure",
    value: function upgradeToSecure() {
      var _this6 = this;

      if (this.ssl || this._useSTARTTLS) {
        return;
      }

      this._useSTARTTLS = true;

      this._upgradeToSecure(function () {
        if (_this6._useLegacySocket) {
          _this6._readLegacySocket(); // tls handshake is done, restart reading

        }
      });
    }
    /**
     * Reads from a legacy chrome.socket.
     */

  }, {
    key: "_readLegacySocket",
    value: function _readLegacySocket() {
      var _this7 = this;

      if (this._socketId === 0) {
        // the socket is closed. omit read and stop further reads
        return;
      } // don't read from chrome.socket if we have chrome.socket.secure a handshake in progress!


      if ((this._useSTARTTLS || this._useTLS) && !this.ssl) {
        return;
      }

      chrome.socket.read(this._socketId, function (readInfo) {
        // socket closed remotely or broken
        if (readInfo.resultCode <= 0) {
          _this7._socketId = 0;

          _this7.close();

          return;
        } // process the data available on the socket


        _this7._onData(readInfo.data); // Queue the next read.
        // If a STARTTLS handshake might be upcoming, postpone this onto
        // the task queue so the IMAP client has a chance to call upgradeToSecure;
        // without this, we might eat the beginning of the handshake.
        // If we are already secure, just call it (for performance).


        if (_this7.ssl) {
          _this7._readLegacySocket();
        } else {
          (0, _timeout["default"])(function () {
            return _this7._readLegacySocket();
          });
        }
      });
    }
    /**
     * Invoked when data has been read from the socket. Handles cases when to feed
     * the data available on the socket to forge.
     *
     * @param {ArrayBuffer} buffer The binary data read from the socket
     */

  }, {
    key: "_onData",
    value: function _onData(buffer) {
      if ((this._useTLS || this._useSTARTTLS) && this._useForgeTls) {
        // feed the data to the tls client
        if (this._tlsWorker) {
          this._tlsWorker.postMessage((0, _workerUtils.createMessage)(_workerUtils.EVENT_INBOUND, buffer), [buffer]);
        } else {
          this._tls.processInbound(buffer);
        }
      } else {
        // emit data event
        this._emit('data', buffer);
      }
    }
    /**
     * Closes the socket
     * @return {[type]} [description]
     */

  }, {
    key: "close",
    value: function close() {
      this.readyState = 'closing';

      if (this._socketId !== 0) {
        if (this._useLegacySocket) {
          // close legacy socket
          chrome.socket.disconnect(this._socketId);
          chrome.socket.destroy(this._socketId);
        } else {
          // close socket
          chrome.sockets.tcp.disconnect(this._socketId);
        }

        this._socketId = 0;
      } // terminate the tls worker


      if (this._tlsWorker) {
        this._tlsWorker.terminate();

        this._tlsWorker = undefined;
      }

      this._emit('close');
    }
  }, {
    key: "send",
    value: function send(buffer) {
      if (!this._useForgeTls && this._useSTARTTLS && !this.ssl) {
        // buffer the unprepared data until chrome.socket(s.tcp) handshake is done
        this._startTlsBuffer.push(buffer);
      } else if (this._useForgeTls && (this._useTLS || this._useSTARTTLS)) {
        // give buffer to forge to be prepared for tls
        if (this._tlsWorker) {
          this._tlsWorker.postMessage((0, _workerUtils.createMessage)(_workerUtils.EVENT_OUTBOUND, buffer), [buffer]);
        } else {
          this._tls.prepareOutbound(buffer);
        }
      } else {
        // send the arraybuffer
        this._send(buffer);
      }
    }
  }, {
    key: "_send",
    value: function _send(data) {
      var _this8 = this;

      if (this._socketId === 0) {
        // the socket is closed.
        return;
      }

      if (this._useLegacySocket) {
        chrome.socket.write(this._socketId, data, function (writeInfo) {
          if (writeInfo.bytesWritten < 0 && _this8._socketId !== 0) {
            // if the socket is already 0, it has already been closed. no need to alert then...
            _this8._emit('error', new Error('Could not write ' + data.byteLength + ' bytes to socket ' + _this8._socketId + '. Chrome error code: ' + writeInfo.bytesWritten));

            _this8._socketId = 0;

            _this8.close();

            return;
          }

          _this8._emit('drain');
        });
      } else {
        chrome.sockets.tcp.send(this._socketId, data, function (sendInfo) {
          if (sendInfo.bytesSent < 0 && _this8._socketId !== 0) {
            // if the socket is already 0, it has already been closed. no need to alert then...
            _this8._emit('error', new Error('Could not write ' + data.byteLength + ' bytes to socket ' + _this8._socketId + '. Chrome error code: ' + sendInfo.bytesSent));

            _this8.close();

            return;
          }

          _this8._emit('drain');
        });
      }
    }
  }, {
    key: "_emit",
    value: function _emit(type, data) {
      var target = this;

      switch (type) {
        case 'open':
          this.readyState = 'open';
          this.onopen && this.onopen({
            target: target,
            type: type,
            data: data
          });
          break;

        case 'error':
          this.onerror && this.onerror({
            target: target,
            type: type,
            data: data
          });
          break;

        case 'data':
          this.ondata && this.ondata({
            target: target,
            type: type,
            data: data
          });
          break;

        case 'drain':
          this.ondrain && this.ondrain({
            target: target,
            type: type,
            data: data
          });
          break;

        case 'close':
          this.readyState = 'closed';
          this.onclose && this.onclose({
            target: target,
            type: type,
            data: data
          });
          break;
      }
    }
  }], [{
    key: "open",
    value: function open(host, port) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return new TCPSocket({
        host: host,
        port: port,
        options: options
      });
    }
  }]);

  return TCPSocket;
}();

exports["default"] = TCPSocket;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jaHJvbWUtc29ja2V0LmpzIl0sIm5hbWVzIjpbIlRDUFNvY2tldCIsImhvc3QiLCJwb3J0Iiwib3B0aW9ucyIsInNzbCIsImJ1ZmZlcmVkQW1vdW50IiwicmVhZHlTdGF0ZSIsImJpbmFyeVR5cGUiLCJFcnJvciIsIl9jYSIsImNhIiwiX3VzZVRMUyIsIl91c2VTVEFSVFRMUyIsIl9zb2NrZXRJZCIsIl91c2VMZWdhY3lTb2NrZXQiLCJfdXNlRm9yZ2VUbHMiLCJfc3RhcnRUbHNCdWZmZXIiLCJfc3RhcnRUbHNIYW5kc2hha2VJblByb2dyZXNzIiwiY2hyb21lIiwicnVudGltZSIsImdldFBsYXRmb3JtSW5mbyIsInBsYXRmb3JtSW5mbyIsIm9zIiwiaW5kZXhPZiIsIl9jcmVhdGVMZWdhY3lTb2NrZXQiLCJfY3JlYXRlU29ja2V0Iiwic29ja2V0IiwiY3JlYXRlIiwiY3JlYXRlSW5mbyIsInNvY2tldElkIiwiY29ubmVjdCIsInJlc3VsdCIsIl9lbWl0IiwibGFzdEVycm9yIiwiX29uU29ja2V0Q29ubmVjdGVkIiwic29ja2V0cyIsInRjcCIsIm9uUmVjZWl2ZSIsImFkZExpc3RlbmVyIiwicmVhZEluZm8iLCJfb25EYXRhIiwiZGF0YSIsIm9uUmVjZWl2ZUVycm9yIiwiY2xvc2UiLCJzZXRQYXVzZWQiLCJyZWFkIiwiX3JlYWRMZWdhY3lTb2NrZXQiLCJfdXBncmFkZVRvU2VjdXJlIiwiY2FsbGJhY2siLCJvblVwZ3JhZGVkIiwidGxzUmVzdWx0IiwibWVzc2FnZSIsImxlbmd0aCIsInNlbmQiLCJzaGlmdCIsInNlY3VyZSIsInJlc3VsdENvZGUiLCJidWZmZXIiLCJfdGxzV29ya2VyIiwicG9zdE1lc3NhZ2UiLCJFVkVOVF9JTkJPVU5EIiwiX3RscyIsInByb2Nlc3NJbmJvdW5kIiwiZGlzY29ubmVjdCIsImRlc3Ryb3kiLCJ0ZXJtaW5hdGUiLCJ1bmRlZmluZWQiLCJwdXNoIiwiRVZFTlRfT1VUQk9VTkQiLCJwcmVwYXJlT3V0Ym91bmQiLCJfc2VuZCIsIndyaXRlIiwid3JpdGVJbmZvIiwiYnl0ZXNXcml0dGVuIiwiYnl0ZUxlbmd0aCIsInNlbmRJbmZvIiwiYnl0ZXNTZW50IiwidHlwZSIsInRhcmdldCIsIm9ub3BlbiIsIm9uZXJyb3IiLCJvbmRhdGEiLCJvbmRyYWluIiwib25jbG9zZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7O0lBS3FCQSxTO0FBS25CLDJCQUFzQztBQUFBOztBQUFBLFFBQXZCQyxJQUF1QixRQUF2QkEsSUFBdUI7QUFBQSxRQUFqQkMsSUFBaUIsUUFBakJBLElBQWlCO0FBQUEsUUFBWEMsT0FBVyxRQUFYQSxPQUFXOztBQUFBOztBQUNwQyxTQUFLRixJQUFMLEdBQVlBLElBQVo7QUFDQSxTQUFLQyxJQUFMLEdBQVlBLElBQVo7QUFDQSxTQUFLRSxHQUFMLEdBQVcsS0FBWDtBQUNBLFNBQUtDLGNBQUwsR0FBc0IsQ0FBdEI7QUFDQSxTQUFLQyxVQUFMLEdBQWtCLFlBQWxCO0FBQ0EsU0FBS0MsVUFBTCxHQUFrQixtQkFBTyxhQUFQLEVBQXNCLFlBQXRCLEVBQW9DSixPQUFwQyxDQUFsQjs7QUFFQSxRQUFJLEtBQUtJLFVBQUwsS0FBb0IsYUFBeEIsRUFBdUM7QUFDckMsWUFBTSxJQUFJQyxLQUFKLENBQVUsa0NBQVYsQ0FBTjtBQUNEOztBQUVELFNBQUtDLEdBQUwsR0FBV04sT0FBTyxDQUFDTyxFQUFuQjtBQUNBLFNBQUtDLE9BQUwsR0FBZSxtQkFBTyxLQUFQLEVBQWMsb0JBQWQsRUFBb0NSLE9BQXBDLENBQWY7QUFDQSxTQUFLUyxZQUFMLEdBQW9CLEtBQXBCO0FBQ0EsU0FBS0MsU0FBTCxHQUFpQixDQUFqQjtBQUNBLFNBQUtDLGdCQUFMLEdBQXdCLEtBQXhCO0FBQ0EsU0FBS0MsWUFBTCxHQUFvQixLQUFwQixDQWpCb0MsQ0FtQnBDOztBQUNBLFNBQUtDLGVBQUwsR0FBdUIsRUFBdkI7QUFDQSxTQUFLQyw0QkFBTCxHQUFvQyxLQUFwQztBQUVBQyxJQUFB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Q0FBaEI7QUFDQTs7QUFDRixhQUFLLE1BQUw7QUFDRSxlQUFLd0MsTUFBTCxJQUFlLEtBQUtBLE1BQUwsQ0FBWTtBQUFFSCxZQUFBQSxNQUFNLEVBQU5BLE1BQUY7QUFBVUQsWUFBQUEsSUFBSSxFQUFKQSxJQUFWO0FBQWdCcEMsWUFBQUEsSUFBSSxFQUFKQTtBQUFoQixXQUFaLENBQWY7QUFDQTs7QUFDRixhQUFLLE9BQUw7QUFDRSxlQUFLeUMsT0FBTCxJQUFnQixLQUFLQSxPQUFMLENBQWE7QUFBRUosWUFBQUEsTUFBTSxFQUFOQSxNQUFGO0FBQVVELFlBQUFBLElBQUksRUFBSkEsSUFBVjtBQUFnQnBDLFlBQUFBLElBQUksRUFBSkE7QUFBaEIsV0FBYixDQUFoQjtBQUNBOztBQUNGLGFBQUssT0FBTDtBQUNFLGVBQUtuQyxVQUFMLEdBQWtCLFFBQWxCO0FBQ0EsZUFBSzZFLE9BQUwsSUFBZ0IsS0FBS0EsT0FBTCxDQUFhO0FBQUVMLFlBQUFBLE1BQU0sRUFBTkEsTUFBRjtBQUFVRCxZQUFBQSxJQUFJLEVBQUpBLElBQVY7QUFBZ0JwQyxZQUFBQSxJQUFJLEVBQUpBO0FBQWhCLFdBQWIsQ0FBaEI7QUFDQTtBQWpCSjtBQW1CRDs7O1dBalZELGNBQWF4QyxJQUFiLEVBQW1CQyxJQUFuQixFQUF1QztBQUFBLFVBQWRDLE9BQWMsdUVBQUosRUFBSTtBQUNyQyxhQUFPLElBQUlILFNBQUosQ0FBYztBQUFFQyxRQUFBQSxJQUFJLEVBQUpBLElBQUY7QUFBUUMsUUFBQUEsSUFBSSxFQUFKQSxJQUFSO0FBQWNDLFFBQUFBLE9BQU8sRUFBUEE7QUFBZCxPQUFkLENBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHByb3BPciB9IGZyb20gJ3JhbWRhJ1xuaW1wb3J0IHNjaGVkdWxlSW5OZXh0RXZlbnRMb29wIGZyb20gJy4vdGltZW91dCdcbmltcG9ydCBjcmVhdGVUbHMgZnJvbSAnLi90bHMtdXRpbHMnXG5pbXBvcnQge1xuICBFVkVOVF9JTkJPVU5ELCBFVkVOVF9PVVRCT1VORCxcbiAgY3JlYXRlTWVzc2FnZVxufSBmcm9tICcuL3dvcmtlci11dGlscydcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVENQU29ja2V0IHtcbiAgc3RhdGljIG9wZW4gKGhvc3QsIHBvcnQsIG9wdGlvbnMgPSB7fSkge1xuICAgIHJldHVybiBuZXcgVENQU29ja2V0KHsgaG9zdCwgcG9ydCwgb3B0aW9ucyB9KVxuICB9XG5cbiAgY29uc3RydWN0b3IgKHsgaG9zdCwgcG9ydCwgb3B0aW9ucyB9KSB7XG4gICAgdGhpcy5ob3N0ID0gaG9zdFxuICAgIHRoaXMucG9ydCA9IHBvcnRcbiAgICB0aGlzLnNzbCA9IGZhbHNlXG4gICAgdGhpcy5idWZmZXJlZEFtb3VudCA9IDBcbiAgICB0aGlzLnJlYWR5U3RhdGUgPSAnY29ubmVjdGluZydcbiAgICB0aGlzLmJpbmFyeVR5cGUgPSBwcm9wT3IoJ2FycmF5YnVmZmVyJywgJ2JpbmFyeVR5cGUnKShvcHRpb25zKVxuXG4gICAgaWYgKHRoaXMuYmluYXJ5VHlwZSAhPT0gJ2FycmF5YnVmZmVyJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdPbmx5IGFycmF5YnVmZmVycyBhcmUgc3VwcG9ydGVkIScpXG4gICAgfVxuXG4gICAgdGhpcy5fY2EgPSBvcHRpb25zLmNhXG4gICAgdGhpcy5fdXNlVExTID0gcHJvcE9yKGZhbHNlLCAndXNlU2VjdXJlVHJhbnNwb3J0Jykob3B0aW9ucylcbiAgICB0aGlzLl91c2VTVEFSVFRMUyA9IGZhbHNlXG4gICAgdGhpcy5fc29ja2V0SWQgPSAwXG4gICAgdGhpcy5fdXNlTGVnYWN5U29ja2V0ID0gZmFsc2VcbiAgICB0aGlzLl91c2VGb3JnZVRscyA9IGZhbHNlXG5cbiAgICAvLyBoYW5kbGVzIHdyaXRlcyBkdXJpbmcgc3RhcnR0bHMgaGFuZHNoYWtlLCBjaHJvbWUgc29ja2V0IG9ubHlcbiAgICB0aGlzLl9zdGFydFRsc0J1ZmZlciA9IFtdXG4gICAgdGhpcy5fc3RhcnRUbHNIYW5kc2hha2VJblByb2dyZXNzID0gZmFsc2VcblxuICAgIGNocm9tZS5ydW50aW1lLmdldFBsYXRmb3JtSW5mbyhwbGF0Zm9ybUluZm8gPT4ge1xuICAgICAgaWYgKHBsYXRmb3JtSW5mby5vcy5pbmRleE9mKCdjb3Jkb3ZhJykgIT09IC0xKSB7XG4gICAgICAgIC8vIGNocm9tZS5zb2NrZXRzLnRjcC5zZWN1cmUgaXMgbm90IGZ1bmN0aW9uYWwgb24gY29yZG92YVxuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vTW9iaWxlQ2hyb21lQXBwcy9tb2JpbGUtY2hyb21lLWFwcHMvaXNzdWVzLzI2OVxuICAgICAgICB0aGlzLl91c2VMZWdhY3lTb2NrZXQgPSBmYWxzZVxuICAgICAgICB0aGlzLl91c2VGb3JnZVRscyA9IHRydWVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3VzZUxlZ2FjeVNvY2tldCA9IHRydWVcbiAgICAgICAgdGhpcy5fdXNlRm9yZ2VUbHMgPSBmYWxzZVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fdXNlTGVnYWN5U29ja2V0KSB7XG4gICAgICAgIHRoaXMuX2NyZWF0ZUxlZ2FjeVNvY2tldCgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9jcmVhdGVTb2NrZXQoKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIHNvY2tldCB1c2luZyB0aGUgZGVwcmVjYXRlZCBjaHJvbWUuc29ja2V0IEFQSVxuICAgKi9cbiAgX2NyZWF0ZUxlZ2FjeVNvY2tldCAoKSB7XG4gICAgY2hyb21lLnNvY2tldC5jcmVhdGUoJ3RjcCcsIHt9LCBjcmVhdGVJbmZvID0+IHtcbiAgICAgIHRoaXMuX3NvY2tldElkID0gY3JlYXRlSW5mby5zb2NrZXRJZFxuXG4gICAgICBjaHJvbWUuc29ja2V0LmNvbm5lY3QodGhpcy5fc29ja2V0SWQsIHRoaXMuaG9zdCwgdGhpcy5wb3J0LCByZXN1bHQgPT4ge1xuICAgICAgICBpZiAocmVzdWx0ICE9PSAwKSB7XG4gICAgICAgICAgdGhpcy5yZWFkeVN0YXRlID0gJ2Nsb3NlZCdcbiAgICAgICAgICB0aGlzLl9lbWl0KCdlcnJvcicsIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcilcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX29uU29ja2V0Q29ubmVjdGVkKClcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgc29ja2V0IHVzaW5nIGNocm9tZS5zb2NrZXRzLnRjcFxuICAgKi9cbiAgX2NyZWF0ZVNvY2tldCAoKSB7XG4gICAgY2hyb21lLnNvY2tldHMudGNwLmNyZWF0ZSh7fSwgY3JlYXRlSW5mbyA9PiB7XG4gICAgICB0aGlzLl9zb2NrZXRJZCA9IGNyZWF0ZUluZm8uc29ja2V0SWRcblxuICAgICAgLy8gcmVnaXN0ZXIgZm9yIGRhdGEgZXZlbnRzIG9uIHRoZSBzb2NrZXQgYmVmb3JlIGNvbm5lY3RpbmdcbiAgICAgIGNocm9tZS5zb2NrZXRzLnRjcC5vblJlY2VpdmUuYWRkTGlzdGVuZXIocmVhZEluZm8gPT4ge1xuICAgICAgICBpZiAocmVhZEluZm8uc29ja2V0SWQgPT09IHRoaXMuX3NvY2tldElkKSB7XG4gICAgICAgICAgLy8gcHJvY2VzcyB0aGUgZGF0YSBhdmFpbGFibGUgb24gdGhlIHNvY2tldFxuICAgICAgICAgIHRoaXMuX29uRGF0YShyZWFkSW5mby5kYXRhKVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICAvLyByZWdpc3RlciBmb3IgZGF0YSBlcnJvciBvbiB0aGUgc29ja2V0IGJlZm9yZSBjb25uZWN0aW5nXG4gICAgICBjaHJvbWUuc29ja2V0cy50Y3Aub25SZWNlaXZlRXJyb3IuYWRkTGlzdGVuZXIocmVhZEluZm8gPT4ge1xuICAgICAgICBpZiAocmVhZEluZm8uc29ja2V0SWQgPT09IHRoaXMuX3NvY2tldElkKSB7XG4gICAgICAgICAgLy8gc29ja2V0IGNsb3NlZCByZW1vdGVseSBvciBicm9rZW5cbiAgICAgICAgICB0aGlzLmNsb3NlKClcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgY2hyb21lLnNvY2tldHMudGNwLnNldFBhdXNlZCh0aGlzLl9zb2NrZXRJZCwgdHJ1ZSwgKCkgPT4ge1xuICAgICAgICBjaHJvbWUuc29ja2V0cy50Y3AuY29ubmVjdCh0aGlzLl9zb2NrZXRJZCwgdGhpcy5ob3N0LCB0aGlzLnBvcnQsIHJlc3VsdCA9PiB7XG4gICAgICAgICAgaWYgKHJlc3VsdCA8IDApIHtcbiAgICAgICAgICAgIHRoaXMucmVhZHlTdGF0ZSA9ICdjbG9zZWQnXG4gICAgICAgICAgICB0aGlzLl9lbWl0KCdlcnJvcicsIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcilcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMuX29uU29ja2V0Q29ubmVjdGVkKClcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnZva2VkIG9uY2UgYSBzb2NrZXQgaGFzIGJlZW4gY29ubmVjdGVkOlxuICAgKiAtIEtpY2tzIG9mZiBUTFMgaGFuZHNoYWtlLCBpZiBuZWNlc3NhcnlcbiAgICogLSBTdGFydHMgcmVhZGluZyBmcm9tIGxlZ2FjeSBzb2NrZXQsIGlmIG5lY2Vzc2FyeVxuICAgKi9cbiAgX29uU29ja2V0Q29ubmVjdGVkICgpIHtcbiAgICBjb25zdCByZWFkID0gKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuX3VzZUxlZ2FjeVNvY2tldCkge1xuICAgICAgICAvLyB0aGUgdGxzIGhhbmRzaGFrZSBpcyBkb25lIGxldCdzIHN0YXJ0IHJlYWRpbmcgZnJvbSB0aGUgbGVnYWN5IHNvY2tldFxuICAgICAgICB0aGlzLl9yZWFkTGVnYWN5U29ja2V0KClcbiAgICAgICAgdGhpcy5fZW1pdCgnb3BlbicpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjaHJvbWUuc29ja2V0cy50Y3Auc2V0UGF1c2VkKHRoaXMuX3NvY2tldElkLCBmYWxzZSwgKCkgPT4ge1xuICAgICAgICAgIHRoaXMuX2VtaXQoJ29wZW4nKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghdGhpcy5fdXNlVExTKSB7XG4gICAgICByZXR1cm4gcmVhZCgpXG4gICAgfVxuXG4gICAgLy8gZG8gYW4gaW1tZWRpYXRlIFRMUyBoYW5kc2hha2UgaWYgdGhpcy5fdXNlVExTID09PSB0cnVlXG4gICAgdGhpcy5fdXBncmFkZVRvU2VjdXJlKCgpID0+IHsgcmVhZCgpIH0pXG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyB0aGUgcm91Z2ggZWRnZXMgZm9yIGRpZmZlcmVuY2VzIGJldHdlZW4gY2hyb21lLnNvY2tldCBhbmQgY2hyb21lLnNvY2tldHMudGNwXG4gICAqIGZvciB1cGdyYWRpbmcgdG8gYSBUTFMgY29ubmVjdGlvbiB3aXRoIG9yIHdpdGhvdXQgZm9yZ2VcbiAgICovXG4gIF91cGdyYWRlVG9TZWN1cmUgKGNhbGxiYWNrID0gKCkgPT4ge30pIHtcbiAgICAvLyBpbnZva2VkIGFmdGVyIGNocm9tZS5zb2NrZXQuc2VjdXJlIG9yIGNocm9tZS5zb2NrZXRzLnRjcC5zZWN1cmUgaGF2ZSBiZWVuIHVwZ3JhZGVkXG4gICAgY29uc3Qgb25VcGdyYWRlZCA9IHRsc1Jlc3VsdCA9PiB7XG4gICAgICBpZiAodGxzUmVzdWx0ICE9PSAwKSB7XG4gICAgICAgIHRoaXMuX2VtaXQoJ2Vycm9yJywgbmV3IEVycm9yKCdUTFMgaGFuZHNoYWtlIGZhaWxlZC4gUmVhc29uOiAnICsgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpKVxuICAgICAgICB0aGlzLmNsb3NlKClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIHRoaXMuc3NsID0gdHJ1ZVxuXG4gICAgICAvLyBlbXB0eSB0aGUgYnVmZmVyXG4gICAgICB3aGlsZSAodGhpcy5fc3RhcnRUbHNCdWZmZXIubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuc2VuZCh0aGlzLl9zdGFydFRsc0J1ZmZlci5zaGlmdCgpKVxuICAgICAgfVxuXG4gICAgICBjYWxsYmFjaygpXG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLl91c2VMZWdhY3lTb2NrZXQgJiYgdGhpcy5yZWFkeVN0YXRlICE9PSAnb3BlbicpIHtcbiAgICAgIC8vIHVzZSBjaHJvbWUuc29ja2V0cy50Y3Auc2VjdXJlIGZvciBUTFMsIG5vdCBmb3IgU1RBUlRUTFMhXG4gICAgICAvLyB1c2UgZm9yZ2Ugb25seSBmb3IgU1RBUlRUTFNcbiAgICAgIHRoaXMuX3VzZUZvcmdlVGxzID0gZmFsc2VcbiAgICAgIGNocm9tZS5zb2NrZXRzLnRjcC5zZWN1cmUodGhpcy5fc29ja2V0SWQsIG9uVXBncmFkZWQpXG4gICAgfSBlbHNlIGlmICh0aGlzLl91c2VMZWdhY3lTb2NrZXQpIHtcbiAgICAgIGNocm9tZS5zb2NrZXQuc2VjdXJlKHRoaXMuX3NvY2tldElkLCBvblVwZ3JhZGVkKVxuICAgIH0gZWxzZSBpZiAodGhpcy5fdXNlRm9yZ2VUbHMpIHtcbiAgICAgIC8vIHNldHVwIHRoZSBmb3JnZSB0bHMgY2xpZW50IG9yIHdlYndvcmtlciBhcyB0bHMgZmFsbGJhY2tcbiAgICAgIGNyZWF0ZVRscyh0aGlzKVxuICAgICAgY2FsbGJhY2soKVxuICAgIH1cbiAgfVxuXG4gIHVwZ3JhZGVUb1NlY3VyZSAoKSB7XG4gICAgaWYgKHRoaXMuc3NsIHx8IHRoaXMuX3VzZVNUQVJUVExTKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLl91c2VTVEFSVFRMUyA9IHRydWVcbiAgICB0aGlzLl91cGdyYWRlVG9TZWN1cmUoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuX3VzZUxlZ2FjeVNvY2tldCkge1xuICAgICAgICB0aGlzLl9yZWFkTGVnYWN5U29ja2V0KCkgLy8gdGxzIGhhbmRzaGFrZSBpcyBkb25lLCByZXN0YXJ0IHJlYWRpbmdcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFJlYWRzIGZyb20gYSBsZWdhY3kgY2hyb21lLnNvY2tldC5cbiAgICovXG4gIF9yZWFkTGVnYWN5U29ja2V0ICgpIHtcbiAgICBpZiAodGhpcy5fc29ja2V0SWQgPT09IDApIHtcbiAgICAgIC8vIHRoZSBzb2NrZXQgaXMgY2xvc2VkLiBvbWl0IHJlYWQgYW5kIHN0b3AgZnVydGhlciByZWFkc1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gZG9uJ3QgcmVhZCBmcm9tIGNocm9tZS5zb2NrZXQgaWYgd2UgaGF2ZSBjaHJvbWUuc29ja2V0LnNlY3VyZSBhIGhhbmRzaGFrZSBpbiBwcm9ncmVzcyFcbiAgICBpZiAoKHRoaXMuX3VzZVNUQVJUVExTIHx8IHRoaXMuX3VzZVRMUykgJiYgIXRoaXMuc3NsKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjaHJvbWUuc29ja2V0LnJlYWQodGhpcy5fc29ja2V0SWQsIHJlYWRJbmZvID0+IHtcbiAgICAgIC8vIHNvY2tldCBjbG9zZWQgcmVtb3RlbHkgb3IgYnJva2VuXG4gICAgICBpZiAocmVhZEluZm8ucmVzdWx0Q29kZSA8PSAwKSB7XG4gICAgICAgIHRoaXMuX3NvY2tldElkID0gMFxuICAgICAgICB0aGlzLmNsb3NlKClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIC8vIHByb2Nlc3MgdGhlIGRhdGEgYXZhaWxhYmxlIG9uIHRoZSBzb2NrZXRcbiAgICAgIHRoaXMuX29uRGF0YShyZWFkSW5mby5kYXRhKVxuXG4gICAgICAvLyBRdWV1ZSB0aGUgbmV4dCByZWFkLlxuICAgICAgLy8gSWYgYSBTVEFSVFRMUyBoYW5kc2hha2UgbWlnaHQgYmUgdXBjb21pbmcsIHBvc3Rwb25lIHRoaXMgb250b1xuICAgICAgLy8gdGhlIHRhc2sgcXVldWUgc28gdGhlIElNQVAgY2xpZW50IGhhcyBhIGNoYW5jZSB0byBjYWxsIHVwZ3JhZGVUb1NlY3VyZTtcbiAgICAgIC8vIHdpdGhvdXQgdGhpcywgd2UgbWlnaHQgZWF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGhhbmRzaGFrZS5cbiAgICAgIC8vIElmIHdlIGFyZSBhbHJlYWR5IHNlY3VyZSwganVzdCBjYWxsIGl0IChmb3IgcGVyZm9ybWFuY2UpLlxuICAgICAgaWYgKHRoaXMuc3NsKSB7XG4gICAgICAgIHRoaXMuX3JlYWRMZWdhY3lTb2NrZXQoKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2NoZWR1bGVJbk5leHRFdmVudExvb3AoKCkgPT4gdGhpcy5fcmVhZExlZ2FjeVNvY2tldCgpKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogSW52b2tlZCB3aGVuIGRhdGEgaGFzIGJlZW4gcmVhZCBmcm9tIHRoZSBzb2NrZXQuIEhhbmRsZXMgY2FzZXMgd2hlbiB0byBmZWVkXG4gICAqIHRoZSBkYXRhIGF2YWlsYWJsZSBvbiB0aGUgc29ja2V0IHRvIGZvcmdlLlxuICAgKlxuICAgKiBAcGFyYW0ge0FycmF5QnVmZmVyfSBidWZmZXIgVGhlIGJpbmFyeSBkYXRhIHJlYWQgZnJvbSB0aGUgc29ja2V0XG4gICAqL1xuICBfb25EYXRhIChidWZmZXIpIHtcbiAgICBpZiAoKHRoaXMuX3VzZVRMUyB8fCB0aGlzLl91c2VTVEFSVFRMUykgJiYgdGhpcy5fdXNlRm9yZ2VUbHMpIHtcbiAgICAgIC8vIGZlZWQgdGhlIGRhdGEgdG8gdGhlIHRscyBjbGllbnRcbiAgICAgIGlmICh0aGlzLl90bHNXb3JrZXIpIHtcbiAgICAgICAgdGhpcy5fdGxzV29ya2VyLnBvc3RNZXNzYWdlKGNyZWF0ZU1lc3NhZ2UoRVZFTlRfSU5CT1VORCwgYnVmZmVyKSwgW2J1ZmZlcl0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl90bHMucHJvY2Vzc0luYm91bmQoYnVmZmVyKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBlbWl0IGRhdGEgZXZlbnRcbiAgICAgIHRoaXMuX2VtaXQoJ2RhdGEnLCBidWZmZXIpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENsb3NlcyB0aGUgc29ja2V0XG4gICAqIEByZXR1cm4ge1t0eXBlXX0gW2Rlc2NyaXB0aW9uXVxuICAgKi9cbiAgY2xvc2UgKCkge1xuICAgIHRoaXMucmVhZHlTdGF0ZSA9ICdjbG9zaW5nJ1xuXG4gICAgaWYgKHRoaXMuX3NvY2tldElkICE9PSAwKSB7XG4gICAgICBpZiAodGhpcy5fdXNlTGVnYWN5U29ja2V0KSB7XG4gICAgICAgIC8vIGNsb3NlIGxlZ2FjeSBzb2NrZXRcbiAgICAgICAgY2hyb21lLnNvY2tldC5kaXNjb25uZWN0KHRoaXMuX3NvY2tldElkKVxuICAgICAgICBjaHJvbWUuc29ja2V0LmRlc3Ryb3kodGhpcy5fc29ja2V0SWQpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBjbG9zZSBzb2NrZXRcbiAgICAgICAgY2hyb21lLnNvY2tldHMudGNwLmRpc2Nvbm5lY3QodGhpcy5fc29ja2V0SWQpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3NvY2tldElkID0gMFxuICAgIH1cblxuICAgIC8vIHRlcm1pbmF0ZSB0aGUgdGxzIHdvcmtlclxuICAgIGlmICh0aGlzLl90bHNXb3JrZXIpIHtcbiAgICAgIHRoaXMuX3Rsc1dvcmtlci50ZXJtaW5hdGUoKVxuICAgICAgdGhpcy5fdGxzV29ya2VyID0gdW5kZWZpbmVkXG4gICAgfVxuXG4gICAgdGhpcy5fZW1pdCgnY2xvc2UnKVxuICB9XG5cbiAgc2VuZCAoYnVmZmVyKSB7XG4gICAgaWYgKCF0aGlzLl91c2VGb3JnZVRscyAmJiB0aGlzLl91c2VTVEFSVFRMUyAmJiAhdGhpcy5zc2wpIHtcbiAgICAgIC8vIGJ1ZmZlciB0aGUgdW5wcmVwYXJlZCBkYXRhIHVudGlsIGNocm9tZS5zb2NrZXQocy50Y3ApIGhhbmRzaGFrZSBpcyBkb25lXG4gICAgICB0aGlzLl9zdGFydFRsc0J1ZmZlci5wdXNoKGJ1ZmZlcilcbiAgICB9IGVsc2UgaWYgKHRoaXMuX3VzZUZvcmdlVGxzICYmICh0aGlzLl91c2VUTFMgfHwgdGhpcy5fdXNlU1RBUlRUTFMpKSB7XG4gICAgICAvLyBnaXZlIGJ1ZmZlciB0byBmb3JnZSB0byBiZSBwcmVwYXJlZCBmb3IgdGxzXG4gICAgICBpZiAodGhpcy5fdGxzV29ya2VyKSB7XG4gICAgICAgIHRoaXMuX3Rsc1dvcmtlci5wb3N0TWVzc2FnZShjcmVhdGVNZXNzYWdlKEVWRU5UX09VVEJPVU5ELCBidWZmZXIpLCBbYnVmZmVyXSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3Rscy5wcmVwYXJlT3V0Ym91bmQoYnVmZmVyKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBzZW5kIHRoZSBhcnJheWJ1ZmZlclxuICAgICAgdGhpcy5fc2VuZChidWZmZXIpXG4gICAgfVxuICB9XG5cbiAgX3NlbmQgKGRhdGEpIHtcbiAgICBpZiAodGhpcy5fc29ja2V0SWQgPT09IDApIHtcbiAgICAgIC8vIHRoZSBzb2NrZXQgaXMgY2xvc2VkLlxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3VzZUxlZ2FjeVNvY2tldCkge1xuICAgICAgY2hyb21lLnNvY2tldC53cml0ZSh0aGlzLl9zb2NrZXRJZCwgZGF0YSwgd3JpdGVJbmZvID0+IHtcbiAgICAgICAgaWYgKHdyaXRlSW5mby5ieXRlc1dyaXR0ZW4gPCAwICYmIHRoaXMuX3NvY2tldElkICE9PSAwKSB7XG4gICAgICAgICAgLy8gaWYgdGhlIHNvY2tldCBpcyBhbHJlYWR5IDAsIGl0IGhhcyBhbHJlYWR5IGJlZW4gY2xvc2VkLiBubyBuZWVkIHRvIGFsZXJ0IHRoZW4uLi5cbiAgICAgICAgICB0aGlzLl9lbWl0KCdlcnJvcicsIG5ldyBFcnJvcignQ291bGQgbm90IHdyaXRlICcgKyBkYXRhLmJ5dGVMZW5ndGggKyAnIGJ5dGVzIHRvIHNvY2tldCAnICsgdGhpcy5fc29ja2V0SWQgKyAnLiBDaHJvbWUgZXJyb3IgY29kZTogJyArIHdyaXRlSW5mby5ieXRlc1dyaXR0ZW4pKVxuICAgICAgICAgIHRoaXMuX3NvY2tldElkID0gMFxuICAgICAgICAgIHRoaXMuY2xvc2UoKVxuXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9lbWl0KCdkcmFpbicpXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBjaHJvbWUuc29ja2V0cy50Y3Auc2VuZCh0aGlzLl9zb2NrZXRJZCwgZGF0YSwgc2VuZEluZm8gPT4ge1xuICAgICAgICBpZiAoc2VuZEluZm8uYnl0ZXNTZW50IDwgMCAmJiB0aGlzLl9zb2NrZXRJZCAhPT0gMCkge1xuICAgICAgICAgIC8vIGlmIHRoZSBzb2NrZXQgaXMgYWxyZWFkeSAwLCBpdCBoYXMgYWxyZWFkeSBiZWVuIGNsb3NlZC4gbm8gbmVlZCB0byBhbGVydCB0aGVuLi4uXG4gICAgICAgICAgdGhpcy5fZW1pdCgnZXJyb3InLCBuZXcgRXJyb3IoJ0NvdWxkIG5vdCB3cml0ZSAnICsgZGF0YS5ieXRlTGVuZ3RoICsgJyBieXRlcyB0byBzb2NrZXQgJyArIHRoaXMuX3NvY2tldElkICsgJy4gQ2hyb21lIGVycm9yIGNvZGU6ICcgKyBzZW5kSW5mby5ieXRlc1NlbnQpKVxuICAgICAgICAgIHRoaXMuY2xvc2UoKVxuXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9lbWl0KCdkcmFpbicpXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIF9lbWl0ICh0eXBlLCBkYXRhKSB7XG4gICAgY29uc3QgdGFyZ2V0ID0gdGhpc1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSAnb3Blbic6XG4gICAgICAgIHRoaXMucmVhZHlTdGF0ZSA9ICdvcGVuJ1xuICAgICAgICB0aGlzLm9ub3BlbiAmJiB0aGlzLm9ub3Blbih7IHRhcmdldCwgdHlwZSwgZGF0YSB9KVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAnZXJyb3InOlxuICAgICAgICB0aGlzLm9uZXJyb3IgJiYgdGhpcy5vbmVycm9yKHsgdGFyZ2V0LCB0eXBlLCBkYXRhIH0pXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdkYXRhJzpcbiAgICAgICAgdGhpcy5vbmRhdGEgJiYgdGhpcy5vbmRhdGEoeyB0YXJnZXQsIHR5cGUsIGRhdGEgfSlcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ2RyYWluJzpcbiAgICAgICAgdGhpcy5vbmRyYWluICYmIHRoaXMub25kcmFpbih7IHRhcmdldCwgdHlwZSwgZGF0YSB9KVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAnY2xvc2UnOlxuICAgICAgICB0aGlzLnJlYWR5U3RhdGUgPSAnY2xvc2VkJ1xuICAgICAgICB0aGlzLm9uY2xvc2UgJiYgdGhpcy5vbmNsb3NlKHsgdGFyZ2V0LCB0eXBlLCBkYXRhIH0pXG4gICAgICAgIGJyZWFrXG4gICAgfVxuICB9XG59XG4iXX0=