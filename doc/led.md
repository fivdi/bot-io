## Led Class - Light Emitting Diode

The following circuit shows how to wire an LED to pin 26 on the P9 header.

<img src="https://github.com/fivdi/bot-io/raw/master/doc/led.png">

The program below can be used with this circuit to heartbeat the LED.

```js
var bot = require('bot-io'),
  led = new bot.Led(bot.pins.p9_26);

led.on('ready', function () {
  led.heartbeat();
});
```

Note that the LED will continue to heartbeat after the program has terminated.
This isn't as magical as it might first seam. Under the covers, the Led class
controls LEDs by asking the Linux leds-gpio device driver to perform all the
work. In this case the device driver will continue to heartbeat the LED as it
wasn't told to stop doing so.

### Constructor: Led(pin, options)
- pin - a pin object or one of Led.USR0, Led.USR1, Led.USR2, or Led.USR3
- options - object (optional)

Creates an Led object for controlling an LED. The LED can be either one of the
four onboard user LEDs or an LED connected up to an appropriate header pin.
An Led object is an EventEmitter.

The following options are supported:
- isActiveLow - true or false (optional, default false)

### Method: value(val)
- val - Led.ON or Led.OFF

Turn the LED on or off. val should be Led.ON or 1 to turn the Led on, or
Led.OFF or 0 to turn the Led off.

### Method: blink(delayOn, delayOff)
- delayOn - on delay in milliseconds (optional, default 500 milliseconds)
- delayOff - off delay in milliseconds (optional, default 500 milliseconds)

Flash the LED at a fixed rate. delayOn and delayOff specify the on and off time
in milliseconds. If delayOn or delayOff is not specified, it will default to
500 milliseconds.

### Method: heartbeat()
Double flash the LED like an actual heart beat (thump-thump-pause.)

### Method: cpu()
Flash the LED to indicate CPU activity.

### Event: 'ready'
Emitted after the constructor has completed creation of the Led object
indicating that the object is now ready for usage.

### Event: 'error'
Emitted on error.

### Constant: Led.USR0
Passed to the constructor to control user LED0.

### Constant: Led.USR1
Passed to the constructor to control user LED1.

### Constant: Led.USR2
Passed to the constructor to control user LED2.

### Constant: Led.USR3
Passed to the constructor to control user LED3.

### Constant: Led.ON
Passed to the value method to turn the LED on.

### Constant: Led.OFF
Passed to the value method to turn the LED off.

