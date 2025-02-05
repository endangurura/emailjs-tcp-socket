"use strict";

var _nodeSocket = _interopRequireDefault(require("./node-socket"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/* eslint-disable no-unused-expressions */
describe('TCPSocket Node.js socket unit tests', function () {
  var socket, nodeSocketStub;
  beforeEach(function () {
    socket = _nodeSocket["default"].open('127.0.0.1', 9000, {
      useSecureTransport: false
    });
    expect(socket).to.exist;
    expect(socket._socket).to.exist;

    var Socket = function Socket() {};

    Socket.prototype.on = function () {};

    Socket.prototype.write = function () {};

    Socket.prototype.end = function () {};

    socket._socket = nodeSocketStub = sinon.createStubInstance(Socket);
  });
  describe('open', function () {
    it('should not explode', function () {
      socket = _nodeSocket["default"].open('127.0.0.1', 9000, {
        useSecureTransport: false
      });
      expect(socket).to.exist;
    });
  });
  describe('close', function () {
    it('should not explode', function () {
      nodeSocketStub.end.returns();
      socket.close();
      expect(socket.readyState).to.equal('closing');
    });
  });
  describe('send', function () {
    it('should not explode', function (done) {
      nodeSocketStub.write.yields();

      socket.ondrain = function () {
        done();
      };

      socket.send(new ArrayBuffer());
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9ub2RlLXNvY2tldC11bml0LmpzIl0sIm5hbWVzIjpbImRlc2NyaWJlIiwic29ja2V0Iiwibm9kZVNvY2tldFN0dWIiLCJiZWZvcmVFYWNoIiwiVENQU29ja2V0Iiwib3BlbiIsInVzZVNlY3VyZVRyYW5zcG9ydCIsImV4cGVjdCIsInRvIiwiZXhpc3QiLCJfc29ja2V0IiwiU29ja2V0IiwicHJvdG90eXBlIiwib24iLCJ3cml0ZSIsImVuZCIsInNpbm9uIiwiY3JlYXRlU3R1Ykluc3RhbmNlIiwiaXQiLCJyZXR1cm5zIiwiY2xvc2UiLCJyZWFkeVN0YXRlIiwiZXF1YWwiLCJkb25lIiwieWllbGRzIiwib25kcmFpbiIsInNlbmQiLCJBcnJheUJ1ZmZlciJdLCJtYXBwaW5ncyI6Ijs7QUFFQTs7OztBQUZBO0FBSUFBLFFBQVEsQ0FBQyxxQ0FBRCxFQUF3QyxZQUFZO0FBQzFELE1BQUlDLE1BQUosRUFBWUMsY0FBWjtBQUVBQyxFQUFBQSxVQUFVLENBQUMsWUFBWTtBQUNyQkYsSUFBQUEsTUFBTSxHQUFHRyx1QkFBVUMsSUFBVixDQUFlLFdBQWYsRUFBNEIsSUFBNUIsRUFBa0M7QUFDekNDLE1BQUFBLGtCQUFrQixFQUFFO0FBRHFCLEtBQWxDLENBQVQ7QUFHQUMsSUFBQUEsTUFBTSxDQUFDTixNQUFELENBQU4sQ0FBZU8sRUFBZixDQUFrQkMsS0FBbEI7QUFDQUYsSUFBQUEsTUFBTSxDQUFDTixNQUFNLENBQUNTLE9BQVIsQ0FBTixDQUF1QkYsRUFBdkIsQ0FBMEJDLEtBQTFCOztBQUVBLFFBQUlFLE1BQU0sR0FBRyxTQUFUQSxNQUFTLEdBQVksQ0FBRyxDQUE1Qjs7QUFDQUEsSUFBQUEsTUFBTSxDQUFDQyxTQUFQLENBQWlCQyxFQUFqQixHQUFzQixZQUFZLENBQUcsQ0FBckM7O0FBQ0FGLElBQUFBLE1BQU0sQ0FBQ0MsU0FBUCxDQUFpQkUsS0FBakIsR0FBeUIsWUFBWSxDQUFHLENBQXhDOztBQUNBSCxJQUFBQSxNQUFNLENBQUNDLFNBQVAsQ0FBaUJHLEdBQWpCLEdBQXVCLFlBQVksQ0FBRyxDQUF0Qzs7QUFFQWQsSUFBQUEsTUFBTSxDQUFDUyxPQUFQLEdBQWlCUixjQUFjLEdBQUdjLEtBQUssQ0FBQ0Msa0JBQU4sQ0FBeUJOLE1BQXpCLENBQWxDO0FBQ0QsR0FiUyxDQUFWO0FBZUFYLEVBQUFBLFFBQVEsQ0FBQyxNQUFELEVBQVMsWUFBWTtBQUMzQmtCLElBQUFBLEVBQUUsQ0FBQyxvQkFBRCxFQUF1QixZQUFZO0FBQ25DakIsTUFBQUEsTUFBTSxHQUFHRyx1QkFBVUMsSUFBVixDQUFlLFdBQWYsRUFBNEIsSUFBNUIsRUFBa0M7QUFDekNDLFFBQUFBLGtCQUFrQixFQUFFO0FBRHFCLE9BQWxDLENBQVQ7QUFHQUMsTUFBQUEsTUFBTSxDQUFDTixNQUFELENBQU4sQ0FBZU8sRUFBZixDQUFrQkMsS0FBbEI7QUFDRCxLQUxDLENBQUY7QUFNRCxHQVBPLENBQVI7QUFTQVQsRUFBQUEsUUFBUSxDQUFDLE9BQUQsRUFBVSxZQUFZO0FBQzVCa0IsSUFBQUEsRUFBRSxDQUFDLG9CQUFELEVBQXVCLFlBQVk7QUFDbkNoQixNQUFBQSxjQUFjLENBQUNhLEdBQWYsQ0FBbUJJLE9BQW5CO0FBRUFsQixNQUFBQSxNQUFNLENBQUNtQixLQUFQO0FBQ0FiLE1BQUFBLE1BQU0sQ0FBQ04sTUFBTSxDQUFDb0IsVUFBUixDQUFOLENBQTBCYixFQUExQixDQUE2QmMsS0FBN0IsQ0FBbUMsU0FBbkM7QUFDRCxLQUxDLENBQUY7QUFNRCxHQVBPLENBQVI7QUFTQXRCLEVBQUFBLFFBQVEsQ0FBQyxNQUFELEVBQVMsWUFBWTtBQUMzQmtCLElBQUFBLEVBQUUsQ0FBQyxvQkFBRCxFQUF1QixVQUFVSyxJQUFWLEVBQWdCO0FBQ3ZDckIsTUFBQUEsY0FBYyxDQUFDWSxLQUFmLENBQXFCVSxNQUFyQjs7QUFFQXZCLE1BQUFBLE1BQU0sQ0FBQ3dCLE9BQVAsR0FBaUIsWUFBWTtBQUMzQkYsUUFBQUEsSUFBSTtBQUNMLE9BRkQ7O0FBSUF0QixNQUFBQSxNQUFNLENBQUN5QixJQUFQLENBQVksSUFBSUMsV0FBSixFQUFaO0FBQ0QsS0FSQyxDQUFGO0FBU0QsR0FWTyxDQUFSO0FBV0QsQ0EvQ08sQ0FBUiIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC1leHByZXNzaW9ucyAqL1xuXG5pbXBvcnQgVENQU29ja2V0IGZyb20gJy4vbm9kZS1zb2NrZXQnXG5cbmRlc2NyaWJlKCdUQ1BTb2NrZXQgTm9kZS5qcyBzb2NrZXQgdW5pdCB0ZXN0cycsIGZ1bmN0aW9uICgpIHtcbiAgdmFyIHNvY2tldCwgbm9kZVNvY2tldFN0dWJcblxuICBiZWZvcmVFYWNoKGZ1bmN0aW9uICgpIHtcbiAgICBzb2NrZXQgPSBUQ1BTb2NrZXQub3BlbignMTI3LjAuMC4xJywgOTAwMCwge1xuICAgICAgdXNlU2VjdXJlVHJhbnNwb3J0OiBmYWxzZVxuICAgIH0pXG4gICAgZXhwZWN0KHNvY2tldCkudG8uZXhpc3RcbiAgICBleHBlY3Qoc29ja2V0Ll9zb2NrZXQpLnRvLmV4aXN0XG5cbiAgICB2YXIgU29ja2V0ID0gZnVuY3Rpb24gKCkgeyB9XG4gICAgU29ja2V0LnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uICgpIHsgfVxuICAgIFNvY2tldC5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiAoKSB7IH1cbiAgICBTb2NrZXQucHJvdG90eXBlLmVuZCA9IGZ1bmN0aW9uICgpIHsgfVxuXG4gICAgc29ja2V0Ll9zb2NrZXQgPSBub2RlU29ja2V0U3R1YiA9IHNpbm9uLmNyZWF0ZVN0dWJJbnN0YW5jZShTb2NrZXQpXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ29wZW4nLCBmdW5jdGlvbiAoKSB7XG4gICAgaXQoJ3Nob3VsZCBub3QgZXhwbG9kZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHNvY2tldCA9IFRDUFNvY2tldC5vcGVuKCcxMjcuMC4wLjEnLCA5MDAwLCB7XG4gICAgICAgIHVzZVNlY3VyZVRyYW5zcG9ydDogZmFsc2VcbiAgICAgIH0pXG4gICAgICBleHBlY3Qoc29ja2V0KS50by5leGlzdFxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ2Nsb3NlJywgZnVuY3Rpb24gKCkge1xuICAgIGl0KCdzaG91bGQgbm90IGV4cGxvZGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBub2RlU29ja2V0U3R1Yi5lbmQucmV0dXJucygpXG5cbiAgICAgIHNvY2tldC5jbG9zZSgpXG4gICAgICBleHBlY3Qoc29ja2V0LnJlYWR5U3RhdGUpLnRvLmVxdWFsKCdjbG9zaW5nJylcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCdzZW5kJywgZnVuY3Rpb24gKCkge1xuICAgIGl0KCdzaG91bGQgbm90IGV4cGxvZGUnLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgbm9kZVNvY2tldFN0dWIud3JpdGUueWllbGRzKClcblxuICAgICAgc29ja2V0Lm9uZHJhaW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGRvbmUoKVxuICAgICAgfVxuXG4gICAgICBzb2NrZXQuc2VuZChuZXcgQXJyYXlCdWZmZXIoKSlcbiAgICB9KVxuICB9KVxufSlcbiJdfQ==