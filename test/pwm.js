'use strict';

var bot = require('../'),
  led = new bot.Pwm(bot.pins.p8_13);

led.once('ready', function () {
  var period = led.period(),
    duty = period,
    detla = period / 1000;

  (function updateDuty() {
    led.duty(duty);

    duty -= detla;
    if (duty >= 0) {
      setTimeout(updateDuty, 1);
    }
  }());
});

