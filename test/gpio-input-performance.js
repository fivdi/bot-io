'use strict';

var bot = require('../'),
  button = new bot.Gpio(bot.pins.p8_07, {direction: bot.Gpio.IN});

function test() {
  var time = process.hrtime(),
    opsPerSec,
    ops;

  for (ops = 0; ops !== 100000; ops += 1) {
    button.value();
  }

  time = process.hrtime(time);
  opsPerSec = Math.floor(ops / (time[0] + time[1] / 1E9));

  console.log('ok - ' + __filename);
  console.log('     ' + opsPerSec + ' input ops per second');
}

button.once('ready', function () {
  test();
});

