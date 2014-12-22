'use strict';

var fs = require('fs'),
  glob = require('glob'),
  number = require('./numberpool');

module.exports.OCP_ROOT_PATH = '/sys/devices/ocp.*/';

module.exports.waitForFile = function (pattern, cb) {
  function wait() {
    glob(pattern, null, function (err, matches) {
      if (err) {
        return cb(err);
      }

      if (matches.length === 0) {
        return setImmediate(wait); // TODO - Stop looping at some point!
      }
      if (matches.length > 1) {
        return cb(new Error('Multiple files matching \'' + pattern + '\' found'));
      }
      cb(null, matches[0]);
    });
  }

  setImmediate(wait);
};

module.exports.readNumber = function (fd, buf) {
  var len = fs.readSync(fd, buf, 0, buf.length, 0);
  return parseInt(buf.toString('utf8', 0, len - 1), 10); // -1 to ignore newline char
};

module.exports.writeNumber = function (fd, num) {
  var numBuf = number(num);

  if (fd !== -1) {
    fs.writeSync(fd, numBuf, 0, numBuf.length, 0);
  }
};

