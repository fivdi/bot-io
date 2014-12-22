'use strict';

var fs = require('fs'),
  events = require('events'),
  util = require('util'),
  _ = require('lodash'),
  number = require('./numberpool'),
  fsu = require('./fsutil'),
  Dto = require('./dto'),
  dto = new Dto(__dirname + '/../templates/pwm.dts'),
  PwmSubSystem = require('./pwmsubsystem'),
  PwmModule = require('./pwmmodule'),
  pwmSubSystems = {},
  pwmModules = {};

var DEFAULT_OPTIONS;

function installPwmSubSystem(pin, cb) {
  if (pwmSubSystems[pin.pwm.subSystem] === undefined) {
    pwmSubSystems[pin.pwm.subSystem] = new PwmSubSystem(pin.pwm.subSystem);
  }

  if (!pwmSubSystems[pin.pwm.subSystem].ready) {
    pwmSubSystems[pin.pwm.subSystem].once('error', cb);
    pwmSubSystems[pin.pwm.subSystem].once('ready', cb);
  } else {
    setImmediate(cb);
  }
}

function installPwmModule(pin, cb) {
  if (pwmModules[pin.pwm.module] === undefined) {
    pwmModules[pin.pwm.module] = new PwmModule(pin.pwm.module);
  }
  if (!pwmModules[pin.pwm.module].ready) {
    pwmModules[pin.pwm.module].once('error', cb);
    pwmModules[pin.pwm.module].once('ready', cb);
  } else {
    setImmediate(cb);
  }
}

function waitForPwm(pwm) {
  fsu.waitForFile(fsu.OCP_ROOT_PATH + pwm.name + '.*/', function (err, device) {
    if (err) {
      return pwm.emit('error', err);
    }

    pwm.pwmPath = device;
    pwm.periodFd = fs.openSync(pwm.pwmPath + 'period', 'r+');
    pwm.dutyFd = fs.openSync(pwm.pwmPath + 'duty', 'r+');
    pwm.runFd = fs.openSync(pwm.pwmPath + 'run', 'r+');
    pwm.polarityFd = fs.openSync(pwm.pwmPath + 'polarity', 'r+');

    pwm.emit('ready');
  });
}

function Pwm(pin, options) {
  var badPin;

  if (!(this instanceof Pwm)) {
    return new Pwm(pin, options);
  }

  if (pin.pwm === undefined) {
    // Create Error outside setImmediate callback for better stack information
    badPin = new Error(pin.name + ' doesn\'t support pwm');

    setImmediate(function () {
      this.emit('error', badPin);
    }.bind(this));

    return;
  }

  installPwmSubSystem(pin, function (err) {
    if (err) {
      return this.emit('error', err);
    }

    installPwmModule(pin, function (err) {
      var config;

      if (err) {
        return this.emit('error', err);
      }

      options = options ? _.defaults(options, DEFAULT_OPTIONS) : DEFAULT_OPTIONS;
      this.pin = pin;
      this.name = 'bot_pwm_' + pin.name;
      this.readBuffer = new Buffer(16);

      config = {
        channel: pin.pwm.channel,
        duty: options.duty,
        enabled: options.enabled ? 1 : 0,
        hardwareIp: pin.pwm.mux,
        header: pin.name.toUpperCase().replace('_', '.'),
        module: pin.pwm.module,
        muxOffset: '0x' + pin.muxOffset.toString(16),
        muxValue: '0x' + pin.pwm.muxMode.toString(16),
        name: this.name,
        partNumber: this.name,
        period: options.period,
        polarity: options.polarity
      };

      dto.install(config, function (err) {
        if (err) {
          return this.emit('error', err);
        }

        waitForPwm(this);
      }.bind(this));
    }.bind(this));
  }.bind(this));
}
util.inherits(Pwm, events.EventEmitter);
module.exports = Pwm;

Pwm.HIGH = 1;
Pwm.LOW = 0;

DEFAULT_OPTIONS = {
  duty: 0,
  enabled: true,
  period: 500000,
  polarity: Pwm.LOW
};
Object.freeze(DEFAULT_OPTIONS);

Pwm.prototype.period = function (value) {
  if (value === undefined) {
    return fsu.readNumber(this.periodFd, this.readBuffer);
  }

  fsu.writeNumber(this.periodFd, value);
};

Pwm.prototype.duty = function (value) {
  if (value === undefined) {
    return fsu.readNumber(this.dutyFd, this.readBuffer);
  }

  fsu.writeNumber(this.dutyFd, value);
};

Pwm.prototype.enabled = function (value) {
  if (value === undefined) {
    return !!fsu.readNumber(this.runFd, this.readBuffer);
  }

  fsu.writeNumber(this.runFd, value ? 1 : 0);
};

Pwm.prototype.polarity = function (value) {
  if (value === undefined) {
    return fsu.readNumber(this.polarityFd, this.readBuffer) ? Pwm.HIGH : Pwm.LOW;
  }

  fsu.writeNumber(this.polarityFd, value === Pwm.HIGH ? 1 : 0);
};

