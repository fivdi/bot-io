'use strict';

var fs = require('fs'),
  events = require('events'),
  util = require('util'),
  _ = require('lodash'),
  fsu = require('./fsutil'),
  pullTypes = require('./pulltypes'),
  mux = require('./mux'),
  Dto = require('./dto'),
  dto = new Dto(__dirname + '/../templates/gpio-keys.dts');

var EVENT_FILE_PREFIX = '/dev/input/by-path/platform-',
  EVENT_FILE_SUFFIX = '-event',
  EVENT_DATA_SIZE = 32,
  EVENT_TYPE_INDEX = 12;

var DEFAULT_OPTIONS = {
  debounceInterval: 50,
  pullType: pullTypes.PULL_UP,
  isActiveLow: true
};
Object.freeze(DEFAULT_OPTIONS);

function waitForButton(button) {
  fsu.waitForFile(EVENT_FILE_PREFIX + button.name + EVENT_FILE_SUFFIX, function (err, device) {
    var data = new Buffer(0);

    if (err) {
      return button.emit('error', err);
    }

    fs.createReadStream(device).on('data', function (buf) {
      data = Buffer.concat([data, buf]);

      while (data.length >= EVENT_DATA_SIZE) {
        if (data[EVENT_TYPE_INDEX] === 0) {
          button._pressed = false;
          button._held = false;
          button.emit('released');
        } else if (data[EVENT_TYPE_INDEX] === 1) {
          button._pressed = true;
          button.emit('pressed');
        } else if (data[EVENT_TYPE_INDEX] === 2) {
          button._held = true;
          button.emit('held');
        }

        data = data.slice(EVENT_DATA_SIZE);
      }
    });

    button.emit('ready');
  });
}

function Button(pin, options) {
  var badPin,
    config,
    muxValue;

  if (!(this instanceof Button)) {
    return new Button(pin, options);
  }

  if (pin.gpioNo === undefined) {
    badPin = new Error(pin.name + ' doesn\'t support buttons');

    setImmediate(function () {
      this.emit('error', badPin);
    }.bind(this));

    return;
  }

  options = options ? _.defaults(options, DEFAULT_OPTIONS) : DEFAULT_OPTIONS;
  muxValue = mux.muxValue(options.pullType, 1);
  this.pin = pin;
  this.name = 'bot_btn_' + pin.name;
  this._pressed = false;
  this._held = false;

  config = {
    debounceInterval: options.debounceInterval,
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

    waitForButton(this);
  }.bind(this));
}
util.inherits(Button, events.EventEmitter);
module.exports = Button;

Button.prototype.pressed = function () {
  return this._pressed;
}

Button.prototype.held = function () {
  return this._held;
}

Button.prototype.released = function () {
  return !this.pressed();
}

