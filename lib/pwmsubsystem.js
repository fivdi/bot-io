'use strict';

var events = require('events'),
  util = require('util'),
  Dto = require('./dto'),
  dto = new Dto(__dirname + '/../templates/pwm-sub-system.dts');

function PwmSubSystem(subSystem) {
  var config;

  if (!(this instanceof PwmSubSystem)) {
    return new PwmSubSystem(subSystem);
  }

  this.name = 'bot_pwm_ss' + subSystem;
  this.ready = false;

  config = {
    partNumber: this.name,
    subSystem: subSystem
  };

  dto.install(config, function (err) {
    if (err) {
      return this.emit('error', err);
    }

    this.ready = true;
    this.emit('ready');
  }.bind(this));
}
util.inherits(PwmSubSystem, events.EventEmitter);
module.exports = PwmSubSystem;

