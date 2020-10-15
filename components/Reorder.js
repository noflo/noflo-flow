const noflo = require('noflo');

exports.getComponent = () => {
  const c = new noflo.Component();
  c.description = 'Send packets in to outport indexes in reverse order when matching number of inport indexes have received data to attached outports';
  c.inPorts.add('in', {
    datatype: 'all',
    addressable: true,
  });
  c.outPorts.add('out', {
    datatype: 'all',
    addressable: true,
  });
  c.forwardBrackets = {};
  return c.process((input, output) => {
    const indexesWithStreams = input.attached('in').filter((idx) => input.hasStream(['in', idx]));
    let attached = c.outPorts.out.listAttached().slice(0);
    let expectedStreams = attached.length;
    if (input.attached('in').length < attached.length) {
      // Fewer attached inputs than outputs, use their number
      expectedStreams = input.attached('in').length;
      attached = attached.slice(0, expectedStreams);
    }
    if (indexesWithStreams.length < expectedStreams) { return; }
    const streams = [];
    indexesWithStreams.forEach((idx) => {
      streams.push(input.getStream(['in', idx]));
    });
    streams.reverse();
    attached.reverse();
    attached.forEach((outIdx) => {
      if (!streams.length) { return; }
      const stream = streams.shift();
      stream.forEach((packet) => {
        output.send(new noflo.IP(packet.type, packet.data, {
          index: outIdx,
          datatype: packet.datatype,
          schema: packet.schema,
          clonable: packet.clonable,
        }));
      });
    });
    output.done();
  });
};
