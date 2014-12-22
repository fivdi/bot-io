'use strict';

/*
 * Use BBB UART4 to communicate with UART0 on an NXP LPC810. This program
 * assumes that lpc810-uart.c is running on the LPC810. When lpc810-uart.c
 * receives a character, it simply echoes it back 11520 times.
 */
var Uart = require('../').Uart,
  uart4 = new Uart(Uart.UART4, {baudRate: Uart.B115200}),
  sendBuf = new Buffer([0]),
  chunksReceived = 0,
  bytesReceived = 0;

uart4.once('ready', function () {
  uart4.write(sendBuf);
});

uart4.on('data', function (chunk) {
  chunksReceived += 1;
  bytesReceived += chunk.length;
  if (bytesReceived === 11520) {
    console.log('char: ' + chunk[0] + ', chunks: ' + chunksReceived + ', bytes: ' + bytesReceived);
    sendBuf[0] = (sendBuf[0] + 1) % 256;
    uart4.write(sendBuf);
    chunksReceived = 0;
    bytesReceived = 0;
  }
});

