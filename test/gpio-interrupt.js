'use strict';

var assert = require('assert'),
  bot = require('../'),
  pullTypes = bot.pullTypes,
  Gpio = bot.Gpio,
  output = new Gpio(bot.pins.p8_15),
  input = new Gpio(bot.pins.p8_16, {
    direction: Gpio.IN,
    edge: Gpio.BOTH
  });

bot.once('ready', [output, input], function () {
  input.on('falling', function (val) {
    console.log('falling ' + val);
  });
  input.on('rising', function (val) {
    console.log('rising ' + val);
  });
  input.on('both', function (val) {
    console.log('both ' + val);
  });
  setTimeout(function () {
    output.value(1);
  }, 1000);
  setTimeout(function () {
    output.value(0);
  }, 2000);
  setTimeout(function () {
    output.value(1);
  }, 3000);
  setTimeout(function () {
    input.edge(Gpio.NONE);
  }, 4000);
});

