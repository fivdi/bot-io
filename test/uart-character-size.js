'use strict';

var assert = require('assert'),
  Uart = require('../').Uart,
  uart = new Uart(Uart.UART4, {baudRate: Uart.B115200, characterSize: 5});

uart.once('ready', function () {
  var error;

  assert.equal(uart.characterSize(), 5, 'expected character size 5');
  uart.characterSize(6);
  assert.equal(uart.characterSize(), 6, 'expected character size 6');
  uart.characterSize(7);
  assert.equal(uart.characterSize(), 7, 'expected character size 7');
  uart.characterSize(8);
  assert.equal(uart.characterSize(), 8, 'expected character size 8');

  try {
    uart.characterSize(9);
  } catch (e) {
    error = e;
  }

  assert.equal(error === undefined, false, 'error expected');

  uart.close();
});

