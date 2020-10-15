const noflo = require('noflo');

exports.getComponent = () => {
  const c = new noflo.Component();
  c.icon = 'expand';
  c.description = 'Like core/Split, but only begins sending at end of a stream';
  c.inPorts.add('in',
    { datatype: 'all' });
  c.outPorts.add('out',
    { datatype: 'all' });
  c.forwardBrackets = {};
  return c.process((input, output) => {
    if (!input.hasStream('in')) { return; }
    const stream = input.getStream('in');
    stream.forEach((packet) => {
      output.send({ out: packet });
    });
    output.done();
  });
};
