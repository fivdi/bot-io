'use strict';

var fs = require('fs'),
  events = require('events'),
  util = require('util'),
  _ = require('lodash'),
  Epoll = require('epoll').Epoll,
  number = require('./numberpool'),
  fsu = require('./fsutil'),
  pullTypes = require('./pulltypes'),
  mux = require('./mux'),
  Dto = require('./dto'),
  dto = new Dto(__dirname + '/../templates/gpio.dts');

var DEFAULT_OPTIONS;

var GPIO_ROOT_PATH = '/sys/class/gpio/',
  GPIO_EXPORT_PATH = GPIO_ROOT_PATH + 'export',
  ONE = number(1)[0],
  STATE_GPIO_NONE = 'gpio',
  STATE_GPIO_PU = 'gpio_pu',
  STATE_GPIO_PD = 'gpio_pd',
  FS_OPTIONS = {encoding: 'utf8'};

function waitForGpio(gpio, options) {
  fsu.waitForFile(fsu.OCP_ROOT_PATH + gpio.name + '.*/state', function (err, stateFilePath) {
    if (err) {
      return gpio.emit('error', err);
    }

    gpio.stateFilePath = stateFilePath;
    gpio.activeLowFilePath = gpio.gpioPath + 'active_low';
    gpio.directionFilePath = gpio.gpioPath + 'direction';
    gpio.edgeFilePath = gpio.gpioPath + 'edge';

    gpio.pullType(options.pullType);

    // export pin if it hasn't already been exported
    if (!fs.existsSync(gpio.gpioPath)) {
      fs.writeFileSync(GPIO_EXPORT_PATH, gpio.pin.gpioNo);
    }

    gpio.direction(options.direction);
    gpio.valueFd = fs.openSync(gpio.gpioPath + 'value', 'r+');
    gpio.poller = null;
    gpio.edge(options.edge);
    gpio.isActiveLow(options.isActiveLow);

    gpio.emit('ready');
  });
}

function Gpio(pin, options) {
  var badPin,
    config,
    muxValue;

  if (!(this instanceof Gpio)) {
    return new Gpio(pin, options);
  }

  if (pin.gpioNo === undefined) {
    badPin = new Error(pin.name + ' doesn\'t support gpio');

    setImmediate(function () {
      this.emit('error', badPin);
    }.bind(this));

    return;
  }

  options = options ? _.defaults(options, DEFAULT_OPTIONS) : DEFAULT_OPTIONS;
  muxValue = mux.muxValue(options.pullType, 1);
  this.pin = pin;
  this.name = 'bot_gpio_' + pin.name;
  this.gpioPath = GPIO_ROOT_PATH + 'gpio' + pin.gpioNo + '/';
  this.readBuffer = new Buffer(16);

  config = {
    header: pin.name.toUpperCase().replace('_', '.'),
    gpioBank: Math.floor(pin.gpioNo / 32),
    gpioOffset: pin.gpioNo % 32,
    muxOffset: '0x' + pin.muxOffset.toString(16),
    muxValue: '0x' + muxValue.toString(16),
    name: this.name,
    partNumber: this.name
  };

  dto.install(config, function (err) {
    if (err) {
      return this.emit('error', err);
    }
    waitForGpio(this, options);
  }.bind(this));
}
util.inherits(Gpio, events.EventEmitter);
module.exports = Gpio;

Gpio.IN = 'in';
Gpio.OUT = 'out';
Gpio.OUT_HIGH = 'high';
Gpio.OUT_LOW = 'low';

Gpio.NONE = 'none';
Gpio.FALLING = 'falling';
Gpio.RISING = 'rising';
Gpio.BOTH = 'both';

DEFAULT_OPTIONS = {
  direction: Gpio.OUT,
  edge: Gpio.NONE,
  isActiveLow: false,
  pullType: pullTypes.NONE
};
Object.freeze(DEFAULT_OPTIONS);

Gpio.prototype.direction = function (val) {
  if (val === undefined) {
    return fs.readFileSync(this.directionFilePath, FS_OPTIONS).slice(0, -1);
  }

  if (val === Gpio.IN || val === Gpio.OUT) {
    fs.writeFileSync(this.directionFilePath, val, FS_OPTIONS);
  }
  // TODO - error if val invalid?
};

function interruptHandler(err, fd, events) {
  // TODO: handle error
  var val = this.value();

  if (val === 0 && (this._edge === Gpio.FALLING || this._edge === Gpio.BOTH)) {
    this.emit('falling', val);
  } else if (val === 1 && (this._edge === Gpio.RISING || this._edge === Gpio.BOTH)) {
    this.emit('rising', val);
  }
  this.emit('both', val);
}

Gpio.prototype.edge = function (val) {
  if (val === undefined) {
    return fs.readFileSync(this.edgeFilePath, FS_OPTIONS).slice(0, -1);
  }

  if (val === Gpio.NONE || val === Gpio.FALLING || Gpio.RISING || Gpio.BOTH) {
    fs.writeFileSync(this.edgeFilePath, val, FS_OPTIONS);
    this._edge = val;

    if (val === Gpio.NONE && this.poller !== null) {
      this.poller.remove(this.valueFd).close();
      this.poller = null;
    } else if (val !== Gpio.NONE && this.poller === null) {
      this.poller = new Epoll(interruptHandler.bind(this));
      this.value(); // Read value to prevent an initial unauthentic interrupt
      this.poller.add(this.valueFd, Epoll.EPOLLPRI);
    }
  }
  // TODO - error if val invalid?
};

Gpio.prototype.isActiveLow = function (val) {
  var activeLow;

  if (val === undefined) {
    activeLow = fs.readFileSync(this.activeLowFilePath, FS_OPTIONS).slice(0, -1);
    return activeLow === '0' ? false : true;
  }

  activeLow = (val === true ? number(1) : number(0));
  fs.writeFileSync(this.activeLowFilePath, activeLow, FS_OPTIONS);
};

Gpio.prototype.pullType = function (pullType) {
  var state;

  if (pullType === undefined) {
    state = fs.readFileSync(this.stateFilePath, FS_OPTIONS).slice(0, -1);

    if (state === STATE_GPIO_NONE) {
      return pullTypes.NONE;
    }
    if (state === STATE_GPIO_PU) {
      return pullTypes.PULL_UP;
    }
    if (state === STATE_GPIO_PD) {
      return pullTypes.PULL_DOWN;
    }

    return undefined;
  }

  if (pullType === pullTypes.PULL_UP || pullType === pullTypes.PULL_DOWN ||
      pullType === pullTypes.NONE) {
    if (pullType === pullTypes.PULL_UP) {
      state = STATE_GPIO_PU;
    } else if (pullType === pullTypes.PULL_DOWN) {
      state = STATE_GPIO_PD;
    } else if (pullType === pullTypes.NONE) {
      state = STATE_GPIO_NONE;
    }

    fs.writeFileSync(this.stateFilePath, state, FS_OPTIONS);
  }
  // TODO - error if val invalid?
};

Gpio.prototype.value = function (val) {
  if (val === undefined) {
    fs.readSync(this.valueFd, this.readBuffer, 0, 1, 0);
    return this.readBuffer[0] === ONE ? 1 : 0;
  }

  fsu.writeNumber(this.valueFd, val);
};

