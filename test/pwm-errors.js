'use strict';

var bot = require('../'),
  pwmBad = new bot.Pwm(bot.pins.p8_07), // p8_07 doesn't support pwm, expect error
  pwmGood = new bot.Pwm(bot.pins.p9_42); // p9_42 supports pwm, should work

pwmBad.on('error', function(err) {
  console.log('expected error -> ' + err.stack);
});

pwmGood.on('error', function(err) {
  console.log('unexpected error -> ' + err.stack);
});

pwmGood.once('ready', function () {
  pwmGood.duty(pwmGood.period() / 10);
});

