'use strict';

var bot = require('../'),
  ain = new bot.Ain(bot.pins.p9_36);

ain.once('ready', function () {
  console.log(ain.name + ' - ' + ain.pin.ain.channel + ' - ' + ain.rawValue() + ' - ' + ain.value());
});

