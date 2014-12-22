'use strict';

var bot = require('../'),
  Gpio = bot.Gpio,
  gpio = new Gpio(bot.pins.p8_07, {
    edge: Gpio.BOTH
  });

gpio.once('ready', function () {
  var time,
    rising = 0,
    falling = 0;

  gpio.on('rising', function () {
    rising += 1;
    gpio.value(0);
  });

  gpio.on('falling', function () {
    falling += 1;
    gpio.value(1);
  });

  setTimeout(function () {
    var interruptsPerSec;

    time = process.hrtime(time);
    interruptsPerSec = Math.floor((rising + falling) / (time[0] + time[1] / 1E9));

    console.log('ok - ' + __filename);
    console.log('     ' + interruptsPerSec + ' interrupts per second');

    gpio.edge(Gpio.NONE);
  }, 5000);

  time = process.hrtime();

  gpio.value(1);
});

