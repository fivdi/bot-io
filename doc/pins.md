## pins Object - Header Pins

An object with one pin property for each header pin available for usage.
Typically, pin objects are passed to constructors.

```js
var bot = require('bot-io'),
  button = new bot.Button(bot.pins.p9_24),
  led1 = new bot.Led(bot.pins.p9_26),
  led2 = new bot.Pwm(bot.pins.p9_42),
  ain = new bot.Ain(bot.pins.p9_36);
```

Name | GPIO | PWM | ADC | UART |
:---: | :---: | :---: | :---: | :---: |
  p8_07 | 66 | | | |
  p8_08 | 67 | | | |
  p8_09 | 69 | | | |
  p8_10 | 68 | | | |
  p8_11 | 45 | | | |
  p8_12 | 44 | | | |
  p8_13 | 23 | ehrpwm2B | | |
  p8_14 | 26 | | | |
  p8_15 | 47 | | | |
  p8_16 | 46 | | | |
  p8_17 | 27 | | | |
  p8_18 | 65 | | | |
  p8_19 | 22 | ehrpwm2A | | |
  p8_26 | 61 | | | |
  p9_11 | 30 | | | uart4_rxd |
  p9_12 | 60 | | | |
  p9_13 | 31 | | | uart4_txd |
  p9_14 | 50 | ehrpwm1A | | |
  p9_15 | 48 | | | |
  p9_16 | 51 | ehrpwm1B | | |
  p9_17 | 5 | | | |
  p9_18 | 4 | | | |
  p9_21 | 3 | ehrpwm0B | | uart2_txd |
  p9_22 | 2 | ehrpwm0A | | uart2_rxd |
  p9_23 | 49 | | | |
  p9_24 | 15 | | | uart1_txd |
  p9_26 | 14 | | | uart1_rxd |
  p9_27 | 115 | | | |
  p9_30 | 112 | | | |
  p9_33 | | | AIN4 | |
  p9_35 | | | AIN6 | |
  p9_36 | | | AIN5 | |
  p9_37 | | | AIN2 | |
  p9_38 | | | AIN3 | |
  p9_39 | | | AIN0 | |
  p9_40 | | | AIN1 | |
  p9_41 | 20 | | | |
  p9_42 | 7 | eCAP0_in_PWM0_out | | |

