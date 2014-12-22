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

var DEFAULT_OPTIONS = {
  debounceInterval: 50,
  pullType: pullTypes.PULL_UP,
  isActiveLow: true
};
Object.freeze(DEFAULT_OPTIONS);

function waitForButton(button) {
  fsu.waitForFile('/dev/input/by-path/platform-' + button.name + '.*-event', function (err, device) {
    if (err) {
      return button.emit('error', err);
    }

    fs.createReadStream(device).on('data', function (buf) {
      if (buf[12] === 1) {
        button.emit('pressed');
      } else {
        button.emit('released');
      }
    }.bind(button));

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

