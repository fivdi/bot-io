'use strict';

var fs = require('fs'),
  util = require('util'),
  Duplexify = require('duplexify'),
  _ = require('lodash'),
  su = require('bindings')('serialutil.node'),
  fsu = require('./fsutil'),
  pins = require('./pins'),
  Dto = require('./dto'),
  dto = new Dto(__dirname + '/../templates/uart.dts');

var DEFAULT_OPTIONS;

function onopen(uart, options) {
  if (uart._rxfd !== -1 && uart._txfd !== -1) {
    su.setRawMode(uart._rxfd);
    uart.baudRate(options.baudRate);
    uart.characterSize(options.characterSize);
    uart.parity(options.parity);
    uart.stopBits(options.stopBits);

    setImmediate(function () {
      uart.emit('open');
      uart.emit('ready');
    });
  }
}

function onclose(uart) {
  if (uart._rxfd === -1 && uart._txfd === -1) {
    setImmediate(function () {
      uart.emit('close');
    });
  }
}

function createStreams(uart, options) {
  uart._rxfd = -1;
  uart._txfd = -1;

  uart._rxstream = fs.createReadStream(uart.devPath, {
    highWaterMark: options.highWaterMark,
    encoding: options.encoding
  });
  uart._txstream = fs.createWriteStream(uart.devPath, {
    highWaterMark: options.highWaterMark,
    encoding: options.encoding,
    flags: 'r+'
  });

  uart._rxstream.once('open', function (rxfd) {
    uart._rxfd = rxfd;
    onopen(uart, options);
  });
  uart._txstream.once('open', function (txfd) {
    uart._txfd = txfd;
    onopen(uart, options);
  });

  uart._rxstream.once('close', function () {
    uart._rxfd = -1;
    onclose(uart);
  });
  uart._txstream.once('close', function () {
    uart._txfd = -1;
    onclose(uart);
  });

  // TODO - test error handling

  uart.setReadable(uart._rxstream);
  uart.setWritable(uart._txstream);
}

function waitForUart(uart, options) {
  fsu.waitForFile(uart.devPath, function (err, devPath) {
    if (err) {
      return uart.emit('error', err);
    }
    createStreams(uart, options);
  });
}

function Uart(uartDef, options) {
  var badPin,
    config;

  if (!(this instanceof Uart)) {
    return new Uart(uartDef);
  }

  options = options ? _.defaults(options, DEFAULT_OPTIONS) : DEFAULT_OPTIONS;

  // Consider calling Duplexify with the allowHalfOpen option set to false.
  // It's super-class (Duplex) will then ensure that this.end is called when
  // the read stream fires the 'end' event. (see:
  // https://github.com/joyent/node/blob/v0.10.25/lib/_stream_duplex.js)
  Duplexify.call(this, null, null);

  if (typeof uartDef === 'string') {
    this.uartDef = null;
    this.devPath = uartDef;
    this.name = null;

    waitForUart(this, options);
  } else {
    if (uartDef.txPin.uart === undefined) {
      badPin = new Error(uartDef.txPin + ' doesn\'t support uarts');
    } else if (uartDef.rxPin.uart === undefined) {
      badPin = new Error(uartDef.rxPin + ' doesn\'t support uarts');
    }

    if (badPin) {
      setImmediate(function () {
        this.emit('error', badPin);
      }.bind(this));

      return;
    }

    this.uartDef = uartDef;
    this.devPath = '/dev/ttyO' + uartDef.id;
    this.name = 'bot_uart' + uartDef.id;

    config = {
      txHeader: this.uartDef.txPin.name.toUpperCase().replace('_', '.'),
      rxHeader: this.uartDef.rxPin.name.toUpperCase().replace('_', '.'),
      hardwareIp: 'uart' + this.uartDef.id,
      name: this.name,
      rxMuxOffset: '0x' + this.uartDef.rxPin.muxOffset.toString(16),
      rxMuxValue: '0x' + this.uartDef.rxPin.uart.muxValue.toString(16),
      txMuxOffset: '0x' + this.uartDef.txPin.muxOffset.toString(16),
      txMuxValue: '0x' + this.uartDef.txPin.uart.muxValue.toString(16),
      targetUart: 'uart' + (this.uartDef.id + 1),
      partNumber: this.name
    };

    dto.install(config, function (err) {
      if (err) {
        return this.emit('error', err);
      }
      waitForUart(this, options);
    }.bind(this));
  }
}
module.exports = Uart;
util.inherits(Uart, Duplexify);

Uart.B0 = su.B0;
Uart.B50 = su.B50;
Uart.B75 = su.B75;
Uart.B110 = su.B110;
Uart.B134 = su.B134;
Uart.B150 = su.B150;
Uart.B200 = su.B200;
Uart.B300 = su.B300;
Uart.B600 = su.B600;
Uart.B1200 = su.B1200;
Uart.B1800 = su.B1800;
Uart.B2400 = su.B2400;
Uart.B4800 = su.B4800;
Uart.B9600 = su.B9600;
Uart.B19200 = su.B19200;
Uart.B38400 = su.B38400;
Uart.B57600 = su.B57600;
Uart.B115200 = su.B115200;
Uart.B230400 = su.B230400;
Uart.B460800 = su.B460800;
Uart.B500000 = su.B500000;
Uart.B576000 = su.B576000;
Uart.B921600 = su.B921600;
Uart.B1000000 = su.B1000000;
Uart.B1152000 = su.B1152000;
Uart.B1500000 = su.B1500000;
Uart.B2000000 = su.B2000000;
Uart.B2500000 = su.B2500000;
Uart.B3000000 = su.B3000000;
Uart.B3500000 = su.B3500000;
Uart.B4000000 = su.B4000000;

Uart.PARITY_NONE = su.PARITY_NONE;
Uart.PARITY_ODD = su.PARITY_ODD;
Uart.PARITY_EVEN = su.PARITY_EVEN;

Uart.UART1 = {
  id: 1,
  txPin: pins.p9_24,
  rxPin: pins.p9_26
};

Uart.UART2 = {
  id: 2,
  txPin: pins.p9_21,
  rxPin: pins.p9_22
};

Uart.UART4 = {
  id: 4,
  txPin: pins.p9_13,
  rxPin: pins.p9_11
};

DEFAULT_OPTIONS = {
  baudRate: Uart.B38400,
  characterSize: 8,
  parity: Uart.PARITY_NONE,
  stopBits: 1,
  highWaterMark: 512,
  encoding: null
};
Object.freeze(DEFAULT_OPTIONS);

Uart.prototype.baudRate = function (rate) {
  if (rate === undefined) {
    return su.getBaudRate(this._rxfd);
  }

  su.setBaudRate(this._rxfd, rate);
};

Uart.prototype.characterSize = function (size) {
  if (size === undefined) {
    return su.getCharacterSize(this._rxfd);
  }

  su.setCharacterSize(this._rxfd, size);
};

Uart.prototype.parity = function (type) {
  if (type === undefined) {
    return su.getParity(this._rxfd);
  }

  su.setParity(this._rxfd, type);
};

Uart.prototype.stopBits = function (count) {
  if (count === undefined) {
    return su.getStopBits(this._rxfd);
  }

  su.setStopBits(this._rxfd, count);
};

Uart.prototype.close = function () {
  this.removeAllListeners('data'); // Is this a good idea? Should the user be doing this?

  // TODO: the following is a bit of a hack.
  // Here \n EOF is faked for this._rxfd inorder to close the read stream.
  // It's faked three times as the uart may receive a character between
  // \n and EOF and the stream will not be closed. Faking three times
  // increases the chances of it working!
  su.setCanonical(this._rxfd, true);
  su.fakeInput(this._rxfd, '\n'.charCodeAt(0));
  su.fakeInput(this._rxfd, 4); // fake eof
  su.fakeInput(this._rxfd, '\n'.charCodeAt(0));
  su.fakeInput(this._rxfd, 4); // fake eof
  su.fakeInput(this._rxfd, '\n'.charCodeAt(0));
  su.fakeInput(this._rxfd, 4); // fake eof
};

