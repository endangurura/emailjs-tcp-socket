"use strict";

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


TCPSocket = require('./socketio-socket');
module.exports = TCPSocket;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb2NrZXQuanMiXSwibmFtZXMiOlsiVENQU29ja2V0IiwiRHVtbXlTb2NrZXQiLCJFcnJvciIsInJlcXVpcmUiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBLElBQUlBLFNBQUo7O0lBRU1DLFc7Ozs7Ozs7V0FDSixnQkFBZTtBQUNiLFlBQU0sSUFBSUMsS0FBSixDQUFVLHFDQUFWLENBQU47QUFDRDs7Ozs7QUFHSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBRUFGLFNBQVMsR0FBR0csT0FBTyxDQUFDLG1CQUFELENBQW5CO0FBRUFDLE1BQU0sQ0FBQ0MsT0FBUCxHQUFpQkwsU0FBakIiLCJzb3VyY2VzQ29udGVudCI6WyJsZXQgVENQU29ja2V0XG5cbmNsYXNzIER1bW15U29ja2V0IHtcbiAgc3RhdGljIG9wZW4gKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignUnVudGltZSBkb2VzIG5vdCBvZmZlciByYXcgc29ja2V0cyEnKVxuICB9XG59XG5cbi8qXG5pZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnKSB7XG4gIFRDUFNvY2tldCA9IHJlcXVpcmUoJy4vbm9kZS1zb2NrZXQnKVxufSBlbHNlIGlmICh0eXBlb2YgY2hyb21lICE9PSAndW5kZWZpbmVkJyAmJiAoY2hyb21lLnNvY2tldCB8fCBjaHJvbWUuc29ja2V0cykpIHtcbiAgVENQU29ja2V0ID0gcmVxdWlyZSgnLi9jaHJvbWUtc29ja2V0Jylcbn0gZWxzZSBpZiAodHlwZW9mIFdpbmRvd3MgPT09ICdvYmplY3QnICYmIFdpbmRvd3MgJiYgV2luZG93cy5OZXR3b3JraW5nICYmIFdpbmRvd3MuTmV0d29ya2luZy5Tb2NrZXRzICYmIFdpbmRvd3MuTmV0d29ya2luZy5Tb2NrZXRzLlN0cmVhbVNvY2tldCkge1xuICBUQ1BTb2NrZXQgPSByZXF1aXJlKCcuL3dpbmRvd3Mtc29ja2V0Jylcbn0gZWxzZSBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIGlvID09PSAnZnVuY3Rpb24nKSB7XG4gIFRDUFNvY2tldCA9IHJlcXVpcmUoJy4vc29ja2V0aW8tc29ja2V0Jylcbn0gZWxzZSB7XG4gIFRDUFNvY2tldCA9IER1bW15U29ja2V0XG59XG4qL1xuXG5UQ1BTb2NrZXQgPSByZXF1aXJlKCcuL3NvY2tldGlvLXNvY2tldCcpXG5cbm1vZHVsZS5leHBvcnRzID0gVENQU29ja2V0XG4iXX0=