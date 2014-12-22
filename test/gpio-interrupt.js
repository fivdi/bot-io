'use strict';

var assert = require('assert'),
  bot = require('../'),
  pullTypes = bot.pullTypes,
  Gpio = bot.Gpio,
  gpio = new Gpio(bot.pins.p8_07, {
    edge: Gpio.BOTH
  });

gpio.once('ready', function () {
  gpio.on('falling', function (val) {
    console.log('falling ' + val);
  });
  gpio.on('rising', function (val) {
    console.log('rising ' + val);
  });
  gpio.on('both', function (val) {
    console.log('both ' + val);
  });
  setTimeout(function () {
    gpio.value(1);
  }, 1000);
  setTimeout(function () {
    gpio.value(0);
  }, 2000);
  setTimeout(function () {
    gpio.value(1);
  }, 3000);
  setTimeout(function () {
    gpio.edge(Gpio.NONE);
  }, 4000);
});

