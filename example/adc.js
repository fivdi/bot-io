'use strict';

var bot = require('../'),
  ain = new bot.Ain(bot.pins.p9_36);

ain.once('ready', function () {
  setInterval(function () {
    console.log('value: ' + ain.value() + ', rawValue: ' + ain.rawValue());
  }, 1000);
});

