/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const noflo = require('noflo');

exports.getComponent = function () {
  const c = new noflo.Component();
  c.description = 'Send packets in to outport indexes in reverse order \
when matching number of inport indexes have received data to attached \
outports';
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
    for (const idx of Array.from(indexesWithStreams)) {
      streams.push(input.getStream(['in', idx]));
    }
    streams.reverse();
    attached.reverse();
    for (const outIdx of Array.from(attached)) {
      if (!streams.length) { continue; }
      const stream = streams.shift();
      for (const packet of Array.from(stream)) {
        output.send(new noflo.IP(packet.type, packet.data, {
          index: outIdx,
          datatype: packet.datatype,
          schema: packet.schema,
          clonable: packet.clonable,
        }));
      }
    }
    return output.done();
  });
};
