const noflo = require('noflo');

exports.getComponent = () => {
  const c = new noflo.Component();
  c.icon = 'expand';
  c.description = 'Like core/Split, expect the last port gets forwarded packets first';
  c.inPorts.add('in',
    { datatype: 'all' });
  c.outPorts.add('out', {
    datatype: 'all',
    addressable: true,
  });
  c.forwardBrackets = {};
  return c.process((input, output) => {
    if (!input.has('in')) { return; }
    const packet = input.get('in');
    const attached = c.outPorts.out.listAttached();
    attached.reverse();
    attached.forEach((idx) => {
      output.send({
        out: new noflo.IP(packet.type, packet.data, {
          index: idx,
          datatype: packet.datatype,
          schema: packet.schema,
          clonable: packet.clonable,
        }),
      });
    });
    output.done();
  });
};
