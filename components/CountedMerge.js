const noflo = require('noflo');

exports.getComponent = () => {
  const c = new noflo.Component();
  c.description = 'Like \'core/Merge\', but merge up to a specified number of streams.';
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
  c.tearDown = (callback) => {
    c.received = 0;
    return callback();
  };

  c.forwardBrackets = {};

  return c.process((input, output) => {
    if (!input.hasStream('in')) { return; }
    if (input.attached('threshold') && !input.hasData('threshold')) { return; }
    let threshold = 1;
    if (input.hasData('threshold')) {
      threshold = input.getData('threshold');
    }
    const packets = input.getStream('in');
    if (c.received < threshold) {
      // We can still send
      packets.forEach((packet) => {
        output.send({ out: packet });
      });
    } else {
      // Over threshold, drop packets
      packets.forEach((packet) => {
        packet.drop();
      });
    }
    c.received += 1;
    output.done();
  });
};
