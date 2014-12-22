'use strict';

var bot = require('../'),
  ain = new bot.Ain(bot.pins.p9_33);

function test() {
  var time = process.hrtime(),
    opsPerSec,
    ops;

  for (ops = 0; ops !== 3000; ops += 1) {
    ain.rawValue();
  }

  time = process.hrtime(time);
  opsPerSec = Math.floor(ops / (time[0] + time[1] / 1E9));

  console.log('ok - ' + __filename);
  console.log('     ' + opsPerSec + ' adc ops per second');
}

ain.once('ready', function () {
  test();
});

