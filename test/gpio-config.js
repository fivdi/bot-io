'use strict';

var assert = require('assert'),
  bot = require('../'),
  pullTypes = bot.pullTypes,
  Gpio = bot.Gpio,
  gpio = new Gpio(bot.pins.p8_07, {
    direction: Gpio.IN,
    pullType: pullTypes.PULL_UP
  });

gpio.once('ready', function () {
  assert.equal(gpio.pullType(), pullTypes.PULL_UP, 'expected pullTypes.PULL_UP');
  assert.equal(gpio.value(), 1, 'expected value of 1');

  gpio.pullType(pullTypes.PULL_DOWN);
  assert.equal(gpio.pullType(), pullTypes.PULL_DOWN, 'expected pullTypes.PULL_DOWN');
  assert.equal(gpio.value(), 0, 'expected value of 0');

  gpio.pullType(pullTypes.PULL_UP);
  assert.equal(gpio.pullType(), pullTypes.PULL_UP, 'expected pullTypes.PULL_UP');
  assert.equal(gpio.value(), 1, 'expected value of 1');

  gpio.pullType(pullTypes.NONE);
  assert.equal(gpio.pullType(), pullTypes.NONE, 'expected pullTypes.NONE');

  assert.equal(gpio.direction(), Gpio.IN, 'expected Gpio.IN');

  gpio.direction(Gpio.OUT);
  assert.equal(gpio.direction(), Gpio.OUT, 'expected Gpio.OUT');

  gpio.direction(Gpio.IN);
  assert.equal(gpio.direction(), Gpio.IN, 'expected Gpio.IN');

  assert.equal(gpio.edge(), Gpio.NONE, 'expected Gpio.NONE');

  gpio.edge(Gpio.FALLING);
  assert.equal(gpio.edge(), Gpio.FALLING, 'expected Gpio.FALLING');

  gpio.edge(Gpio.RISING);
  assert.equal(gpio.edge(), Gpio.RISING, 'expected Gpio.RISING');

  gpio.edge(Gpio.BOTH);
  assert.equal(gpio.edge(), Gpio.BOTH, 'expected Gpio.BOTH');

  gpio.edge(Gpio.NONE);
  assert.equal(gpio.edge(), Gpio.NONE, 'expected Gpio.NONE');

  gpio.pullType(pullTypes.PULL_UP);

  assert.equal(gpio.isActiveLow(), false, 'expected isActiveLow false');

  gpio.isActiveLow(true);
  assert.equal(gpio.isActiveLow(), true, 'expected isActiveLow true');

  assert.equal(gpio.value(), 0, 'expected value 0');
});

