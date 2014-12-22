'use strict';

var assert = require('assert'),
  Uart = require('../').Uart,
  uart = new Uart(Uart.UART4, {baudRate: Uart.B115200, parity: Uart.PARITY_ODD});

uart.once('ready', function () {
  var error;

  assert.equal(uart.parity(), Uart.PARITY_ODD, 'expected Uart.PARITY_ODD');
  uart.parity(Uart.PARITY_EVEN);
  assert.equal(uart.parity(), Uart.PARITY_EVEN, 'expected Uart.PARITY_EVEN');
  uart.parity(Uart.PARITY_NONE);
  assert.equal(uart.parity(), Uart.PARITY_NONE, 'expected Uart.PARITY_NONE');

  try {
    // attempt to set parity to something that's not allowed
    uart.parity('invalid parity type');
  } catch (e) {
    error = e;
  }

  assert.equal(error === undefined, false, 'error expected');

  uart.close();
});

