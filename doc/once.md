## once Function - One Time Listener

Many objects are EventEmitters that emit a 'ready' event after their
construction has completed indicating that the object is ready for usage.

The once function is a helper function that will wait for all objects in an
array of objects to emit an event and invoke a listener after they have all
emitted that event.

```js
var bot = require('bot-io'),
  pwms = [
    new bot.Pwm(bot.pins.p8_13),
    new bot.Pwm(bot.pins.p8_19),
    new bot.Pwm(bot.pins.p9_14),
    new bot.Pwm(bot.pins.p9_16),
    new bot.Pwm(bot.pins.p9_21),
    new bot.Pwm(bot.pins.p9_22),
    new bot.Pwm(bot.pins.p9_42)
  ];

bot.once('ready', pwms, function() {
});
```

### Function: once(event, emitters, listener)
- event - string
- emitters - an array of EventEmitters
- listener - function

Adds a one time listener for the event to each emitter and waits for that
event to be emitted by each emitter. After all emitters have fired the event
the specified listener will be invoked.

