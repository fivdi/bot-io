'use strict';

var bot = require('../'),
  led1 = new bot.Led(bot.pins.p9_26),
  led2 = new bot.Led(bot.pins.p9_27);

bot.once('ready', [led1, led2], function () {
  led1.blink(500, 500); // Blink at 1Hz. Cycle = 1000ms, on for 500ms, off for 500ms.
  led2.blink(1, 19);    // Blink at 50Hz. Cycle = 20ms, on for 1ms, off for 19ms.
});

