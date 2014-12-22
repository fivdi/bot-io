'use strict';

var events = require('events'),
  util = require('util'),
  Dto = require('./dto'),
  dto = new Dto(__dirname + '/../templates/ain-sub-system.dts');

function AinSubSystem() {
  var config;

  if (!(this instanceof AinSubSystem)) {
    return new AinSubSystem();
  }

  this.name = 'bot_ain_ss';
  this.ready = false;

  config = {
    partNumber: this.name
  };

  dto.install(config, function (err) {
    if (err) {
      return this.emit('error', err);
    }

    this.ready = true;
    this.emit('ready');
  }.bind(this));
}
util.inherits(AinSubSystem, events.EventEmitter);
module.exports = AinSubSystem;

