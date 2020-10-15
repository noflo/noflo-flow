/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const noflo = require('noflo');

exports.getComponent = function () {
  const c = new noflo.Component();
  c.description = 'count down from particular number, by default 1, and \
send an empty IP when it hits 0';
  c.inPorts.add('in', {
    datatype: 'bang',
    description: 'IPs to decrease the count down',
  });
  c.inPorts.add('count', {
    datatype: 'int',
    description: 'Count down starting number',
    default: 1,
    control: true,
  });
  c.inPorts.add('repeat', {
    datatype: 'boolean',
    description: 'Repeat the count down mechanism if true',
    default: true,
    control: true,
  });
  c.outPorts.add('out', {
    datatype: 'bang',
    description: 'IP emitted when the count reach 0',
  });
  c.outPorts.add('count', {
    datatype: 'int',
    description: 'Number of packets received in this cycle',
  });
  c.received = 0;
  c.tearDown = function (callback) {
    c.received = 0;
    return callback();
  };
  return c.process((input, output) => {
    let count; let
      repeat;
    if (!input.hasData('in')) { return; }
    if (input.attached('count') && !input.hasData('count')) { return; }
    if (input.attached('repeat') && !input.hasData('repeat')) { return; }
    if (input.hasData('count')) {
      count = input.getData('count');
    } else {
      count = 1;
    }
    if (input.hasData('repeat')) {
      repeat = input.getData('repeat');
    } else {
      repeat = true;
    }
    input.getData('in');
    c.received++;
    output.send({ count: c.received });
    if (c.received === count) {
      output.send({ out: new noflo.IP('data', null) });
      if (repeat) { c.received = 0; }
    }
    return output.done();
  });
};
