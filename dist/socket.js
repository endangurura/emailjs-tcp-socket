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
/*
if (typeof process !== 'undefined') {
  TCPSocket = require('./node-socket')
} else if (typeof chrome !== 'undefined' && (chrome.socket || chrome.sockets)) {
  TCPSocket = require('./chrome-socket')
} else if (typeof Windows === 'object' && Windows && Windows.Networking && Windows.Networking.Sockets && Windows.Networking.Sockets.StreamSocket) {
  TCPSocket = require('./windows-socket')
} else if (typeof window === 'object' && typeof io === 'function') {
  TCPSocket = require('./socketio-socket')
} else {
  TCPSocket = DummySocket
}
*/


if (typeof chrome !== 'undefined' && (chrome.socket || chrome.sockets)) {
  TCPSocket = require('./chrome-socket');
} else if ((typeof Windows === "undefined" ? "undefined" : _typeof(Windows)) === 'object' && Windows && Windows.Networking && Windows.Networking.Sockets && Windows.Networking.Sockets.StreamSocket) {
  TCPSocket = require('./windows-socket');
} else if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object' && typeof io === 'function') {
  TCPSocket = require('./socketio-socket');
} else {
  TCPSocket = DummySocket;
}

module.exports = TCPSocket;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb2NrZXQuanMiXSwibmFtZXMiOlsiVENQU29ja2V0IiwiRHVtbXlTb2NrZXQiLCJFcnJvciIsImNocm9tZSIsInNvY2tldCIsInNvY2tldHMiLCJyZXF1aXJlIiwiV2luZG93cyIsIk5ldHdvcmtpbmciLCJTb2NrZXRzIiwiU3RyZWFtU29ja2V0Iiwid2luZG93IiwiaW8iLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBSUEsU0FBSjs7SUFFTUMsVzs7Ozs7OztXQUNKLGdCQUFlO0FBQ2IsWUFBTSxJQUFJQyxLQUFKLENBQVUscUNBQVYsQ0FBTjtBQUNEOzs7OztBQUdIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFFQSxJQUFJLE9BQU9DLE1BQVAsS0FBa0IsV0FBbEIsS0FBa0NBLE1BQU0sQ0FBQ0MsTUFBUCxJQUFpQkQsTUFBTSxDQUFDRSxPQUExRCxDQUFKLEVBQXdFO0FBQ3RFTCxFQUFBQSxTQUFTLEdBQUdNLE9BQU8sQ0FBQyxpQkFBRCxDQUFuQjtBQUNELENBRkQsTUFFTyxJQUFJLFFBQU9DLE9BQVAseUNBQU9BLE9BQVAsT0FBbUIsUUFBbkIsSUFBK0JBLE9BQS9CLElBQTBDQSxPQUFPLENBQUNDLFVBQWxELElBQWdFRCxPQUFPLENBQUNDLFVBQVIsQ0FBbUJDLE9BQW5GLElBQThGRixPQUFPLENBQUNDLFVBQVIsQ0FBbUJDLE9BQW5CLENBQTJCQyxZQUE3SCxFQUEySTtBQUNoSlYsRUFBQUEsU0FBUyxHQUFHTSxPQUFPLENBQUMsa0JBQUQsQ0FBbkI7QUFDRCxDQUZNLE1BRUEsSUFBSSxRQUFPSyxNQUFQLHlDQUFPQSxNQUFQLE9BQWtCLFFBQWxCLElBQThCLE9BQU9DLEVBQVAsS0FBYyxVQUFoRCxFQUE0RDtBQUNqRVosRUFBQUEsU0FBUyxHQUFHTSxPQUFPLENBQUMsbUJBQUQsQ0FBbkI7QUFDRCxDQUZNLE1BRUE7QUFDTE4sRUFBQUEsU0FBUyxHQUFHQyxXQUFaO0FBQ0Q7O0FBRURZLE1BQU0sQ0FBQ0MsT0FBUCxHQUFpQmQsU0FBakIiLCJzb3VyY2VzQ29udGVudCI6WyJsZXQgVENQU29ja2V0XG5cbmNsYXNzIER1bW15U29ja2V0IHtcbiAgc3RhdGljIG9wZW4gKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignUnVudGltZSBkb2VzIG5vdCBvZmZlciByYXcgc29ja2V0cyEnKVxuICB9XG59XG5cbi8qXG5pZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnKSB7XG4gIFRDUFNvY2tldCA9IHJlcXVpcmUoJy4vbm9kZS1zb2NrZXQnKVxufSBlbHNlIGlmICh0eXBlb2YgY2hyb21lICE9PSAndW5kZWZpbmVkJyAmJiAoY2hyb21lLnNvY2tldCB8fCBjaHJvbWUuc29ja2V0cykpIHtcbiAgVENQU29ja2V0ID0gcmVxdWlyZSgnLi9jaHJvbWUtc29ja2V0Jylcbn0gZWxzZSBpZiAodHlwZW9mIFdpbmRvd3MgPT09ICdvYmplY3QnICYmIFdpbmRvd3MgJiYgV2luZG93cy5OZXR3b3JraW5nICYmIFdpbmRvd3MuTmV0d29ya2luZy5Tb2NrZXRzICYmIFdpbmRvd3MuTmV0d29ya2luZy5Tb2NrZXRzLlN0cmVhbVNvY2tldCkge1xuICBUQ1BTb2NrZXQgPSByZXF1aXJlKCcuL3dpbmRvd3Mtc29ja2V0Jylcbn0gZWxzZSBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIGlvID09PSAnZnVuY3Rpb24nKSB7XG4gIFRDUFNvY2tldCA9IHJlcXVpcmUoJy4vc29ja2V0aW8tc29ja2V0Jylcbn0gZWxzZSB7XG4gIFRDUFNvY2tldCA9IER1bW15U29ja2V0XG59XG4qL1xuXG5pZiAodHlwZW9mIGNocm9tZSAhPT0gJ3VuZGVmaW5lZCcgJiYgKGNocm9tZS5zb2NrZXQgfHwgY2hyb21lLnNvY2tldHMpKSB7XG4gIFRDUFNvY2tldCA9IHJlcXVpcmUoJy4vY2hyb21lLXNvY2tldCcpXG59IGVsc2UgaWYgKHR5cGVvZiBXaW5kb3dzID09PSAnb2JqZWN0JyAmJiBXaW5kb3dzICYmIFdpbmRvd3MuTmV0d29ya2luZyAmJiBXaW5kb3dzLk5ldHdvcmtpbmcuU29ja2V0cyAmJiBXaW5kb3dzLk5ldHdvcmtpbmcuU29ja2V0cy5TdHJlYW1Tb2NrZXQpIHtcbiAgVENQU29ja2V0ID0gcmVxdWlyZSgnLi93aW5kb3dzLXNvY2tldCcpXG59IGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnICYmIHR5cGVvZiBpbyA9PT0gJ2Z1bmN0aW9uJykge1xuICBUQ1BTb2NrZXQgPSByZXF1aXJlKCcuL3NvY2tldGlvLXNvY2tldCcpXG59IGVsc2Uge1xuICBUQ1BTb2NrZXQgPSBEdW1teVNvY2tldFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRDUFNvY2tldFxuIl19