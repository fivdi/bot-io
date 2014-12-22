'use strict';

var fs = require('fs'),
  events = require('events'),
  util = require('util'),
  _ = require('lodash'),
  number = require('./numberpool'),
  fsu = require('./fsutil'),
  Dto = require('./dto'),
  dto = new Dto(__dirname + '/../templates/ain.dts'),
  AinSubSystem = require('./ainsubsystem'),
  ainSubSystem;

var DEFAULT_OPTIONS = {
  scaledMin: 0,
  scaledMax: 1,
  vsenseScale: 100
};
Object.freeze(DEFAULT_OPTIONS);

function installAinSubSystem(cb) {
  if (ainSubSystem === undefined) {
    ainSubSystem = new AinSubSystem();
  }

  if (!ainSubSystem.ready) {
    ainSubSystem.on('error', cb);
    ainSubSystem.once('ready', cb);
  } else {
    setImmediate(cb);
  }
}

function waitForAin(ain) {
  fsu.waitForFile(fsu.OCP_ROOT_PATH + ain.name + '.*/', function (err, device) {
    if (err) {
      return ain.emit('error', err);
    }

    ain.ainPath = device;
    ain.ainFd = fs.openSync(ain.ainPath + ain.pin.ain.vsenseName, 'r');

    ain.emit('ready');
  });
}

function Ain(pin, options) {
  var badPin;

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

  installAinSubSystem(function (err) {
    var config;

    if (err) {
      return this.emit('error', err);
    }

    options = options ? _.defaults(options, DEFAULT_OPTIONS) : DEFAULT_OPTIONS;
    this.scaledMin = options.scaledMin;
    this.scaledMax = options.scaledMax;
    this.pin = pin;
    this.name = 'bot_ain_' + pin.name;
    this.readBuffer = new Buffer(16);

    config = {
      header: pin.name.toUpperCase().replace('_', '.'),
      name: this.name,
      partNumber: this.name,
      vsenseName: pin.ain.vsenseName,
      vsenseScale: options.vsenseScale
    };

    dto.install(config, function (err) {
      if (err) {
        return this.emit('error', err);
      }
      waitForAin(this);
    }.bind(this));
  }.bind(this));
}
util.inherits(Ain, events.EventEmitter);
module.exports = Ain;

Ain.prototype.value = function () {
  return ((this.rawValue() * (this.scaledMax - this.scaledMin)) / 1800) + this.scaledMin;
};

Ain.prototype.rawValue = function () {
  return fsu.readNumber(this.ainFd, this.readBuffer);
};

