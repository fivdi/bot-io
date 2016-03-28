## bot-io

ADC, GPIO, PWM, UARTs, and more with **Node.js** on the BeagleBone Black.

## Features

 * LEDs - Light Emitting Diodes
 * Buttons and Switches
 * ADC - Analog to Digital Conversion
 * GPIO - General Purpose Input Output
 * PWM - Pulse Width Modulation
 * UART - Serial Communication

## Installation

    $ npm install bot-io

## News & Updates

### bot-io v1.0.0 - March 28th 2016

bot-io v1.0.0 dropped support for the 3.8.x kernel and added support for the
4.1.x kernel. bot-io v0.1.1 was the last version of bot-io that supported the
3.8.x kernel.

 * The Ain rawValue() method used to return a millivolt value in the range 0 to 1800. Now it returns a value in the range 0 to 4095.
 * Ain constructor option vsenseScale was removed.
 * The Pwm constant LOW used to be used to represent normal polarity PWM. Now the Pwm constant NORMAL should be used for this purpose.
 * The Pwm constant HIGH used to be used to represent inversed polarity PWM. Now the Pwm constant INVERSED should be used for this purpose.

## Usage

### LEDs

Let's start off with something simple that doesn't require any hadrware other
than the BeagleBone Black itself. The following example will blink onboard user
LED0 at a frequency of 1Hz.

```js
var bot = require('bot-io'),
  led0 = new bot.Led(bot.Led.USR0);

led0.once('ready', function () {
  // Blink at 1Hz. Period = 1000ms, on for 500ms, off for 500ms.
  led0.blink();
});
```

The next example heartbeats all four onboard user LEDs at 100Hz.

```js
var bot = require('../'),
  Led = bot.Led,
  leds;

leds = [Led.USR0, Led.USR1, Led.USR2, Led.USR3].map(function (usrledName) {
  return new Led(usrledName);
});

bot.once('ready', leds, function () {
  leds.forEach(function (led) {
    led.heartbeat();
  });
});
```

### Buttons

Toggle the state of an LED every time a button is pressed.

<img src="https://github.com/fivdi/bot-io/raw/master/example/button-and-led.png">

```js
var bot = require('bot-io'),
  button = new bot.Button(bot.pins.p9_24),
  led = new bot.Led(bot.pins.p9_26),
  ledState = 0;

button.on('pressed', function () {
  led.value(ledState ^= 1);
});
```

### PWM - Pulse Width Modulation

Fade an LED on and off once per second.

<img src="https://github.com/fivdi/bot-io/raw/master/example/pwm.png">

```js
var bot = require('bot-io'),
  led = new bot.Pwm(bot.pins.p9_42);

led.once('ready', function () {
  var period = led.period(),
    duty = 0,
    delta = period / 50;

  (function updateDuty() {
    led.duty(duty);

    duty += delta;

    if (duty < 0 || duty > period) {
      delta = -delta;
      duty += delta;
    }

    setTimeout(updateDuty, 10);
  }());
});
```

### ADC - Analog to Digital Conversion

Determine the ambient light level with an analog ambient light sensor.

<img src="https://github.com/fivdi/bot-io/raw/master/example/adc.png">

```js
var bot = require('bot-io'),
  ain = new bot.Ain(bot.pins.p9_36);

ain.once('ready', function () {
  setInterval(function () {
    console.log('value: ' + ain.value() + ', rawValue: ' + ain.rawValue());
  }, 1000);
});
```

## Documentation

### Classes

- [Ain](https://github.com/fivdi/bot-io/blob/master/doc/ain.md) - Analog to Digital Conversion
- [Button](https://github.com/fivdi/bot-io/blob/master/doc/button.md) - Buttons and Switches
- [Gpio](https://github.com/fivdi/bot-io/blob/master/doc/gpio.md) - General Purpose Input Output
- [Led](https://github.com/fivdi/bot-io/blob/master/doc/led.md) - Light Emitting Diodes
- [Pwm](https://github.com/fivdi/bot-io/blob/master/doc/pwm.md) - Pulse Width Modulation
- [Uart](https://github.com/fivdi/bot-io/blob/master/doc/uart.md) - Serial Communication

### Objects

- [pins](https://github.com/fivdi/bot-io/blob/master/doc/pins.md) - Header Pins
- [pullTypes](https://github.com/fivdi/bot-io/blob/master/doc/pulltypes.md) - Pull Type Constants

### Functions

- [once](https://github.com/fivdi/bot-io/blob/master/doc/once.md) - One Time Listener

### Additional Information

Tested on a BeagleBone Black rev. A5C with

 * Debian Jessie 8.3 2016-03-20, Kernel 4.1.18-ti-r53, and Node.js v0.12.12

