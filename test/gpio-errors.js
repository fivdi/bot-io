'use strict';

var assert = require('assert'),
  bot = require('../'),
  Gpio = bot.Gpio,
  pullTypes = bot.pullTypes,
  gpioBad = new Gpio(bot.pins.p9_36), // p9_36 doesn't support pwm, expect error
  gpioGood = new Gpio(bot.pins.p8_07, { // p8_07 supports gpio, should work
    direction: Gpio.IN,
    pullType: pullTypes.PULL_UP
  });

gpioBad.on('error', function(err) {
  console.log('expected error -> ' + err.stack);
});

gpioGood.on('error', function(err) {
  console.log('unexpected error -> ' + err.stack);
});

gpioGood.once('ready', function () {
  assert.equal(gpioGood.value(), 1, 'expected value of 1');
});

