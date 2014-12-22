'use strict';

module.exports.once = function (event, emitters, listener) {
  var count = emitters.length;

  emitters.forEach(function (emitter) {
    emitter.once(event, function () {
      count -= 1;
      if (count === 0) {
        listener();
      }
    });
  });
};

