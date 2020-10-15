const noflo = require('noflo');

exports.getComponent = () => {
  const c = new noflo.Component();
  c.description = 'Gathers data from all incoming connections and sends them together in order of connection';
  c.inPorts.add('in', {
    datatype: 'all',
    addressable: true,
  });
  c.outPorts.add('out',
    { datatype: 'all' });
  return c.process((input, output) => {
    const indexesWithStreams = input.attached('in').filter((idx) => input.hasStream(['in', idx]));
    if (indexesWithStreams.length !== input.attached('in').length) { return; }
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
