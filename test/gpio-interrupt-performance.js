'use strict';

var bot = require('../'),
  Gpio = bot.Gpio,
  output = new Gpio(bot.pins.p8_15),
  input = new Gpio(bot.pins.p8_16, {
    direction: Gpio.IN,
    edge: Gpio.BOTH
  });

bot.once('ready', [output, input], function () {
  var time,
    rising = 0,
    falling = 0;

  input.on('rising', function () {
    rising += 1;
    output.value(0);
  });

  input.on('falling', function () {
    falling += 1;
    output.value(1);
  });

  setTimeout(function () {
    var interruptsPerSec;

    time = process.hrtime(time);
    interruptsPerSec = Math.floor((rising + falling) / (time[0] + time[1] / 1E9));

    console.log('ok - ' + __filename);
    console.log('     ' + interruptsPerSec + ' interrupts per second');

    input.edge(Gpio.NONE);
  }, 5000);

  time = process.hrtime();

  output.value(1);
});

