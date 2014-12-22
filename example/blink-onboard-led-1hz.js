'use strict';

var bot = require('../'),
  led0 = new bot.Led(bot.Led.USR0);

led0.once('ready', function () {
  // Blink at 1Hz. Cycle = 1000ms, on for 500ms, off for 500ms.
  led0.blink();
});

