var bot = require('../'),
  button = new bot.Button(bot.pins.p9_24),
  pressed = 0,
  released = 0;

function printInfo() {
  console.log('pressed: ' + pressed + ', released: ' + released);
}

button.on('pressed', function () {
  pressed += 1;
  printInfo();
});

button.on('released', function () {
  released += 1;
  printInfo();
});

