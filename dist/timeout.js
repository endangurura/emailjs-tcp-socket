"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _timers = require("core-js/web/timers");

// setZeroTimeout slightly adapted from
// https://github.com/shahyar/setZeroTimeout-js (CC BY 3.0).
// Provides a function similar to setImmediate() on Chrome.
var timeouts = [];
var msgName = 'hackyVersionOfSetImmediate';

function postTimeout(fn) {
  timeouts.push(fn);
  postMessage(msgName, '*');
}

function handleMessage(event) {
  if (event.source === window && event.data === msgName) {
    if (event.stopPropagation) {
      event.stopPropagation();
    }

    if (timeouts.length) {
      try {
        timeouts.shift()();
      } catch (e) {
        // Throw in an asynchronous closure to prevent setZeroTimeout from hanging due to error
        (0, _timers.setTimeout)(function (e) {
          return function () {
            throw e.stack || e;
          };
        }(e), 0);
      }
    }

    if (timeouts.length) {
      // more left?
      postMessage(msgName, '*');
    }
  }
}

var fn;

if (typeof setImmediate !== 'undefined') {
  fn = setImmediate;
} else if (typeof window !== 'undefined') {
  window.addEventListener('message', handleMessage, true);
  fn = postTimeout;
} else {
  fn = function fn(f) {
    return (0, _timers.setTimeout)(f, 0);
  };
}

var _default = fn;
exports["default"] = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy90aW1lb3V0LmpzIl0sIm5hbWVzIjpbInRpbWVvdXRzIiwibXNnTmFtZSIsInBvc3RUaW1lb3V0IiwiZm4iLCJwdXNoIiwicG9zdE1lc3NhZ2UiLCJoYW5kbGVNZXNzYWdlIiwiZXZlbnQiLCJzb3VyY2UiLCJ3aW5kb3ciLCJkYXRhIiwic3RvcFByb3BhZ2F0aW9uIiwibGVuZ3RoIiwic2hpZnQiLCJlIiwic3RhY2siLCJzZXRJbW1lZGlhdGUiLCJhZGRFdmVudExpc3RlbmVyIiwiZiJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQU1BLFFBQVEsR0FBRyxFQUFqQjtBQUNBLElBQU1DLE9BQU8sR0FBRyw0QkFBaEI7O0FBRUEsU0FBU0MsV0FBVCxDQUFzQkMsRUFBdEIsRUFBMEI7QUFDeEJILEVBQUFBLFFBQVEsQ0FBQ0ksSUFBVCxDQUFjRCxFQUFkO0FBQ0FFLEVBQUFBLFdBQVcsQ0FBQ0osT0FBRCxFQUFVLEdBQVYsQ0FBWDtBQUNEOztBQUNELFNBQVNLLGFBQVQsQ0FBd0JDLEtBQXhCLEVBQStCO0FBQzdCLE1BQUlBLEtBQUssQ0FBQ0MsTUFBTixLQUFpQkMsTUFBakIsSUFBMkJGLEtBQUssQ0FBQ0csSUFBTixLQUFlVCxPQUE5QyxFQUF1RDtBQUNyRCxRQUFJTSxLQUFLLENBQUNJLGVBQVYsRUFBMkI7QUFDekJKLE1BQUFBLEtBQUssQ0FBQ0ksZUFBTjtBQUNEOztBQUNELFFBQUlYLFFBQVEsQ0FBQ1ksTUFBYixFQUFxQjtBQUNuQixVQUFJO0FBQ0ZaLFFBQUFBLFFBQVEsQ0FBQ2EsS0FBVDtBQUNELE9BRkQsQ0FFRSxPQUFPQyxDQUFQLEVBQVU7QUFDVjtBQUNBLGdDQUFZLFVBQVVBLENBQVYsRUFBYTtBQUN2QixpQkFBTyxZQUFZO0FBQ2pCLGtCQUFNQSxDQUFDLENBQUNDLEtBQUYsSUFBV0QsQ0FBakI7QUFDRCxXQUZEO0FBR0QsU0FKVyxDQUlWQSxDQUpVLENBQVosRUFJTyxDQUpQO0FBS0Q7QUFDRjs7QUFDRCxRQUFJZCxRQUFRLENBQUNZLE1BQWIsRUFBcUI7QUFBRTtBQUNyQlAsTUFBQUEsV0FBVyxDQUFDSixPQUFELEVBQVUsR0FBVixDQUFYO0FBQ0Q7QUFDRjtBQUNGOztBQUVELElBQUlFLEVBQUo7O0FBQ0EsSUFBSSxPQUFPYSxZQUFQLEtBQXdCLFdBQTVCLEVBQXlDO0FBQ3ZDYixFQUFBQSxFQUFFLEdBQUdhLFlBQUw7QUFDRCxDQUZELE1BRU8sSUFBSSxPQUFPUCxNQUFQLEtBQWtCLFdBQXRCLEVBQW1DO0FBQ3hDQSxFQUFBQSxNQUFNLENBQUNRLGdCQUFQLENBQXdCLFNBQXhCLEVBQW1DWCxhQUFuQyxFQUFrRCxJQUFsRDtBQUNBSCxFQUFBQSxFQUFFLEdBQUdELFdBQUw7QUFDRCxDQUhNLE1BR0E7QUFDTEMsRUFBQUEsRUFBRSxHQUFHLFlBQUFlLENBQUM7QUFBQSxXQUFJLHdCQUFXQSxDQUFYLEVBQWMsQ0FBZCxDQUFKO0FBQUEsR0FBTjtBQUNEOztlQUVjZixFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgc2V0VGltZW91dCB9IGZyb20gJ2NvcmUtanMvd2ViL3RpbWVycydcblxuLy8gc2V0WmVyb1RpbWVvdXQgc2xpZ2h0bHkgYWRhcHRlZCBmcm9tXG4vLyBodHRwczovL2dpdGh1Yi5jb20vc2hhaHlhci9zZXRaZXJvVGltZW91dC1qcyAoQ0MgQlkgMy4wKS5cbi8vIFByb3ZpZGVzIGEgZnVuY3Rpb24gc2ltaWxhciB0byBzZXRJbW1lZGlhdGUoKSBvbiBDaHJvbWUuXG5jb25zdCB0aW1lb3V0cyA9IFtdXG5jb25zdCBtc2dOYW1lID0gJ2hhY2t5VmVyc2lvbk9mU2V0SW1tZWRpYXRlJ1xuXG5mdW5jdGlvbiBwb3N0VGltZW91dCAoZm4pIHtcbiAgdGltZW91dHMucHVzaChmbilcbiAgcG9zdE1lc3NhZ2UobXNnTmFtZSwgJyonKVxufVxuZnVuY3Rpb24gaGFuZGxlTWVzc2FnZSAoZXZlbnQpIHtcbiAgaWYgKGV2ZW50LnNvdXJjZSA9PT0gd2luZG93ICYmIGV2ZW50LmRhdGEgPT09IG1zZ05hbWUpIHtcbiAgICBpZiAoZXZlbnQuc3RvcFByb3BhZ2F0aW9uKSB7XG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgIH1cbiAgICBpZiAodGltZW91dHMubGVuZ3RoKSB7XG4gICAgICB0cnkge1xuICAgICAgICB0aW1lb3V0cy5zaGlmdCgpKClcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gVGhyb3cgaW4gYW4gYXN5bmNocm9ub3VzIGNsb3N1cmUgdG8gcHJldmVudCBzZXRaZXJvVGltZW91dCBmcm9tIGhhbmdpbmcgZHVlIHRvIGVycm9yXG4gICAgICAgIHNldFRpbWVvdXQoKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRocm93IGUuc3RhY2sgfHwgZVxuICAgICAgICAgIH1cbiAgICAgICAgfShlKSksIDApXG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aW1lb3V0cy5sZW5ndGgpIHsgLy8gbW9yZSBsZWZ0P1xuICAgICAgcG9zdE1lc3NhZ2UobXNnTmFtZSwgJyonKVxuICAgIH1cbiAgfVxufVxuXG5sZXQgZm5cbmlmICh0eXBlb2Ygc2V0SW1tZWRpYXRlICE9PSAndW5kZWZpbmVkJykge1xuICBmbiA9IHNldEltbWVkaWF0ZVxufSBlbHNlIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGhhbmRsZU1lc3NhZ2UsIHRydWUpXG4gIGZuID0gcG9zdFRpbWVvdXRcbn0gZWxzZSB7XG4gIGZuID0gZiA9PiBzZXRUaW1lb3V0KGYsIDApXG59XG5cbmV4cG9ydCBkZWZhdWx0IGZuXG4iXX0=