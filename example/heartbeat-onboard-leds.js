'use strict';

var bot = require('../'),
  Led = bot.Led,
  leds;

leds = [Led.USR0, Led.USR1, Led.USR2, Led.USR3].map(function (usrledName) {
  return new Led(usrledName);
});

bot.once('ready', leds, function () {
  leds.forEach(function (led) {
    led.heartbeat();
  });
});

