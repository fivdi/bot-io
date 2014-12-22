'use strict';

var bot = require('../'),
  led1 = new bot.Led(bot.pins.p9_26),
  led2 = new bot.Led(bot.pins.p9_27);

bot.once('ready', [led1, led2], function () {
  led1.heartbeat();
  led2.heartbeat();
});

