'use strict';

var fs = require('fs'),
  events = require('events'),
  util = require('util'),
  _ = require('lodash'),
  fsu = require('./fsutil'),
  pullTypes = require('./pulltypes'),
  mux = require('./mux'),
  Dto = require('./dto'),
  dto = new Dto(__dirname + '/../templates/gpio-leds.dts');

var LED_ROOT_PATH = '/sys/class/leds/',
  NONE = new Buffer('none'),
  HEARTBEAT = new Buffer('heartbeat'),
  CPU0 = new Buffer('cpu0'),
  TIMER = new Buffer('timer');

var DEFAULT_OPTIONS = {
  pullType: pullTypes.NONE,
  isActiveLow: false // led initially off
};
Object.freeze(DEFAULT_OPTIONS);

function trigger(led, val) {
  if (led.delayOnFd !== -1) {
    fs.closeSync(led.delayOnFd);
    led.delayOnFd = -1;
  }
  if (led.delayOffFd !== -1) {
    fs.closeSync(led.delayOffFd);
    led.delayOffFd = -1;
  }

  fs.writeSync(led.triggerFd, val, 0, val.length, 0);
  led.trigger = val;

  if (val === TIMER) {
    led.delayOnFd = fs.openSync(LED_ROOT_PATH + led.name + '/delay_on', 'r+');
    led.delayOffFd = fs.openSync(LED_ROOT_PATH + led.name + '/delay_off', 'r+');
  }
}

function waitForLed(led) {
  fsu.waitForFile(LED_ROOT_PATH + led.name + '/trigger', function (err, device) {
    if (err) {
      return led.emit('error', err);
    }

    led.triggerFd = fs.openSync(LED_ROOT_PATH + led.name + '/trigger', 'r+');
    led.brightnessFd = fs.openSync(LED_ROOT_PATH + led.name + '/brightness', 'r+');
    led.delayOnFd = -1;
    led.delayOffFd = -1;
    led.value(0);

    led.emit('ready');
  });
}

function Led(pin, options) {
  var badPin,
    config,
    muxValue;

  if (!(this instanceof Led)) {
    return new Led(pin, options);
  }

  if (typeof pin === 'string') {
    // onboard led
    this.pin = null;
    this.name = pin;
    waitForLed(this);
  } else {
    if (pin.gpioNo === undefined) {
      badPin = new Error(pin.name + ' doesn\'t support leds');

      setImmediate(function () {
        this.emit('error', badPin);
      }.bind(this));

      return;
    }

    options = options ? _.defaults(options, DEFAULT_OPTIONS) : DEFAULT_OPTIONS;
    muxValue = mux.muxValue(options.pullType, 0);
    this.pin = pin;
    this.name = 'bot_led_' + pin.name;

    config = {
      header: pin.name.toUpperCase().replace('_', '.'),
      gpioBank: Math.floor(pin.gpioNo / 32),
      gpioBankPlusOne: Math.floor(pin.gpioNo / 32) + 1,
      gpioOffset: pin.gpioNo % 32,
      isActiveLow: options.isActiveLow ? 1 : 0,
      label: this.name,
      muxOffset: '0x' + pin.muxOffset.toString(16),
      muxValue: '0x' + muxValue.toString(16),
      name: this.name,
      partNumber: this.name
    };

    dto.install(config, function (err) {
      if (err) {
        return this.emit('error', err);
      }

      waitForLed(this);
    }.bind(this));
  }
}
util.inherits(Led, events.EventEmitter);
module.exports = Led;

Led.USR0 = 'beaglebone:green:usr0';
Led.USR1 = 'beaglebone:green:usr1';
Led.USR2 = 'beaglebone:green:usr2';
Led.USR3 = 'beaglebone:green:usr3';

Led.ON = 1;
Led.OFF = 0;

Led.prototype.value = function (val) {
  if (this.trigger !== NONE) {
    trigger(this, NONE);
  }

  fsu.writeNumber(this.brightnessFd, val);
};

Led.prototype.blink = function (delayOn, delayOff) {
  if (this.trigger !== TIMER) {
    trigger(this, TIMER);
  }

  delayOn = delayOn === undefined ? 500 : delayOn;
  delayOff = delayOff === undefined ? 500 : delayOff;

  fsu.writeNumber(this.delayOffFd, delayOff);
  fsu.writeNumber(this.delayOnFd, delayOn);
};

Led.prototype.heartbeat = function () {
  trigger(this, HEARTBEAT);
};

Led.prototype.cpu = function () {
  trigger(this, CPU0);
};

