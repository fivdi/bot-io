## Pwm Class - Pulse Width Modulation

### Constructor: Pwm(pin, options)
- pin - a pwm capable pin object
- options - object (optional)

Creates a Pwm object for controlling a PWM capable output pin. The period and
duty properties of the options object can be used to configure PWM switching
frequency and duty cycle. Additional options are available for configuring the
PWM polarity and whether or not the PWM signal is initially enabled.

The following options are supported:
- period - period in nannoseconds (optional, default 500000 nanoseconds)
- duty - duty in nanoseconds (optional, default 0 nanoseconds)
- enabled - true or false (optional, default true)
- polarity - Pwm.LOW or Pwm.HIGH (optional, default Pwm.LOW)

### Method: period(value)
- value - period in nannoseconds (optional)

Returns the current period if no value is specified, else sets period to the
specified value. The unit for period is nanoseconds.

Under the covers, PWM capables pins are organized by the hardware into modules.
If two PWM pins from the same module are used, they both must be configured
with the same period and the period can't be modified after it has been
configured.

Module | Pins
:---: | :---:
ehrpwm0 | P9_21, P9_22
ehrpwm1 | P9_14, P9_16
ehrpwm2 | P8_13, P8_19
ecap0 | P9_42

### Method: duty(value)
- value - duty in nannoseconds (optional)

Returns the current duty if no value is specified, else sets duty to the
specified value. The unit for duty is nanoseconds.

### Method: enabled(value)
- value - true or false (optional)

Returns a boolean specifying whether or not the PWM is enabled, if no value is
specified, else enables or disables the PWM depending on the value specified.

### Method: polarity(value)
- value - Pwm.LOW or Pwm.HIGH (optional)

Returns Pwm.LOW or Pwm.HIGH specifying the polarity of the PWM, if no value is
specified, else sets the polarity to the specified value.

### Event: 'ready'
Emitted after the constructor has completed creation of the Pwm object
indicating that the object is now ready for usage.

### Event: 'error'
Emitted on error.

