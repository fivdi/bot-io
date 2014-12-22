## Uart - Serial Communication

### Constructor: Uart(uartDef, options)
- uartDef - Uart.UART1, Uart.UART2, Uart.UART4, or the device path of a UART such as /dev/ttyO1.
- options - object (optional)

Creates a Uart object which can be used for full-duplex asynchronous serial
communication. A Uart is a streams2 duplex stream. The options object can be
used to configure the various aspects of the UART such as its baud rate. 

The following options are supported:
- baudRate - one of the [baud rate constants](https://github.com/fivdi/bot-io/blob/master/doc/uart.md#baud-rate-constants) (optional, default Uart.B38400)
- characterSize - 5, 6, 7, or 8 (optional, default 8)
- parity - one of the [parity constants](https://github.com/fivdi/bot-io/blob/master/doc/uart.md#parity-constants) (optional, default Uart.PARITY_NONE)
- stopBits - 1 or 2 (optional, default 1)
- highWaterMark - number (optional, default 512)
- encoding - string (optional, default null)

Uart is a streams2 [Duplex](http://nodejs.org/api/stream.html#stream_class_stream_duplex)
stream that implements both the
[Readable](http://nodejs.org/api/stream.html#stream_class_stream_readable) and
[Writable](http://nodejs.org/api/stream.html#stream_class_stream_writable)
interfaces. Internally, [Duplexify](https://www.npmjs.org/package/duplexify)
is used to achaive this.

### Method: baudRate(rate)
- rate - one of the [baud rate constants](https://github.com/fivdi/bot-io/blob/master/doc/uart.md#baud-rate-constants) (optional)

Returns the baud rate of the UART if no rate is specified, else sets the baud
rate to the specified rate.

### Method: characterSize(size)
- size - 5, 6, 7, or 8 (optional)

Returns the character size if no size is specified, else sets the character
size to the specified size.

### Method: parity(type)
- type - one of the [parity constants](https://github.com/fivdi/bot-io/blob/master/doc/uart.md#parity-constants) (optional)

Returns the parity type of the UART if no type is specified, else sets the
parity type to the specified type.

### Method: stopBits(count)
- count - 1 or 2 (optional)

Returns the number of stop bits if no count is specified, else sets the number
of stop bits to the specified count.

### Method: close()
Close underlying resources.

### Event: 'open'
Emitted after the constructor has completed creation of the Uart object
indicating that the object is now ready for usage. Identical to the ready
event.

### Event: 'ready'
Emitted after the constructor has completed creation of the Uart object
indicating that the object is now ready for usage. Identical to the open
event.

### Event: 'close'
Emitted when the underlying resources have been closed. 

### Event: 'error'
Emitted on error.

### Constant: Uart.UART1
Passed to the Uart constructor as the uartDef argument to create a Uart object
which can be used for serial communication on UART1.

### Constant: Uart.UART2
Passed to the Uart constructor as the uartDef argument to create a Uart object
which can be used for serial communication on UART2.

### Constant: Uart.UART4
Passed to the Uart constructor as the uartDef argument to create a Uart object
which can be used for serial communication on UART4

### Baud Rate Constants

Constant | Baud Rate |
:---: | :---: |
Uart.B0 | 0 |
Uart.B50 | 50 |
Uart.B75 | 75 |
Uart.B110 | 110 |
Uart.B134 | 134 |
Uart.B150 | 150 |
Uart.B200 | 200 |
Uart.B300 | 300 |
Uart.B600 | 600 |
Uart.B1200 | 1200 |
Uart.B1800 | 1800 |
Uart.B2400 | 2400 |
Uart.B4800 | 4800 |
Uart.B9600 | 9600 |
Uart.B19200 | 19200 |
Uart.B38400 | 38400 |
Uart.B57600 | 57600 |
Uart.B115200 | 115200 |
Uart.B230400 | 230400 |
Uart.B460800 | 460800 |
Uart.B500000 | 500000 |
Uart.B576000 | 576000 |
Uart.B921600 | 921600 |
Uart.B1000000 | 1000000 |
Uart.B1152000 | 1152000 |
Uart.B1500000 | 1500000 |
Uart.B2000000 | 2000000 |
Uart.B2500000 | 2500000 |
Uart.B3000000 | 3000000 |
Uart.B3500000 | 3500000 |
Uart.B4000000 | 4000000 |

### Parity Constants

Constant | Parity |
:---: | :---: |
Uart.PARITY_NONE | no parity |
Uart.PARITY_ODD | odd parity |
Uart.PARITY_EVEN | even parity |

