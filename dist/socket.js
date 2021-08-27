"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var TCPSocket;

var DummySocket = /*#__PURE__*/function () {
  function DummySocket() {
    _classCallCheck(this, DummySocket);
  }

  _createClass(DummySocket, null, [{
    key: "open",
    value: function open() {
      throw new Error('Runtime does not offer raw sockets!');
    }
  }]);

  return DummySocket;
}();

if (typeof process !== 'undefined') {
  TCPSocket = require('./node-socket');
} else if (typeof chrome !== 'undefined' && (chrome.socket || chrome.sockets)) {
  TCPSocket = require('./chrome-socket');
} else if ((typeof Windows === "undefined" ? "undefined" : _typeof(Windows)) === 'object' && Windows && Windows.Networking && Windows.Networking.Sockets && Windows.Networking.Sockets.StreamSocket) {
  TCPSocket = require('./windows-socket');
} else if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object' && typeof io === 'function') {
  TCPSocket = require('./socketio-socket');
} else {
  TCPSocket = DummySocket;
}

module.exports = TCPSocket;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb2NrZXQuanMiXSwibmFtZXMiOlsiVENQU29ja2V0IiwiRHVtbXlTb2NrZXQiLCJFcnJvciIsInByb2Nlc3MiLCJyZXF1aXJlIiwiY2hyb21lIiwic29ja2V0Iiwic29ja2V0cyIsIldpbmRvd3MiLCJOZXR3b3JraW5nIiwiU29ja2V0cyIsIlN0cmVhbVNvY2tldCIsIndpbmRvdyIsImlvIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLElBQUlBLFNBQUo7O0lBRU1DLFc7Ozs7Ozs7V0FDSixnQkFBZTtBQUNiLFlBQU0sSUFBSUMsS0FBSixDQUFVLHFDQUFWLENBQU47QUFDRDs7Ozs7O0FBR0gsSUFBSSxPQUFPQyxPQUFQLEtBQW1CLFdBQXZCLEVBQW9DO0FBQ2xDSCxFQUFBQSxTQUFTLEdBQUdJLE9BQU8sQ0FBQyxlQUFELENBQW5CO0FBQ0QsQ0FGRCxNQUVPLElBQUksT0FBT0MsTUFBUCxLQUFrQixXQUFsQixLQUFrQ0EsTUFBTSxDQUFDQyxNQUFQLElBQWlCRCxNQUFNLENBQUNFLE9BQTFELENBQUosRUFBd0U7QUFDN0VQLEVBQUFBLFNBQVMsR0FBR0ksT0FBTyxDQUFDLGlCQUFELENBQW5CO0FBQ0QsQ0FGTSxNQUVBLElBQUksUUFBT0ksT0FBUCx5Q0FBT0EsT0FBUCxPQUFtQixRQUFuQixJQUErQkEsT0FBL0IsSUFBMENBLE9BQU8sQ0FBQ0MsVUFBbEQsSUFBZ0VELE9BQU8sQ0FBQ0MsVUFBUixDQUFtQkMsT0FBbkYsSUFBOEZGLE9BQU8sQ0FBQ0MsVUFBUixDQUFtQkMsT0FBbkIsQ0FBMkJDLFlBQTdILEVBQTJJO0FBQ2hKWCxFQUFBQSxTQUFTLEdBQUdJLE9BQU8sQ0FBQyxrQkFBRCxDQUFuQjtBQUNELENBRk0sTUFFQSxJQUFJLFFBQU9RLE1BQVAseUNBQU9BLE1BQVAsT0FBa0IsUUFBbEIsSUFBOEIsT0FBT0MsRUFBUCxLQUFjLFVBQWhELEVBQTREO0FBQ2pFYixFQUFBQSxTQUFTLEdBQUdJLE9BQU8sQ0FBQyxtQkFBRCxDQUFuQjtBQUNELENBRk0sTUFFQTtBQUNMSixFQUFBQSxTQUFTLEdBQUdDLFdBQVo7QUFDRDs7QUFFRGEsTUFBTSxDQUFDQyxPQUFQLEdBQWlCZixTQUFqQiIsInNvdXJjZXNDb250ZW50IjpbImxldCBUQ1BTb2NrZXRcblxuY2xhc3MgRHVtbXlTb2NrZXQge1xuICBzdGF0aWMgb3BlbiAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdSdW50aW1lIGRvZXMgbm90IG9mZmVyIHJhdyBzb2NrZXRzIScpXG4gIH1cbn1cblxuaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJykge1xuICBUQ1BTb2NrZXQgPSByZXF1aXJlKCcuL25vZGUtc29ja2V0Jylcbn0gZWxzZSBpZiAodHlwZW9mIGNocm9tZSAhPT0gJ3VuZGVmaW5lZCcgJiYgKGNocm9tZS5zb2NrZXQgfHwgY2hyb21lLnNvY2tldHMpKSB7XG4gIFRDUFNvY2tldCA9IHJlcXVpcmUoJy4vY2hyb21lLXNvY2tldCcpXG59IGVsc2UgaWYgKHR5cGVvZiBXaW5kb3dzID09PSAnb2JqZWN0JyAmJiBXaW5kb3dzICYmIFdpbmRvd3MuTmV0d29ya2luZyAmJiBXaW5kb3dzLk5ldHdvcmtpbmcuU29ja2V0cyAmJiBXaW5kb3dzLk5ldHdvcmtpbmcuU29ja2V0cy5TdHJlYW1Tb2NrZXQpIHtcbiAgVENQU29ja2V0ID0gcmVxdWlyZSgnLi93aW5kb3dzLXNvY2tldCcpXG59IGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnICYmIHR5cGVvZiBpbyA9PT0gJ2Z1bmN0aW9uJykge1xuICBUQ1BTb2NrZXQgPSByZXF1aXJlKCcuL3NvY2tldGlvLXNvY2tldCcpXG59IGVsc2Uge1xuICBUQ1BTb2NrZXQgPSBEdW1teVNvY2tldFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRDUFNvY2tldFxuIl19