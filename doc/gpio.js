var bot = require('../'),
  button = new bot.Gpio(bot.pins.p9_24, {
    direction: bot.Gpio.IN,
    pullType: bot.pullTypes.PULL_UP
  }),
  led = new bot.Gpio(bot.pins.p9_26);

bot.once('ready', [button, led], function () {
  setInterval(function() {
    led.value(button.value() ^ 1);
  }, 20);
});

