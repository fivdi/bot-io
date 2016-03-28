'use strict';

var fs = require('fs'),
  events = require('events'),
  util = require('util'),
  _ = require('lodash'),
  fsu = require('./fsutil'),
  slots = require('./slots'),
  Dto = require('./dto'),
  dto = new Dto(__dirname + '/../templates/adc.dts');

var DEFAULT_OPTIONS = {
  scaledMin: 0,
  scaledMax: 1
};
Object.freeze(DEFAULT_OPTIONS);

var ADC_OVERLAY = 'bot_adc',
  ADC_ROOT_PATH  = '/sys/bus/iio/devices/iio:device0/';

function waitForAin(ain) {
  fsu.waitForFile(ADC_ROOT_PATH + 'in_voltage' + ain.pin.ain.channel + '_raw', function (err, device) {
    if (err) {
      return ain.emit('error', err);
    }

    ain.ainPath = device;
    ain.ainFd = fs.openSync(ain.ainPath, 'r');

    ain.emit('ready');
  });
}

function Ain(pin, options) {
  var badPin,
    config;

  if (!(this instanceof Ain)) {
    return new Ain(pin, options);
  }

  if (pin.ain === undefined) {
    // Create Error outside setImmediate callback for better stack information
    badPin = new Error(pin.name + ' doesn\'t support analog input');

    setImmediate(function () {
      this.emit('error', badPin);
    }.bind(this));

    return;
  }

  options = options ? _.defaults(options, DEFAULT_OPTIONS) : DEFAULT_OPTIONS;

  this.scaledMin = options.scaledMin;
  this.scaledMax = options.scaledMax;
  this.pin = pin;
  this.name = 'bot_ain_' + pin.name;
  this.readBuffer = new Buffer(16);

  config = {
    partNumber: ADC_OVERLAY
  };

  dto.install(config, function (err) {
    if (err) {
      return this.emit('error', err);
    }
    waitForAin(this);
  }.bind(this));

}
util.inherits(Ain, events.EventEmitter);
module.exports = Ain;

Ain.prototype.value = function () {
  return ((this.rawValue() * (this.scaledMax - this.scaledMin)) / 4095) + this.scaledMin;
};

Ain.prototype.rawValue = function () {
  var tries = 0;

  while (true) {
    try {
      tries += 1;
      return fsu.readNumber(this.ainFd, this.readBuffer);
    } catch (e) {
      if (e.code !== 'EAGAIN' || tries > 100) {
        throw e;
      }
    }
  }
};

