'use strict';

var bot = require('../'),
  buttons = [
    new bot.Button(bot.pins.p9_23),
    new bot.Button(bot.pins.p9_24)
  ];

buttons.forEach(function (button) {
  button.on('pressed', function () {
    console.log('pressed: ' + button.name);
  });
  button.on('released', function () {
    console.log('released: ' + button.name);
  });
});

