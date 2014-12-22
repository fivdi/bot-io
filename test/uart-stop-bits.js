'use strict';

var assert = require('assert'),
  Uart = require('../').Uart,
  uart = new Uart(Uart.UART4, {baudRate: Uart.B115200, stopBits: 2});

uart.once('ready', function () {
  var error;

  assert.equal(uart.stopBits(), 2, 'expected stop bit count of 2');
  uart.stopBits(1);
  assert.equal(uart.stopBits(), 1, 'expected stop bit count of 1');

  try {
    uart.characterSize(0);
  } catch (e) {
    error = e;
  }

  assert.equal(error === undefined, false, 'error expected');

  uart.close();
});

