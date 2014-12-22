## Ain Class - Analog to Digital Conversion

### Constructor: Ain(pin, options)
- pin - an analog capable pin object
- options - object (optional)

Creates an Ain (analog input) object for reading the value from an analog
capable input pin. The rawValue is a millivolt value in the range 0 to 1800.
The value is a scaled value in the range 0 to 1 by default.

The following options are supported:
- scaledMin - number (optional, default 0)
- scaledMax - number (optional, default 1)
- vsenseScale - number (optional, default 100)

### Method: value()
Returns the scaled value of the analog input pin. The value is in the range 0
to 1 by default. This range can be configured using the scaledMin and scaledMax
constructor options.

### Method: rawValue()
Returns the raw value of the analog input pin. The raw value is millivolt value
in the range 0 to 1800.

### Event: 'ready'
Emitted after the constructor has completed creation of the Ain object
indicating that the object is now ready for usage.

### Event: 'error'
Emitted on error.

