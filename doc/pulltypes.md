## pullTypes Object - Pull Type Constants

When creating objects such as Buttons and Gpios there's a pullType option
for specifying whether or not the internal pull-up or pull-down resistor
should be enabled on the corresponding pin. The pullTypes object has three
constants for specifying the pull type in such cases.

```js
var bot = require('bot-io'),
  button = new bot.Gpio(bot.pins.p9_23, {
    direction: bot.Gpio.IN,
    pullType: bot.pullTypes.PULL_UP
  });
```

### Constant: pullTypes.NONE
Niether the pull-up nor the pull-down resistor should be enabled.

### Constant: pullTypes.PULL_UP
Enable pull-up resistor.

### Constant: pullTypes.PULL_DOWN
Enable pull-down resistor.

