/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const noflo = require('noflo');

exports.getComponent = function () {
  const c = new noflo.Component();
  c.description = 'send connection to \'yes\' if its top-level group is one \
of the provided groups, otherwise \'no\'';
  c.inPorts.add('in', {
    datatype: 'all',
    description: 'IPs to route use their groups',
  });
  c.inPorts.add('regexp', {
    datatype: 'string',
    description: 'Regexps to match groups',
  });
  c.inPorts.add('group', {
    datatype: 'string',
    description: 'List of groups (one group per IP)',
  });
  c.inPorts.add('reset', {
    datatype: 'bang',
    description: 'Reset the list of groups and regexps',
  });
  c.outPorts.add('yes', {
    datatype: 'all',
    description: 'IPs with group that match the groups or regexps provided',
  });
  c.outPorts.add('no', {
    datatype: 'all',
    description: 'IPs with group that don\'t match the groups or regexps \
provided',
  });
  c.forwardBrackets = {};
  c.matchGroups = [];
  c.regexps = [];
  const reset = function () {
    c.matchGroups = [];
    return c.regexps = [];
  };
  c.tearDown = function (callback) {
    reset();
    return callback();
  };
  return c.process((input, output) => {
    let packet;
    if (input.hasData('group')) {
      c.matchGroups.push(input.getData('group'));
      output.done();
      return;
    }
    if (input.hasData('regexp')) {
      c.regexps.push(new RegExp(input.getData('regexp')));
      output.done();
      return;
    }
    if (input.hasData('reset')) {
      input.getData('reset');
      reset();
      output.done();
      return;
    }
    if (!input.hasStream('in')) { return; }
    const packets = input.getStream('in');
    if (packets[0].type !== 'openBracket') {
      // Stream doesn't start with a group, send to NO
      for (packet of Array.from(packets)) {
        output.send({ no: packet });
      }
      output.done();
      return;
    }
    let matched = false;
    const group = packets[0].data;
    for (const matchGroup of Array.from(c.matchGroups)) {
      if (group !== matchGroup) { continue; }
      matched = true;
    }
    for (const regexp of Array.from(c.regexps)) {
      if (group.match(regexp) == null) { continue; }
      matched = true;
    }
    if (!matched) {
      for (packet of Array.from(packets)) {
        output.send({ no: packet });
      }
      output.done();
      return;
    }
    for (packet of Array.from(packets)) {
      output.send({ yes: packet });
    }
    output.done();
  });
};
