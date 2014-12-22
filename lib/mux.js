'use strict';

var pullTypes = require('./pulltypes');

// rxactive - 0 for output only. 1 for input or output.
module.exports.muxValue = function (pullType, rxactive) {
  var muxValue = 0;

  switch (pullType) {
  case pullTypes.NONE:
    muxValue = 0x0f;
    break;

  case pullTypes.PULL_DOWN:
    muxValue = 0x07;
    break;

  case pullTypes.PULL_UP:
  default:
    muxValue = 0x17;
    break;
  }

  if (rxactive) {
    muxValue |= 0x20;
  }

  return muxValue;
};

