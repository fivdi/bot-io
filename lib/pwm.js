'use strict';

var fs = require('fs'),
  events = require('events'),
  util = require('util'),
  _ = require('lodash'),
  fsu = require('./fsutil'),
  Dto = require('./dto'),
  dto = new Dto(__dirname + '/../templates/pwm.dts'),
  PwmSubSystem = require('./pwmsubsystem'),
  PwmModule = require('./pwmmodule'),
  pwmSubSystems = {},
  pwmModules = {};

var DEFAULT_OPTIONS;

function installPwmSubSystem(pin, cb) {
  if (pwmSubSystems[pin.pwm.module.subSystem.number] === undefined) {
    pwmSubSystems[pin.pwm.module.subSystem.number] =
      new PwmSubSystem(pin.pwm.module.subSystem.number);
  }

  if (!pwmSubSystems[pin.pwm.module.subSystem.number].ready) {
    pwmSubSystems[pin.pwm.module.subSystem.number].once('error', cb);
    pwmSubSystems[pin.pwm.module.subSystem.number].once('ready', cb);
  } else {
    setImmediate(cb);
  }
}

function installPwmModule(pin, cb) {
  if (pwmModules[pin.pwm.module.name] === undefined) {
    pwmModules[pin.pwm.module.name] = new PwmModule(pin.pwm.module.name);
  }
  if (!pwmModules[pin.pwm.module.name].ready) {
    pwmModules[pin.pwm.module.name].once('error', cb);
    pwmModules[pin.pwm.module.name].once('ready', cb);
  } else {
    setImmediate(cb);
  }
}

function waitForPwm(pwm, options) {
  var pwmMod = pwm.pin.pwm.module,
    pwmChipPattern;

  pwmChipPattern = fsu.OCP_ROOT_PATH +
    pwmMod.subSystem.addr.toString(16) + '.epwmss/' +
    pwmMod.addr.toString(16) + '.' + pwmMod.name.slice(0, -1) + '/pwm/pwmchip*/';

  fsu.waitForFile(pwmChipPattern, function (err, pwmChipPath) {
    if (err) {
      return pwm.emit('error', err);
    }

    pwm.pwmChipPath = pwmChipPath;
    pwm.pwmChannelPath = pwmChipPath + 'pwm' + pwm.pin.pwm.channel + '/';

    if (!fs.existsSync(pwm.pwmChannelPath)) {
      fs.writeFileSync(pwm.pwmChipPath + 'export', pwm.pin.pwm.channel);
    }

    fsu.waitForFile(pwm.pwmChannelPath + 'enable', function (err, enablePath) {
      if (err) {
        return pwm.emit('error', err);
      }

      pwm.periodFd = fs.openSync(pwm.pwmChannelPath + 'period', 'r+');
      pwm.dutyCycleFd = fs.openSync(pwm.pwmChannelPath + 'duty_cycle', 'r+');
      pwm.polarityFd = fs.openSync(pwm.pwmChannelPath + 'polarity', 'r+');
      pwm.enableFd = fs.openSync(pwm.pwmChannelPath + 'enable', 'r+');

      if (pwm.enabled()) {
        pwm.enabled(false);
      }

      pwm.period(options.period);
      pwm.duty(options.duty);
      pwm.polarity(options.polarity);
      pwm.enabled(options.enabled);

      pwm.emit('ready');
    });
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
        //channel: pin.pwm.channel,
        //duty: options.duty,
        //enabled: options.enabled ? 1 : 0,
        hardwareIp: pin.pwm.mux,
        header: pin.name.toUpperCase().replace('_', '.'),
        //module: pin.pwm.module,
        muxOffset: '0x' + pin.muxOffset.toString(16),
        muxValue: '0x' + pin.pwm.muxMode.toString(16),
        name: this.name,
        partNumber: this.name,
        //period: options.period,
        //polarity: options.polarity
      };

      dto.install(config, function (err) {
        if (err) {
          return this.emit('error', err);
        }

        waitForPwm(this, options);
      }.bind(this));
    }.bind(this));
  }.bind(this));
}
util.inherits(Pwm, events.EventEmitter);
module.exports = Pwm;

Pwm.NORMAL = 'normal';
Pwm.INVERSED = 'inversed';

DEFAULT_OPTIONS = {
  duty: 0,
  enabled: true,
  period: 500000,
  polarity: Pwm.NORMAL
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
    return fsu.readNumber(this.dutyCycleFd, this.readBuffer);
  }

  fsu.writeNumber(this.dutyCycleFd, value);
};

Pwm.prototype.enabled = function (value) {
  if (value === undefined) {
    return !!fsu.readNumber(this.enableFd, this.readBuffer);
  }

  fsu.writeNumber(this.enableFd, value ? 1 : 0);
};

Pwm.prototype.polarity = function (value) {
  if (value === undefined) {
    return fsu.readString(this.polarityFd, this.readBuffer);
  }

  fsu.writeString(this.polarityFd, value);
};

