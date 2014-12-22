'use strict';

var bot = require('../'),
  out = new bot.Gpio(bot.pins.p8_07);

function test() {
  var time = process.hrtime(),
    state = 0,
    opsPerSec,
    ops;

  for (ops = 0; ops !== 100000; ops += 1) {
    out.value(state ^= 1);
  }

  time = process.hrtime(time);
  opsPerSec = Math.floor(ops / (time[0] + time[1] / 1E9));

  console.log('ok - ' + __filename);
  console.log('     ' + opsPerSec + ' output ops per second');
}

out.once('ready', function () {
  test();
});

