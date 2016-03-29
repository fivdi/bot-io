'use strict';

var bot = require('../'),
  buttons = [
    new bot.Button(bot.pins.p9_23),
    new bot.Button(bot.pins.p9_24)
  ];

bot.once('ready', buttons, function () {
  setInterval(function () {

    buttons.forEach(function (button) {
      if (button.pressed()) {
        console.log('pressed: ' + button.name);
      }
      if (button.held()) {
        console.log('held: ' + button.name);
      }
      if (button.released()) {
        console.log('released: ' + button.name);
      }
    });
    
  }, 250);
});

