"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _ramda = require("ramda");

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

    this.host = new Windows.Networking.HostName(host); // NB! HostName constructor will throw on invalid input

    this.port = port;
    this.ssl = (0, _ramda.propOr)(false, 'useSecureTransport')(options);
    this.bufferedAmount = 0;
    this.readyState = 'connecting';
    this.binaryType = (0, _ramda.propOr)('arraybuffer', 'binaryType')(options);

    if (this.binaryType !== 'arraybuffer') {
      throw new Error('Only arraybuffers are supported!');
    }

    this._socket = new Windows.Networking.Sockets.StreamSocket();
    this._socket.control.keepAlive = true;
    this._socket.control.noDelay = true;
    this._dataReader = null;
    this._dataWriter = null; // set to true if upgrading with STARTTLS

    this._upgrading = false; // cache all client.send calls to this array if currently upgrading

    this._upgradeCache = []; // initial socket type. default is 'plainSocket' (no encryption applied)
    // 'tls12' supports the TLS 1.2, TLS 1.1 and TLS 1.0 protocols but no SSL

    this._protectionLevel = Windows.Networking.Sockets.SocketProtectionLevel[this.ssl ? 'tls12' : 'plainSocket']; // Initiate connection to destination

    this._socket.connectAsync(this.host, this.port, this._protectionLevel).done(function () {
      _this._setStreamHandlers();

      _this._emit('open');
    }, function (e) {
      return _this._emit('error', e);
    });
  }
  /**
   * Initiate Reader and Writer interfaces for the socket
   */


  _createClass(TCPSocket, [{
    key: "_setStreamHandlers",
    value: function _setStreamHandlers() {
      this._dataReader = new Windows.Storage.Streams.DataReader(this._socket.inputStream);
      this._dataReader.inputStreamOptions = Windows.Storage.Streams.InputStreamOptions.partial; // setup writer

      this._dataWriter = new Windows.Storage.Streams.DataWriter(this._socket.outputStream); // start byte reader loop

      this._read();
    }
    /**
     * Emit an error and close socket
     *
     * @param {Error} error Error object
     */

  }, {
    key: "_errorHandler",
    value: function _errorHandler(error) {
      // we ignore errors after close has been called, since all aborted operations
      // will emit their error handlers
      // this will also apply to starttls as a read call is aborted before upgrading the socket
      if (this._upgrading || this.readyState !== 'closing' && this.readyState !== 'closed') {
        this._emit('error', error);

        this.close();
      }
    }
    /**
     * Read available bytes from the socket. This method is recursive  once it ends, it restarts itthis
     */

  }, {
    key: "_read",
    value: function _read() {
      var _this2 = this;

      if (this._upgrading || this.readyState !== 'open' && this.readyState !== 'connecting') {
        return; // do nothing if socket not open
      } // Read up to 4096 bytes from the socket. This is not a fixed number (the mode was set
      // with inputStreamOptions.partial property), so it might return with a smaller
      // amount of bytes.


      this._dataReader.loadAsync(4096).done(function (availableByteCount) {
        if (!availableByteCount) {
          // no bytes available for reading, restart the reading process
          return setImmediate(_this2._read.bind(_this2));
        } // we need an Uint8Array that gets filled with the bytes from the buffer


        var data = new Uint8Array(availableByteCount);

        _this2._dataReader.readBytes(data); // data argument gets filled with the bytes


        _this2._emit('data', data.buffer); // restart reading process


        return setImmediate(_this2._read.bind(_this2));
      }, function (e) {
        return _this2._errorHandler(e);
      });
    } //
    // API
    //

  }, {
    key: "close",
    value: function close() {
      this.readyState = 'closing';

      try {
        this._socket.close();
      } catch (E) {
        this._emit('error', E);
      }

      setImmediate(this._emit.bind(this, 'close'));
    }
  }, {
    key: "send",
    value: function send(data) {
      var _this3 = this;

      if (this.readyState !== 'open') {
        return;
      }

      if (this._upgrading) {
        this._upgradeCache.push(data);

        return;
      } // Write bytes to buffer


      this._dataWriter.writeBytes(data); // Emit buffer contents


      this._dataWriter.storeAsync().done(function () {
        return _this3._emit('drain');
      }, function (e) {
        return _this3._errorHandler(e);
      });
    }
  }, {
    key: "upgradeToSecure",
    value: function upgradeToSecure() {
      var _this4 = this;

      if (this.ssl || this._upgrading) return;
      this._upgrading = true;

      try {
        // release current input stream. this is required to allow socket upgrade
        // write stream is not released as all send calls are cached from this point onwards
        // and not passed to socket until the socket is upgraded
        this._dataReader.detachStream();
      } catch (E) {} // update protection level


      this._protectionLevel = Windows.Networking.Sockets.SocketProtectionLevel.tls12;

      this._socket.upgradeToSslAsync(this._protectionLevel, this.host).done(function () {
        _this4._upgrading = false;
        _this4.ssl = true; // secured connection from now on

        _this4._dataReader = new Windows.Storage.Streams.DataReader(_this4._socket.inputStream);
        _this4._dataReader.inputStreamOptions = Windows.Storage.Streams.InputStreamOptions.partial;

        _this4._read(); // emit all cached requests


        while (_this4._upgradeCache.length) {
          var data = _this4._upgradeCache.shift();

          _this4.send(data);
        }
      }, function (e) {
        _this4._upgrading = false;

        _this4._errorHandler(e);
      });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy93aW5kb3dzLXNvY2tldC5qcyJdLCJuYW1lcyI6WyJUQ1BTb2NrZXQiLCJob3N0IiwicG9ydCIsIm9wdGlvbnMiLCJXaW5kb3dzIiwiTmV0d29ya2luZyIsIkhvc3ROYW1lIiwic3NsIiwiYnVmZmVyZWRBbW91bnQiLCJyZWFkeVN0YXRlIiwiYmluYXJ5VHlwZSIsIkVycm9yIiwiX3NvY2tldCIsIlNvY2tldHMiLCJTdHJlYW1Tb2NrZXQiLCJjb250cm9sIiwia2VlcEFsaXZlIiwibm9EZWxheSIsIl9kYXRhUmVhZGVyIiwiX2RhdGFXcml0ZXIiLCJfdXBncmFkaW5nIiwiX3VwZ3JhZGVDYWNoZSIsIl9wcm90ZWN0aW9uTGV2ZWwiLCJTb2NrZXRQcm90ZWN0aW9uTGV2ZWwiLCJjb25uZWN0QXN5bmMiLCJkb25lIiwiX3NldFN0cmVhbUhhbmRsZXJzIiwiX2VtaXQiLCJlIiwiU3RvcmFnZSIsIlN0cmVhbXMiLCJEYXRhUmVhZGVyIiwiaW5wdXRTdHJlYW0iLCJpbnB1dFN0cmVhbU9wdGlvbnMiLCJJbnB1dFN0cmVhbU9wdGlvbnMiLCJwYXJ0aWFsIiwiRGF0YVdyaXRlciIsIm91dHB1dFN0cmVhbSIsIl9yZWFkIiwiZXJyb3IiLCJjbG9zZSIsImxvYWRBc3luYyIsImF2YWlsYWJsZUJ5dGVDb3VudCIsInNldEltbWVkaWF0ZSIsImJpbmQiLCJkYXRhIiwiVWludDhBcnJheSIsInJlYWRCeXRlcyIsImJ1ZmZlciIsIl9lcnJvckhhbmRsZXIiLCJFIiwicHVzaCIsIndyaXRlQnl0ZXMiLCJzdG9yZUFzeW5jIiwiZGV0YWNoU3RyZWFtIiwidGxzMTIiLCJ1cGdyYWRlVG9Tc2xBc3luYyIsImxlbmd0aCIsInNoaWZ0Iiwic2VuZCIsInR5cGUiLCJ0YXJnZXQiLCJvbm9wZW4iLCJvbmVycm9yIiwib25kYXRhIiwib25kcmFpbiIsIm9uY2xvc2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7Ozs7Ozs7SUFFcUJBLFM7QUFLbkIsMkJBQXNDO0FBQUE7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bWRhJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUQ1BTb2NrZXQge1xuICBzdGF0aWMgb3BlbiAoaG9zdCwgcG9ydCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBUQ1BTb2NrZXQoeyBob3N0LCBwb3J0LCBvcHRpb25zIH0pXG4gIH1cblxuICBjb25zdHJ1Y3RvciAoeyBob3N0LCBwb3J0LCBvcHRpb25zIH0pIHtcbiAgICB0aGlzLmhvc3QgPSBuZXcgV2luZG93cy5OZXR3b3JraW5nLkhvc3ROYW1lKGhvc3QpIC8vIE5CISBIb3N0TmFtZSBjb25zdHJ1Y3RvciB3aWxsIHRocm93IG9uIGludmFsaWQgaW5wdXRcbiAgICB0aGlzLnBvcnQgPSBwb3J0XG4gICAgdGhpcy5zc2wgPSBwcm9wT3IoZmFsc2UsICd1c2VTZWN1cmVUcmFuc3BvcnQnKShvcHRpb25zKVxuICAgIHRoaXMuYnVmZmVyZWRBbW91bnQgPSAwXG4gICAgdGhpcy5yZWFkeVN0YXRlID0gJ2Nvbm5lY3RpbmcnXG4gICAgdGhpcy5iaW5hcnlUeXBlID0gcHJvcE9yKCdhcnJheWJ1ZmZlcicsICdiaW5hcnlUeXBlJykob3B0aW9ucylcblxuICAgIGlmICh0aGlzLmJpbmFyeVR5cGUgIT09ICdhcnJheWJ1ZmZlcicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignT25seSBhcnJheWJ1ZmZlcnMgYXJlIHN1cHBvcnRlZCEnKVxuICAgIH1cblxuICAgIHRoaXMuX3NvY2tldCA9IG5ldyBXaW5kb3dzLk5ldHdvcmtpbmcuU29ja2V0cy5TdHJlYW1Tb2NrZXQoKVxuXG4gICAgdGhpcy5fc29ja2V0LmNvbnRyb2wua2VlcEFsaXZlID0gdHJ1ZVxuICAgIHRoaXMuX3NvY2tldC5jb250cm9sLm5vRGVsYXkgPSB0cnVlXG5cbiAgICB0aGlzLl9kYXRhUmVhZGVyID0gbnVsbFxuICAgIHRoaXMuX2RhdGFXcml0ZXIgPSBudWxsXG5cbiAgICAvLyBzZXQgdG8gdHJ1ZSBpZiB1cGdyYWRpbmcgd2l0aCBTVEFSVFRMU1xuICAgIHRoaXMuX3VwZ3JhZGluZyA9IGZhbHNlXG5cbiAgICAvLyBjYWNoZSBhbGwgY2xpZW50LnNlbmQgY2FsbHMgdG8gdGhpcyBhcnJheSBpZiBjdXJyZW50bHkgdXBncmFkaW5nXG4gICAgdGhpcy5fdXBncmFkZUNhY2hlID0gW11cblxuICAgIC8vIGluaXRpYWwgc29ja2V0IHR5cGUuIGRlZmF1bHQgaXMgJ3BsYWluU29ja2V0JyAobm8gZW5jcnlwdGlvbiBhcHBsaWVkKVxuICAgIC8vICd0bHMxMicgc3VwcG9ydHMgdGhlIFRMUyAxLjIsIFRMUyAxLjEgYW5kIFRMUyAxLjAgcHJvdG9jb2xzIGJ1dCBubyBTU0xcbiAgICB0aGlzLl9wcm90ZWN0aW9uTGV2ZWwgPSBXaW5kb3dzLk5ldHdvcmtpbmcuU29ja2V0cy5Tb2NrZXRQcm90ZWN0aW9uTGV2ZWxbdGhpcy5zc2wgPyAndGxzMTInIDogJ3BsYWluU29ja2V0J11cblxuICAgIC8vIEluaXRpYXRlIGNvbm5lY3Rpb24gdG8gZGVzdGluYXRpb25cbiAgICB0aGlzLl9zb2NrZXRcbiAgICAgIC5jb25uZWN0QXN5bmModGhpcy5ob3N0LCB0aGlzLnBvcnQsIHRoaXMuX3Byb3RlY3Rpb25MZXZlbClcbiAgICAgIC5kb25lKCgpID0+IHtcbiAgICAgICAgdGhpcy5fc2V0U3RyZWFtSGFuZGxlcnMoKVxuICAgICAgICB0aGlzLl9lbWl0KCdvcGVuJylcbiAgICAgIH0sIGUgPT4gdGhpcy5fZW1pdCgnZXJyb3InLCBlKSlcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWF0ZSBSZWFkZXIgYW5kIFdyaXRlciBpbnRlcmZhY2VzIGZvciB0aGUgc29ja2V0XG4gICAqL1xuICBfc2V0U3RyZWFtSGFuZGxlcnMgKCkge1xuICAgIHRoaXMuX2RhdGFSZWFkZXIgPSBuZXcgV2luZG93cy5TdG9yYWdlLlN0cmVhbXMuRGF0YVJlYWRlcih0aGlzLl9zb2NrZXQuaW5wdXRTdHJlYW0pXG4gICAgdGhpcy5fZGF0YVJlYWRlci5pbnB1dFN0cmVhbU9wdGlvbnMgPSBXaW5kb3dzLlN0b3JhZ2UuU3RyZWFtcy5JbnB1dFN0cmVhbU9wdGlvbnMucGFydGlhbFxuXG4gICAgLy8gc2V0dXAgd3JpdGVyXG4gICAgdGhpcy5fZGF0YVdyaXRlciA9IG5ldyBXaW5kb3dzLlN0b3JhZ2UuU3RyZWFtcy5EYXRhV3JpdGVyKHRoaXMuX3NvY2tldC5vdXRwdXRTdHJlYW0pXG5cbiAgICAvLyBzdGFydCBieXRlIHJlYWRlciBsb29wXG4gICAgdGhpcy5fcmVhZCgpXG4gIH1cblxuICAvKipcbiAgICogRW1pdCBhbiBlcnJvciBhbmQgY2xvc2Ugc29ja2V0XG4gICAqXG4gICAqIEBwYXJhbSB7RXJyb3J9IGVycm9yIEVycm9yIG9iamVjdFxuICAgKi9cbiAgX2Vycm9ySGFuZGxlciAoZXJyb3IpIHtcbiAgICAvLyB3ZSBpZ25vcmUgZXJyb3JzIGFmdGVyIGNsb3NlIGhhcyBiZWVuIGNhbGxlZCwgc2luY2UgYWxsIGFib3J0ZWQgb3BlcmF0aW9uc1xuICAgIC8vIHdpbGwgZW1pdCB0aGVpciBlcnJvciBoYW5kbGVyc1xuICAgIC8vIHRoaXMgd2lsbCBhbHNvIGFwcGx5IHRvIHN0YXJ0dGxzIGFzIGEgcmVhZCBjYWxsIGlzIGFib3J0ZWQgYmVmb3JlIHVwZ3JhZGluZyB0aGUgc29ja2V0XG4gICAgaWYgKHRoaXMuX3VwZ3JhZGluZyB8fCAodGhpcy5yZWFkeVN0YXRlICE9PSAnY2xvc2luZycgJiYgdGhpcy5yZWFkeVN0YXRlICE9PSAnY2xvc2VkJykpIHtcbiAgICAgIHRoaXMuX2VtaXQoJ2Vycm9yJywgZXJyb3IpXG4gICAgICB0aGlzLmNsb3NlKClcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVhZCBhdmFpbGFibGUgYnl0ZXMgZnJvbSB0aGUgc29ja2V0LiBUaGlzIG1ldGhvZCBpcyByZWN1cnNpdmUgIG9uY2UgaXQgZW5kcywgaXQgcmVzdGFydHMgaXR0aGlzXG4gICAqL1xuICBfcmVhZCAoKSB7XG4gICAgaWYgKHRoaXMuX3VwZ3JhZGluZyB8fCAodGhpcy5yZWFkeVN0YXRlICE9PSAnb3BlbicgJiYgdGhpcy5yZWFkeVN0YXRlICE9PSAnY29ubmVjdGluZycpKSB7XG4gICAgICByZXR1cm4gLy8gZG8gbm90aGluZyBpZiBzb2NrZXQgbm90IG9wZW5cbiAgICB9XG5cbiAgICAvLyBSZWFkIHVwIHRvIDQwOTYgYnl0ZXMgZnJvbSB0aGUgc29ja2V0LiBUaGlzIGlzIG5vdCBhIGZpeGVkIG51bWJlciAodGhlIG1vZGUgd2FzIHNldFxuICAgIC8vIHdpdGggaW5wdXRTdHJlYW1PcHRpb25zLnBhcnRpYWwgcHJvcGVydHkpLCBzbyBpdCBtaWdodCByZXR1cm4gd2l0aCBhIHNtYWxsZXJcbiAgICAvLyBhbW91bnQgb2YgYnl0ZXMuXG4gICAgdGhpcy5fZGF0YVJlYWRlci5sb2FkQXN5bmMoNDA5NikuZG9uZShhdmFpbGFibGVCeXRlQ291bnQgPT4ge1xuICAgICAgaWYgKCFhdmFpbGFibGVCeXRlQ291bnQpIHtcbiAgICAgICAgLy8gbm8gYnl0ZXMgYXZhaWxhYmxlIGZvciByZWFkaW5nLCByZXN0YXJ0IHRoZSByZWFkaW5nIHByb2Nlc3NcbiAgICAgICAgcmV0dXJuIHNldEltbWVkaWF0ZSh0aGlzLl9yZWFkLmJpbmQodGhpcykpXG4gICAgICB9XG5cbiAgICAgIC8vIHdlIG5lZWQgYW4gVWludDhBcnJheSB0aGF0IGdldHMgZmlsbGVkIHdpdGggdGhlIGJ5dGVzIGZyb20gdGhlIGJ1ZmZlclxuICAgICAgdmFyIGRhdGEgPSBuZXcgVWludDhBcnJheShhdmFpbGFibGVCeXRlQ291bnQpXG4gICAgICB0aGlzLl9kYXRhUmVhZGVyLnJlYWRCeXRlcyhkYXRhKSAvLyBkYXRhIGFyZ3VtZW50IGdldHMgZmlsbGVkIHdpdGggdGhlIGJ5dGVzXG5cbiAgICAgIHRoaXMuX2VtaXQoJ2RhdGEnLCBkYXRhLmJ1ZmZlcilcblxuICAgICAgLy8gcmVzdGFydCByZWFkaW5nIHByb2Nlc3NcbiAgICAgIHJldHVybiBzZXRJbW1lZGlhdGUodGhpcy5fcmVhZC5iaW5kKHRoaXMpKVxuICAgIH0sIGUgPT4gdGhpcy5fZXJyb3JIYW5kbGVyKGUpKVxuICB9XG5cbiAgLy9cbiAgLy8gQVBJXG4gIC8vXG5cbiAgY2xvc2UgKCkge1xuICAgIHRoaXMucmVhZHlTdGF0ZSA9ICdjbG9zaW5nJ1xuXG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuX3NvY2tldC5jbG9zZSgpXG4gICAgfSBjYXRjaCAoRSkge1xuICAgICAgdGhpcy5fZW1pdCgnZXJyb3InLCBFKVxuICAgIH1cblxuICAgIHNldEltbWVkaWF0ZSh0aGlzLl9lbWl0LmJpbmQodGhpcywgJ2Nsb3NlJykpXG4gIH1cblxuICBzZW5kIChkYXRhKSB7XG4gICAgaWYgKHRoaXMucmVhZHlTdGF0ZSAhPT0gJ29wZW4nKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAodGhpcy5fdXBncmFkaW5nKSB7XG4gICAgICB0aGlzLl91cGdyYWRlQ2FjaGUucHVzaChkYXRhKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gV3JpdGUgYnl0ZXMgdG8gYnVmZmVyXG4gICAgdGhpcy5fZGF0YVdyaXRlci53cml0ZUJ5dGVzKGRhdGEpXG5cbiAgICAvLyBFbWl0IGJ1ZmZlciBjb250ZW50c1xuICAgIHRoaXMuX2RhdGFXcml0ZXIuc3RvcmVBc3luYygpLmRvbmUoKCkgPT4gdGhpcy5fZW1pdCgnZHJhaW4nKSwgKGUpID0+IHRoaXMuX2Vycm9ySGFuZGxlcihlKSlcbiAgfVxuXG4gIHVwZ3JhZGVUb1NlY3VyZSAoKSB7XG4gICAgaWYgKHRoaXMuc3NsIHx8IHRoaXMuX3VwZ3JhZGluZykgcmV0dXJuXG5cbiAgICB0aGlzLl91cGdyYWRpbmcgPSB0cnVlXG4gICAgdHJ5IHtcbiAgICAgIC8vIHJlbGVhc2UgY3VycmVudCBpbnB1dCBzdHJlYW0uIHRoaXMgaXMgcmVxdWlyZWQgdG8gYWxsb3cgc29ja2V0IHVwZ3JhZGVcbiAgICAgIC8vIHdyaXRlIHN0cmVhbSBpcyBub3QgcmVsZWFzZWQgYXMgYWxsIHNlbmQgY2FsbHMgYXJlIGNhY2hlZCBmcm9tIHRoaXMgcG9pbnQgb253YXJkc1xuICAgICAgLy8gYW5kIG5vdCBwYXNzZWQgdG8gc29ja2V0IHVudGlsIHRoZSBzb2NrZXQgaXMgdXBncmFkZWRcbiAgICAgIHRoaXMuX2RhdGFSZWFkZXIuZGV0YWNoU3RyZWFtKClcbiAgICB9IGNhdGNoIChFKSB7IH1cblxuICAgIC8vIHVwZGF0ZSBwcm90ZWN0aW9uIGxldmVsXG4gICAgdGhpcy5fcHJvdGVjdGlvbkxldmVsID0gV2luZG93cy5OZXR3b3JraW5nLlNvY2tldHMuU29ja2V0UHJvdGVjdGlvbkxldmVsLnRsczEyXG5cbiAgICB0aGlzLl9zb2NrZXQudXBncmFkZVRvU3NsQXN5bmModGhpcy5fcHJvdGVjdGlvbkxldmVsLCB0aGlzLmhvc3QpLmRvbmUoXG4gICAgICAoKSA9PiB7XG4gICAgICAgIHRoaXMuX3VwZ3JhZGluZyA9IGZhbHNlXG4gICAgICAgIHRoaXMuc3NsID0gdHJ1ZSAvLyBzZWN1cmVkIGNvbm5lY3Rpb24gZnJvbSBub3cgb25cblxuICAgICAgICB0aGlzLl9kYXRhUmVhZGVyID0gbmV3IFdpbmRvd3MuU3RvcmFnZS5TdHJlYW1zLkRhdGFSZWFkZXIodGhpcy5fc29ja2V0LmlucHV0U3RyZWFtKVxuICAgICAgICB0aGlzLl9kYXRhUmVhZGVyLmlucHV0U3RyZWFtT3B0aW9ucyA9IFdpbmRvd3MuU3RvcmFnZS5TdHJlYW1zLklucHV0U3RyZWFtT3B0aW9ucy5wYXJ0aWFsXG4gICAgICAgIHRoaXMuX3JlYWQoKVxuXG4gICAgICAgIC8vIGVtaXQgYWxsIGNhY2hlZCByZXF1ZXN0c1xuICAgICAgICB3aGlsZSAodGhpcy5fdXBncmFkZUNhY2hlLmxlbmd0aCkge1xuICAgICAgICAgIGNvbnN0IGRhdGEgPSB0aGlzLl91cGdyYWRlQ2FjaGUuc2hpZnQoKVxuICAgICAgICAgIHRoaXMuc2VuZChkYXRhKVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgKGUpID0+IHtcbiAgICAgICAgdGhpcy5fdXBncmFkaW5nID0gZmFsc2VcbiAgICAgICAgdGhpcy5fZXJyb3JIYW5kbGVyKGUpXG4gICAgICB9XG4gICAgKVxuICB9XG5cbiAgX2VtaXQgKHR5cGUsIGRhdGEpIHtcbiAgICBjb25zdCB0YXJnZXQgPSB0aGlzXG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlICdvcGVuJzpcbiAgICAgICAgdGhpcy5yZWFkeVN0YXRlID0gJ29wZW4nXG4gICAgICAgIHRoaXMub25vcGVuICYmIHRoaXMub25vcGVuKHsgdGFyZ2V0LCB0eXBlLCBkYXRhIH0pXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdlcnJvcic6XG4gICAgICAgIHRoaXMub25lcnJvciAmJiB0aGlzLm9uZXJyb3IoeyB0YXJnZXQsIHR5cGUsIGRhdGEgfSlcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ2RhdGEnOlxuICAgICAgICB0aGlzLm9uZGF0YSAmJiB0aGlzLm9uZGF0YSh7IHRhcmdldCwgdHlwZSwgZGF0YSB9KVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAnZHJhaW4nOlxuICAgICAgICB0aGlzLm9uZHJhaW4gJiYgdGhpcy5vbmRyYWluKHsgdGFyZ2V0LCB0eXBlLCBkYXRhIH0pXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdjbG9zZSc6XG4gICAgICAgIHRoaXMucmVhZHlTdGF0ZSA9ICdjbG9zZWQnXG4gICAgICAgIHRoaXMub25jbG9zZSAmJiB0aGlzLm9uY2xvc2UoeyB0YXJnZXQsIHR5cGUsIGRhdGEgfSlcbiAgICAgICAgYnJlYWtcbiAgICB9XG4gIH1cbn1cbiJdfQ==