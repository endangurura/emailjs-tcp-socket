"use strict";

var _socketioSocket = _interopRequireDefault(require("./socketio-socket"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/* eslint-disable no-unused-expressions */
describe('TcpSocket websocket unit tests', function () {
  var stubIo, socket;

  var Io = function Io() {};

  Io.prototype.on = function () {};

  Io.prototype.emit = function () {};

  Io.prototype.disconnect = function () {};

  beforeEach(function (done) {
    stubIo = sinon.createStubInstance(Io);
    global.window = {
      location: {
        origin: 'hostname.io'
      }
    };

    global.io = function () {
      return stubIo;
    };

    stubIo.emit.withArgs('open').yieldsAsync('hostname.io');
    socket = _socketioSocket["default"].open('127.0.0.1', 9000, {
      useSecureTransport: false,
      ca: '-----BEGIN CERTIFICATE-----\r\nMIIEBDCCAuygAwIBAgIDAjppMA0GCSqGSIb3DQEBBQUAMEIxCzAJBgNVBAYTAlVT\r\nMRYwFAYDVQQKEw1HZW9UcnVzdCBJbmMuMRswGQYDVQQDExJHZW9UcnVzdCBHbG9i\r\nYWwgQ0EwHhcNMTMwNDA1MTUxNTU1WhcNMTUwNDA0MTUxNTU1WjBJMQswCQYDVQQG\r\nEwJVUzETMBEGA1UEChMKR29vZ2xlIEluYzElMCMGA1UEAxMcR29vZ2xlIEludGVy\r\nbmV0IEF1dGhvcml0eSBHMjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEB\r\nAJwqBHdc2FCROgajguDYUEi8iT/xGXAaiEZ+4I/F8YnOIe5a/mENtzJEiaB0C1NP\r\nVaTOgmKV7utZX8bhBYASxF6UP7xbSDj0U/ck5vuR6RXEz/RTDfRK/J9U3n2+oGtv\r\nh8DQUB8oMANA2ghzUWx//zo8pzcGjr1LEQTrfSTe5vn8MXH7lNVg8y5Kr0LSy+rE\r\nahqyzFPdFUuLH8gZYR/Nnag+YyuENWllhMgZxUYi+FOVvuOAShDGKuy6lyARxzmZ\r\nEASg8GF6lSWMTlJ14rbtCMoU/M4iarNOz0YDl5cDfsCx3nuvRTPPuj5xt970JSXC\r\nDTWJnZ37DhF5iR43xa+OcmkCAwEAAaOB+zCB+DAfBgNVHSMEGDAWgBTAephojYn7\r\nqwVkDBF9qn1luMrMTjAdBgNVHQ4EFgQUSt0GFhu89mi1dvWBtrtiGrpagS8wEgYD\r\nVR0TAQH/BAgwBgEB/wIBADAOBgNVHQ8BAf8EBAMCAQYwOgYDVR0fBDMwMTAvoC2g\r\nK4YpaHR0cDovL2NybC5nZW90cnVzdC5jb20vY3Jscy9ndGdsb2JhbC5jcmwwPQYI\r\nKwYBBQUHAQEEMTAvMC0GCCsGAQUFBzABhiFodHRwOi8vZ3RnbG9iYWwtb2NzcC5n\r\nZW90cnVzdC5jb20wFwYDVR0gBBAwDjAMBgorBgEEAdZ5AgUBMA0GCSqGSIb3DQEB\r\nBQUAA4IBAQA21waAESetKhSbOHezI6B1WLuxfoNCunLaHtiONgaX4PCVOzf9G0JY\r\n/iLIa704XtE7JW4S615ndkZAkNoUyHgN7ZVm2o6Gb4ChulYylYbc3GrKBIxbf/a/\r\nzG+FA1jDaFETzf3I93k9mTXwVqO94FntT0QJo544evZG0R0SnU++0ED8Vf4GXjza\r\nHFa9llF7b1cq26KqltyMdMKVvvBulRP/F/A8rLIQjcxz++iPAsbw+zOzlTvjwsto\r\nWHPbqCRiOwY1nQ2pM714A5AuTHhdUDqB1O6gyHA43LL5Z/qHQF1hwFGPa4NrzQU6\r\nyuGnBXj8ytqU0CwIPX4WecigUCAkVDNx\r\n-----END CERTIFICATE-----'
    });
    expect(socket).to.exist;
    expect(socket._ca).to.exist;
    stubIo.on.withArgs('data').callsArgWithAsync(1, new Uint8Array([0, 1, 2]).buffer);

    socket.onopen = function (event) {
      expect(event.data.proxyHostname).to.equal('hostname.io');
    };

    socket.ondata = function (e) {
      expect(new Uint8Array(e.data)).to.deep.equal(new Uint8Array([0, 1, 2]));
      done();
    };
  });
  describe('close', function () {
    it('should work', function (done) {
      socket.onclose = function () {
        expect(socket.readyState).to.equal('closed');
        expect(stubIo.disconnect.callCount).to.equal(1);
        expect(stubIo.emit.withArgs('end').callCount).to.equal(1);
        done();
      };

      socket.close();
    });
  });
  describe('send', function () {
    it('should not explode', function (done) {
      stubIo.emit.withArgs('data').callsArgWithAsync(2);

      socket.ondrain = function () {
        done();
      };

      socket.send(new Uint8Array([0, 1, 2]).buffer);
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb2NrZXRpby1zb2NrZXQtdW5pdC5qcyJdLCJuYW1lcyI6WyJkZXNjcmliZSIsInN0dWJJbyIsInNvY2tldCIsIklvIiwicHJvdG90eXBlIiwib24iLCJlbWl0IiwiZGlzY29ubmVjdCIsImJlZm9yZUVhY2giLCJkb25lIiwic2lub24iLCJjcmVhdGVTdHViSW5zdGFuY2UiLCJnbG9iYWwiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsIm9yaWdpbiIsImlvIiwid2l0aEFyZ3MiLCJ5aWVsZHNBc3luYyIsIlRDUFNvY2tldCIsIm9wZW4iLCJ1c2VTZWN1cmVUcmFuc3BvcnQiLCJjYSIsImV4cGVjdCIsInRvIiwiZXhpc3QiLCJfY2EiLCJjYWxsc0FyZ1dpdGhBc3luYyIsIlVpbnQ4QXJyYXkiLCJidWZmZXIiLCJvbm9wZW4iLCJldmVudCIsImRhdGEiLCJwcm94eUhvc3RuYW1lIiwiZXF1YWwiLCJvbmRhdGEiLCJlIiwiZGVlcCIsIml0Iiwib25jbG9zZSIsInJlYWR5U3RhdGUiLCJjYWxsQ291bnQiLCJjbG9zZSIsIm9uZHJhaW4iLCJzZW5kIl0sIm1hcHBpbmdzIjoiOztBQUVBOzs7O0FBRkE7QUFJQUEsUUFBUSxDQUFDLGdDQUFELEVBQW1DLFlBQVk7QUFDckQsTUFBSUMsTUFBSixFQUFZQyxNQUFaOztBQUVBLE1BQUlDLEVBQUUsR0FBRyxTQUFMQSxFQUFLLEdBQVksQ0FBRyxDQUF4Qjs7QUFDQUEsRUFBQUEsRUFBRSxDQUFDQyxTQUFILENBQWFDLEVBQWIsR0FBa0IsWUFBWSxDQUFHLENBQWpDOztBQUNBRixFQUFBQSxFQUFFLENBQUNDLFNBQUgsQ0FBYUUsSUFBYixHQUFvQixZQUFZLENBQUcsQ0FBbkM7O0FBQ0FILEVBQUFBLEVBQUUsQ0FBQ0MsU0FBSCxDQUFhRyxVQUFiLEdBQTBCLFlBQVksQ0FBRyxDQUF6Qzs7QUFFQUMsRUFBQUEsVUFBVSxDQUFDLFVBQVVDLElBQVYsRUFBZ0I7QUFDekJSLElBQUFBLE1BQU0sR0FBR1MsS0FBSyxDQUFD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QUVBekIsTUFBQUEsTUFBTSxDQUFDeUMsT0FBUCxHQUFpQixZQUFZO0FBQzNCbEMsUUFBQUEsSUFBSTtBQUNMLE9BRkQ7O0FBSUFQLE1BQUFBLE1BQU0sQ0FBQzBDLElBQVAsQ0FBWSxJQUFJaEIsVUFBSixDQUFlLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBQWYsRUFBMEJDLE1BQXRDO0FBQ0QsS0FSQyxDQUFGO0FBU0QsR0FWTyxDQUFSO0FBV0QsQ0EvRE8sQ0FBUiIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC1leHByZXNzaW9ucyAqL1xuXG5pbXBvcnQgVENQU29ja2V0IGZyb20gJy4vc29ja2V0aW8tc29ja2V0J1xuXG5kZXNjcmliZSgnVGNwU29ja2V0IHdlYnNvY2tldCB1bml0IHRlc3RzJywgZnVuY3Rpb24gKCkge1xuICB2YXIgc3R1YklvLCBzb2NrZXRcblxuICB2YXIgSW8gPSBmdW5jdGlvbiAoKSB7IH1cbiAgSW8ucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKCkgeyB9XG4gIElvLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gKCkgeyB9XG4gIElvLnByb3RvdHlwZS5kaXNjb25uZWN0ID0gZnVuY3Rpb24gKCkgeyB9XG5cbiAgYmVmb3JlRWFjaChmdW5jdGlvbiAoZG9uZSkge1xuICAgIHN0dWJJbyA9IHNpbm9uLmNyZWF0ZVN0dWJJbnN0YW5jZShJbylcblxuICAgIGdsb2JhbC53aW5kb3cgPSB7XG4gICAgICBsb2NhdGlvbjoge1xuICAgICAgICBvcmlnaW46ICdob3N0bmFtZS5pbydcbiAgICAgIH1cbiAgICB9XG4gICAgZ2xvYmFsLmlvID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHN0dWJJb1xuICAgIH1cblxuICAgIHN0dWJJby5lbWl0LndpdGhBcmdzKCdvcGVuJykueWllbGRzQXN5bmMoJ2hvc3RuYW1lLmlvJylcblxuICAgIHNvY2tldCA9IFRDUFNvY2tldC5vcGVuKCcxMjcuMC4wLjEnLCA5MDAwLCB7XG4gICAgICB1c2VTZWN1cmVUcmFuc3BvcnQ6IGZhbHNlLFxuICAgICAgY2E6ICctLS0tLUJFR0lOIENFUlRJRklDQVRFLS0tLS1cXHJcXG5NSUlFQkRDQ0F1eWdBd0lCQWdJREFqcHBNQTBHQ1NxR1NJYjNEUUVCQlFVQU1FSXhDekFKQmdOVkJBWVRBbFZUXFxyXFxuTVJZd0ZBWURWUVFLRXcxSFpXOVVjblZ6ZENCSmJtTXVNUnN3R1FZRFZRUURFeEpIWlc5VWNuVnpkQ0JIYkc5aVxcclxcbllXd2dRMEV3SGhjTk1UTXdOREExTVRVeE5UVTFXaGNOTVRVd05EQTBNVFV4TlRVMVdqQkpNUXN3Q1FZRFZRUUdcXHJcXG5Fd0pWVXpFVE1CRUdBMVVFQ2hNS1IyOXZaMnhsSUVsdVl6RWxNQ01HQTFVRUF4TWNSMjl2WjJ4bElFbHVkR1Z5XFxyXFxuYm1WMElFRjFkR2h2Y21sMGVTQkhNakNDQVNJd0RRWUpLb1pJaHZjTkFRRUJCUUFEZ2dFUEFEQ0NBUW9DZ2dFQlxcclxcbkFKd3FCSGRjMkZDUk9nYWpndURZVUVpOGlUL3hHWEFhaUVaKzRJL0Y4WW5PSWU1YS9tRU50ekpFaWFCMEMxTlBcXHJcXG5WYVRPZ21LVjd1dFpYOGJoQllBU3hGNlVQN3hiU0RqMFUvY2s1dnVSNlJYRXovUlREZlJLL0o5VTNuMitvR3R2XFxyXFxuaDhEUVVCOG9NQU5BMmdoelVXeC8vem84cHpjR2pyMUxFUVRyZlNUZTV2bjhNWEg3bE5WZzh5NUtyMExTeStyRVxcclxcbmFocXl6RlBkRlV1TEg4Z1pZUi9ObmFnK1l5dUVOV2xsaE1nWnhVWWkrRk9WdnVPQVNoREdLdXk2bHlBUnh6bVpcXHJcXG5FQVNnOEdGNmxTV01UbEoxNHJidENNb1UvTTRpYXJOT3owWURsNWNEZnNDeDNudXZSVFBQdWo1eHQ5NzBKU1hDXFxyXFxuRFRXSm5aMzdEaEY1aVI0M3hhK09jbWtDQXdFQUFhT0IrekNCK0RBZkJnTlZIU01FR0RBV2dCVEFlcGhvalluN1xcclxcbnF3VmtEQkY5cW4xbHVNck1UakFkQmdOVkhRNEVGZ1FVU3QwR0ZodTg5bWkxZHZXQnRydGlHcnBhZ1M4d0VnWURcXHJcXG5WUjBUQVFIL0JBZ3dCZ0VCL3dJQkFEQU9CZ05WSFE4QkFmOEVCQU1DQVFZd09nWURWUjBmQkRNd01UQXZvQzJnXFxyXFxuSzRZcGFIUjBjRG92TDJOeWJDNW5aVzkwY25WemRDNWpiMjB2WTNKc2N5OW5kR2RzYjJKaGJDNWpjbXd3UFFZSVxcclxcbkt3WUJCUVVIQVFFRU1UQXZNQzBHQ0NzR0FRVUZCekFCaGlGb2RIUndPaTh2WjNSbmJHOWlZV3d0YjJOemNDNW5cXHJcXG5aVzkwY25WemRDNWpiMjB3RndZRFZSMGdCQkF3RGpBTUJnb3JCZ0VFQWRaNUFnVUJNQTBHQ1NxR1NJYjNEUUVCXFxyXFxuQlFVQUE0SUJBUUEyMXdhQUVTZXRLaFNiT0hlekk2QjFXTHV4Zm9OQ3VuTGFIdGlPTmdhWDRQQ1ZPemY5RzBKWVxcclxcbi9pTElhNzA0WHRFN0pXNFM2MTVuZGtaQWtOb1V5SGdON1pWbTJvNkdiNENodWxZeWxZYmMzR3JLQkl4YmYvYS9cXHJcXG56RytGQTFqRGFGRVR6ZjNJOTNrOW1UWHdWcU85NEZudFQwUUpvNTQ0ZXZaRzBSMFNuVSsrMEVEOFZmNEdYanphXFxyXFxuSEZhOWxsRjdiMWNxMjZLcWx0eU1kTUtWdnZCdWxSUC9GL0E4ckxJUWpjeHorK2lQQXNidyt6T3psVHZqd3N0b1xcclxcbldIUGJxQ1JpT3dZMW5RMnBNNzE0QTVBdVRIaGRVRHFCMU82Z3lIQTQzTEw1Wi9xSFFGMWh3RkdQYTROcnpRVTZcXHJcXG55dUduQlhqOHl0cVUwQ3dJUFg0V2VjaWdVQ0FrVkROeFxcclxcbi0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0nXG4gICAgfSlcbiAgICBleHBlY3Qoc29ja2V0KS50by5leGlzdFxuICAgIGV4cGVjdChzb2NrZXQuX2NhKS50by5leGlzdFxuXG4gICAgc3R1YklvLm9uLndpdGhBcmdzKCdkYXRhJykuY2FsbHNBcmdXaXRoQXN5bmMoMSwgbmV3IFVpbnQ4QXJyYXkoWzAsIDEsIDJdKS5idWZmZXIpXG4gICAgc29ja2V0Lm9ub3BlbiA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgZXhwZWN0KGV2ZW50LmRhdGEucHJveHlIb3N0bmFtZSkudG8uZXF1YWwoJ2hvc3RuYW1lLmlvJylcbiAgICB9XG4gICAgc29ja2V0Lm9uZGF0YSA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICBleHBlY3QobmV3IFVpbnQ4QXJyYXkoZS5kYXRhKSkudG8uZGVlcC5lcXVhbChuZXcgVWludDhBcnJheShbMCwgMSwgMl0pKVxuICAgICAgZG9uZSgpXG4gICAgfVxuICB9KVxuXG4gIGRlc2NyaWJlKCdjbG9zZScsIGZ1bmN0aW9uICgpIHtcbiAgICBpdCgnc2hvdWxkIHdvcmsnLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgc29ja2V0Lm9uY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGV4cGVjdChzb2NrZXQucmVhZHlTdGF0ZSkudG8uZXF1YWwoJ2Nsb3NlZCcpXG4gICAgICAgIGV4cGVjdChzdHViSW8uZGlzY29ubmVjdC5jYWxsQ291bnQpLnRvLmVxdWFsKDEpXG4gICAgICAgIGV4cGVjdChzdHViSW8uZW1pdC53aXRoQXJncygnZW5kJykuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgICAgICBkb25lKClcbiAgICAgIH1cblxuICAgICAgc29ja2V0LmNsb3NlKClcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCdzZW5kJywgZnVuY3Rpb24gKCkge1xuICAgIGl0KCdzaG91bGQgbm90IGV4cGxvZGUnLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgc3R1YklvLmVtaXQud2l0aEFyZ3MoJ2RhdGEnKS5jYWxsc0FyZ1dpdGhBc3luYygyKVxuXG4gICAgICBzb2NrZXQub25kcmFpbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZG9uZSgpXG4gICAgICB9XG5cbiAgICAgIHNvY2tldC5zZW5kKG5ldyBVaW50OEFycmF5KFswLCAxLCAyXSkuYnVmZmVyKVxuICAgIH0pXG4gIH0pXG59KVxuIl19