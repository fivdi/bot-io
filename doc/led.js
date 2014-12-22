var bot = require('../'),
  led = new bot.Led(bot.pins.p9_26);

led.on('ready', function () {
  led.heartbeat();
});

