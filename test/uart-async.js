'use strict';

var Uart = require('../').Uart,
  uart4 = new Uart(Uart.UART4, {baudRate: Uart.B115200}),
  sendBuf = new Buffer(11520 * 1000),
  iv1Count = 0,
  iv2Count = 0,
  iv1,
  iv2;

sendBuf.fill(0);

uart4.once('ready', function () {
  uart4.on('finish', function () {
    console.log('finish');
    clearInterval(iv1);
    clearInterval(iv2);
  });

  console.log('before write');
  uart4.write(sendBuf, function () {
    console.log('write callback (flushed)');
  });
  console.log('after write');

  uart4.end();

  iv1 = setInterval(function () {
    iv1Count += 1;
  }, 10);

  iv2 = setInterval(function () {
    iv2Count += 1;
    console.log(iv2Count + ': ' +iv1Count);
    iv1Count = 0;
  }, 1000);
});

