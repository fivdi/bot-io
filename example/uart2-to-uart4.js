'use strict';

// Assumes uart2 is wired to uart4. Sends data from uart2 to uart4.
var bot = require('../'),
  Uart = bot.Uart,
  uart2 = new Uart(Uart.UART2, {baudRate: Uart.B3000000}),
  uart4 = new Uart(Uart.UART4, {baudRate: Uart.B3000000}),
  buf = new Array(10000 + 1).join('hello'),
  charsReceived = 0;

bot.once('ready', [uart2, uart4], function () {
  uart2.end(buf);
});

uart4.on('data', function (chunk) {
  charsReceived += chunk.length;
  console.log(charsReceived + ' ' + chunk);
  if (charsReceived === buf.length) {
    uart2.close();
    uart4.end();
    uart4.close();
  }
});

