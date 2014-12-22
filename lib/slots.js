'use strict';

var fs = require('fs'),
  glob = require('glob');

var SLOTS_PATH,
  FS_OPTIONS = {encoding: 'utf8'};

/**
 * The location of the slots file is a constant, but varies from system to
 * system. Determine where it is and store it in SLOTS_PATH for future use.
 */
(function () {
  var PATTERN = '/sys/devices/bone_capemgr.*/slots',
    matches = glob.sync(PATTERN);

  if (matches.length !== 1) {
    throw new Error('No unique slots file matching \'' + PATTERN + '\' found');
  }

  SLOTS_PATH = matches[0];
}());

/**
 * Returns the number of the slot with the specified name. Returns -1 if there
 * is no such slot.
 *
 * name: string // Slot name
 *
 * Returns - number // Slot number or -1
 */
function number(name) {
  var slots = fs.readFileSync(SLOTS_PATH, FS_OPTIONS).split('\n'),
    i;

  name = ',' + name;

  // Search backwards. Added slots are more likely to be at end of slots file.
  for (i = slots.length - 1; i >= 0; i -= 1) {
    if (slots[i].indexOf(name, slots[i].length - name.length) !== -1) {
      return parseInt(slots[i], 10);
    }
  }

  return -1;
}
module.exports.number = number;

/**
 * Adds a slot with the specified name if there is not already a slot with
 * that name. Does nothing if there is already a slot with the specified name.
 *
 * name: string // Slot name
 *
 * Returns - undefined
 *
 * Throws ENOENT Errors if the required device-tree file does not exist in
 * /lib/firmware
 */
module.exports.add = function (name) {
  var slotNumber = number(name);

  if (slotNumber === -1) {
    fs.writeFileSync(SLOTS_PATH, name, FS_OPTIONS);
  }
};

/**
 * Removes the slot with the specified name if there is a slot with that name.
 * Does nothing if there is no such slot.
 *
 * name: string // Slot name
 *
 * Returns - undefined
 */
module.exports.remove = function (name) {
  var slotNumber = number(name);

  if (slotNumber !== -1) {
    fs.writeFileSync(SLOTS_PATH, '' + -slotNumber, FS_OPTIONS);
  }
};

