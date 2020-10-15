/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const noflo = require('noflo');

exports.getComponent = function () {
  const c = new noflo.Component();
  c.description = 'Like \'core/Merge\', but merge up to a specified \
number of streams.';
  c.inPorts.add('in', {
    datatype: 'all',
    description: 'IP to merge',
  });
  c.inPorts.add('threshold', {
    datatype: 'int',
    control: true,
    default: 1,
  });
  c.outPorts.add('out',
    { datatype: 'all' });

  c.received = 0;
  c.tearDown = function (callback) {
    c.received = 0;
    return callback();
  };

  c.forwardBrackets = {};

  return c.process((input, output) => {
    let packet; let
      threshold;
    if (!input.hasStream('in')) { return; }
    if (input.attached('threshold') && !input.hasData('threshold')) { return; }
    if (input.hasData('threshold')) {
      threshold = input.getData('threshold');
    } else {
      threshold = 1;
    }
    const packets = input.getStream('in');
    if (c.received < threshold) {
      // We can still send
      for (packet of Array.from(packets)) {
        output.send({ out: packet });
      }
    } else {
      // Over threshold, drop packets
      for (packet of Array.from(packets)) { packet.drop(); }
    }
    c.received++;
    return output.done();
  });
};
