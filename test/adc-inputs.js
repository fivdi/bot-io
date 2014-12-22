'use strict';

var bot = require('../'),
  analogInputs = [
    new bot.Ain(bot.pins.p9_33),
    new bot.Ain(bot.pins.p9_35),
    new bot.Ain(bot.pins.p9_36),
    new bot.Ain(bot.pins.p9_37),
    new bot.Ain(bot.pins.p9_38),
    new bot.Ain(bot.pins.p9_39),
    new bot.Ain(bot.pins.p9_40)
  ];

analogInputs.forEach(function (ain) {
  ain.once('ready', function () {
    console.log(ain.name + ' - ' + ain.pin.ain.vsenseName + ' - ' + ain.rawValue() + ' - ' + ain.value());
  });
});

