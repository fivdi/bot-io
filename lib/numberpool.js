'use strict';

var NUMBER_POOL_MAX = 1000,
  NUMBER_POOL = [];

(function () {
  var num = 0;

  for (num = 0; num <= NUMBER_POOL_MAX; num += 1) {
    NUMBER_POOL.push(new Buffer('' + num));
  }
}());

function number(num) {
  if (num >= 0 && num <= NUMBER_POOL_MAX) {
    return NUMBER_POOL[num];
  }

  return new Buffer('' + num);
}

module.exports = number;

