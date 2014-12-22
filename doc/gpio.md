## Gpio Class - General Purpose Input Output

Gpio objects can be used to control GPIOs. They support input, output, interrupt
detection, pull-up resistors, and pull-down resistors.

The following circuit shows how to wire a button to pin 24 and an LED to pin
26 on the P9 header. When the button is pressed, P9_24 will be pulled low.
When it's released, P9_24 will be pulled high as the internal pull-up resistor
for P9_24 will be enabled.

<img src="https://github.com/fivdi/bot-io/raw/master/example/button-and-led.png">

The program below can be used with this circuit. When the button is pressed,
the LED will turn on, when it's released, the LED will turn off.

```js
var bot = require('bot-io'),
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
```

### Constructor: Gpio(pin, options)
- pin - a pin object
- options - object (optional)

Creates a Gpio object for controlling a GPIO header pin. The options object
can be used to configure the direction, interrupting edge, and pull type for
the GPIO. A Gpio object is an EventEmitter.

The following options are supported:
- direction - Gpio.IN, Gpio.OUT, Gpio.OUT_HIGH, or Gpio.OUT_LOW (optional, default Gpio.OUT)
- edge - Gpio.NONE, Gpio.FALLING, Gpio.RISING, or Gpio.BOTH (optional, default Gpio.NONE)
- isActiveLow - true or false (optional, default false)
- pullType - pullType.NONE, pullTypes.PULL_UP, or pullTypes.PULL_DOWN (optional, default pullTypes.NONE)

### Method: direction(value)
- value - Gpio.IN or Gpio.OUT (optional)

Returns the current direction of the GPIO if no value is specified, else sets
the direction to the specified value.

### Method: edge(value)
- value - Gpio.NONE, Gpio.FALLING, Gpio.RISING, or Gpio.BOTH (optional)

Returns the current interrupting edge for the GPIO if no value is specified,
else sets the interrupting edge to the specified value. Setting edge to any
value other than Gpio.NONE will result in 'falling' and/or 'rising', and 'both'
events being emitted when the value of the GPIO changes.

### Method: isActiveLow(value)
- value - true or false (optional)

Returns the current active-low state of the GPIO if no value is specified, else
sets the active-low state to the specified value.

### Method: pullType(value)
- value -  pullType.NONE, pullTypes.PULL_UP, or pullTypes.PULL_DOWN (optional)

GPIO pins have internal pull-up and pull-down resistors that can be enabled.
Returns the current pullType if no value is specified, else sets the pullType
to the specified value. 
See [pullTypes](https://github.com/fivdi/bot-io/blob/master/doc/pulltypes.md).

### Method: value(val)
- val - 0 or 1 (optional)

Returns the current value of the GPIO if no val is specified, else sets the
value to the specified val.

### Event: 'ready'
Emitted after the constructor has completed creation of the Gpio object
indicating that the object is now ready for usage.

### Event: 'falling'
Emitted on falling edge interrupts.

### Event: 'rising'
Emitted on rising edge interrupts.

### Event: 'both'
Emitted on falling and rising edge interrupts.

### Event: 'error'
Emitted on error.

### Constant: Gpio.IN
Indicates that the GPIO is an input.

### Constant: Gpio.OUT
Indicates that the GPIO is an output. When passed to the Gpio constuctor as the
direction option, the output will be initially low.

### Constant: Gpio.OUT_HIGH
Indicates that the GPIO is an output.  When passed to the Gpio constuctor as
the direction option, the output will be initially high.

### Constant: Gpio.OUT_LOW
Indicates that the GPIO is an output.  When passed to the Gpio constuctor as
the direction option, the output will be initially low.

### Constant: Gpio.NONE
Indicates that the GPIO does not fire interrupts.

### Constant: Gpio.FALLING
Indicates that the GPIO fires interrupts on falling edges.

### Constant: Gpio.RISING
Indicates that the GPIO fires interrupts on rising edges.

### Constant: Gpio.BOTH
Indicates that the GPIO fires interrupts on both rising and falling edges.

