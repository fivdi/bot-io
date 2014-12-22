'use strict';

var pin;

var pwmPins = {
  p8_13: {subSystem: 2, module: 'ehrpwm2', channel: 1, muxMode: 4, mux: 'ehrpwm2B'},
  p8_19: {subSystem: 2, module: 'ehrpwm2', channel: 0, muxMode: 4, mux: 'ehrpwm2A'},
  p9_14: {subSystem: 1, module: 'ehrpwm1', channel: 0, muxMode: 6, mux: 'ehrpwm1A'},
  p9_16: {subSystem: 1, module: 'ehrpwm1', channel: 1, muxMode: 6, mux: 'ehrpwm1B'},
  p9_21: {subSystem: 0, module: 'ehrpwm0', channel: 1, muxMode: 3, mux: 'ehrpwm0B'},
  p9_22: {subSystem: 0, module: 'ehrpwm0', channel: 0, muxMode: 3, mux: 'ehrpwm0A'},
  p9_42: {subSystem: 0, module: 'ecap0',   channel: 0, muxMode: 0, mux: 'eCAP0_in_PWM0_out'}
};

var ainPins = {
  p9_33: {vsenseName: 'AIN4'},
  p9_35: {vsenseName: 'AIN6'},
  p9_36: {vsenseName: 'AIN5'},
  p9_37: {vsenseName: 'AIN2'},
  p9_38: {vsenseName: 'AIN3'},
  p9_39: {vsenseName: 'AIN0'},
  p9_40: {vsenseName: 'AIN1'}
};

var uartPins = {
  p9_11: {muxValue: 0x26}, // uart4 rx
  p9_13: {muxValue: 0x06}, // uart4 tx
  p9_21: {muxValue: 0x01}, // uart2 tx
  p9_22: {muxValue: 0x21}, // uart2 rx
  p9_24: {muxValue: 0x20}, // uart1 tx
  p9_26: {muxValue: 0x20}  // uart1 rx
};

var pins = {
  /* p8_01 - p8_06: power + emmc */

  p8_07: {gpioNo:  66, muxOffset: 0x090},
  p8_08: {gpioNo:  67, muxOffset: 0x094},
  p8_09: {gpioNo:  69, muxOffset: 0x09c},
  p8_10: {gpioNo:  68, muxOffset: 0x098},
  p8_11: {gpioNo:  45, muxOffset: 0x034},
  p8_12: {gpioNo:  44, muxOffset: 0x030},
  p8_13: {gpioNo:  23, muxOffset: 0x024, pwm: pwmPins.p8_13},
  p8_14: {gpioNo:  26, muxOffset: 0x028},
  p8_15: {gpioNo:  47, muxOffset: 0x03c},
  p8_16: {gpioNo:  46, muxOffset: 0x038},
  p8_17: {gpioNo:  27, muxOffset: 0x02c},
  p8_18: {gpioNo:  65, muxOffset: 0x08c},
  p8_19: {gpioNo:  22, muxOffset: 0x020, pwm: pwmPins.p8_19},

  /* p8_20 - p8_25: emmc */

  p8_26: {gpioNo:  61, muxOffset: 0x07c},

  /* p8_27 - p8_46: hdmi */

  /* p9_01 - p9_10: power + reset */

  p9_11: {gpioNo:  30, muxOffset: 0x070, uart: uartPins.p9_11},
  p9_12: {gpioNo:  60, muxOffset: 0x078},
  p9_13: {gpioNo:  31, muxOffset: 0x074, uart: uartPins.p9_13},
  p9_14: {gpioNo:  50, muxOffset: 0x048, pwm: pwmPins.p9_14},
  p9_15: {gpioNo:  48, muxOffset: 0x040},
  p9_16: {gpioNo:  51, muxOffset: 0x04c, pwm: pwmPins.p9_16},
  p9_17: {gpioNo:   5, muxOffset: 0x15c},
  p9_18: {gpioNo:   4, muxOffset: 0x158},

  /* p9_19 - p9_20: cape i2c EEPROM bus */

  p9_21: {gpioNo:   3, muxOffset: 0x154, pwm: pwmPins.p9_21, uart: uartPins.p9_21},
  p9_22: {gpioNo:   2, muxOffset: 0x150, pwm: pwmPins.p9_22, uart: uartPins.p9_22},
  p9_23: {gpioNo:  49, muxOffset: 0x044},
  p9_24: {gpioNo:  15, muxOffset: 0x184, uart: uartPins.p9_24},
/*  p9_25: {gpioNo: 117, muxOffset: 0x1ac}, audio */
  p9_26: {gpioNo:  14, muxOffset: 0x180, uart: uartPins.p9_26},
  p9_27: {gpioNo: 115, muxOffset: 0x1a4},
/*  p9_28: {gpioNo: 113, muxOffset: 0x19c}, audio */
/*  p9_29: {gpioNo: 111, muxOffset: 0x194}, audio */
  p9_30: {gpioNo: 112, muxOffset: 0x198},
/*  p9_31: {gpioNo: 110, muxOffset: 0x190}, audio */

  /* p9_32: adc power */
  p9_33: {ain: ainPins.p9_33}, // AIN4
  /* p9_34: adc power */
  p9_35: {ain: ainPins.p9_35}, // AIN6
  p9_36: {ain: ainPins.p9_36}, // AIN5
  p9_37: {ain: ainPins.p9_37}, // AIN2
  p9_38: {ain: ainPins.p9_38}, // AIN3
  p9_39: {ain: ainPins.p9_39}, // AIN0
  p9_40: {ain: ainPins.p9_40}, // AIN1

  p9_41: {gpioNo:  20, muxOffset: 0x1b4},
  p9_42: {gpioNo:   7, muxOffset: 0x164, pwm: pwmPins.p9_42}

  /* p9_43 - p9_46: power */
};

// Give each pin a name.
for (pin in pins) {
  if (pins.hasOwnProperty(pin)) {
    pins[pin].name = pin;
  }
}

module.exports = pins;

