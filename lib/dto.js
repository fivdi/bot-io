'use strict';

var fs = require('fs'),
  cp = require('child_process'),
  _ = require('lodash'),
  slots = require('./slots');

var FS_OPTIONS = {encoding: 'utf8'},
  FIRMWARE_DIR = '/lib/firmware',
  VERSION = '00A0';

function Dto(templateFile) {
  var template;

  if (!(this instanceof Dto)) {
    return new Dto(templateFile);
  }

  template = fs.readFileSync(templateFile, FS_OPTIONS);
  this.transform = _.template(template, null, {
    interpolate: /{{([\s\S]+?)}}/g
  });
}
module.exports = Dto;

Dto.prototype.install = function (config, cb) {
  var dts,
    prefix = FIRMWARE_DIR + '/' + config.partNumber + '-' + VERSION,
    dtsFile = prefix + '.dts';

  config.version = VERSION;

  dts = this.transform(config);

  fs.writeFile(dtsFile, dts, FS_OPTIONS, function (err) {
    var command,
      dtboFile = prefix + '.dtbo';

    if (err) {
      return cb(err);
    }

    command = 'dtc -O dtb -o ' + dtboFile + ' -b 0 -@ ' + dtsFile;
    cp.exec(command, function (err, stdout, stderr) {
      if (err) {
        return cb(err, stdout, stderr);
      }

      slots.add(config.partNumber); // TODO - make slots stuff async or use try/catch to catch exceptions
      cb(null);
    });
  });
};

