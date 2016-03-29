## Button Class - Buttons and Switches

The following circuit shows how to wire a button to pin 24 on the P9 header.
When the button is pressed, P9_24 will be pulled low. When it's released,
P9_24 will be pulled high as the internal pull-up resistor for 
P9_24 will be enabled. Although the 1kΩ resistor isn't strictly necessary,
it will protect the BeagleBone if P9_24 is ever configured as an output,
set high, and someone presses the button. Without the 1kΩ resistor this
would result in a short circut.

***Please Note:*** Internally Node.js uses threads for some tasks like
accessing files. By default it has four threads for such task. If four buttons
are used, these four threads will be blocked. If five buttons are used, there
will not be enough threads and the program will behave strangely.

It's therefore best to increase the number of threads available to the Node.js
program by the number of buttons being used. This can be achieved with the
`UV_THREADPOOL_SIZE` environment variable. If you would like to use for example
10 buttons then you need to set the max threads when calling your app like this:

```UV_THREADPOOL_SIZE=14 node app.js```

<img src="https://github.com/fivdi/bot-io/raw/master/doc/button.png">

The program below can be used with this circuit to print information every
time the button is pressed or released.

```js
var bot = require('bot-io'),
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
```

### Constructor: Button(pin, options)
- pin - a pin object
- options - object (optional)

Creates a Button object, an EventEmitter, which will fire events when the
button is pressed or released. The options object can be used to configure
the debounce interval, pull type, and active state for the button.

The following options are supported:
- debounceInterval - debounce interval in milliseconds (optional, default 50 milliseconds)
- pullType - pullType.NONE, pullTypes.PULL_UP, or pullTypes.PULL_DOWN (optional, default pullTypes.PULL_UP)
- isActiveLow - true or false (optional, default true)


### pressed()
Returns true if the button is pressed, else false.

### held()
Returns true if the button is held, else false.

### released()
Returns true if the button is released, else false.

### Event: 'ready'
Emitted after the constructor has completed creation of the Button object
indicating that the object is now ready for usage.

### Event: 'pressed'
Emitted when the button is pressed.

### Event: 'held'
Emitted continuously when the button is held.

### Event: 'released'
Emitted when the button is released.

### Event: 'error'
Emitted on error.

