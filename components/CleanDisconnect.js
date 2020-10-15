const noflo = require('noflo');

exports.getComponent = () => {
  const c = new noflo.Component();
  c.description = 'when several streams are nested through the array in-port (i.e. a connect through one of the ports before there is a disconnect), separate the streams into distinct streams with no overlapping';
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
    if (!indexesWithStreams.length) { return; }
    indexesWithStreams.forEach((idx) => {
      const stream = input.getStream(['in', idx]);
      stream.forEach((packet) => {
        output.send({
          out: {
            ...packet,
            index: idx,
          },
        });
      });
    });
    output.done();
  });
};
