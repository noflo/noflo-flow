/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const noflo = require('noflo');

exports.getComponent = function () {
  const c = new noflo.Component();
  c.icon = 'expand';
  c.description = 'Like core/Split, expect the last port gets forwarded \
packets first';
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
    for (const idx of Array.from(attached)) {
      output.send({
        out: new noflo.IP(packet.type, packet.data, {
          index: idx,
          datatype: packet.datatype,
          schema: packet.schema,
          clonable: packet.clonable,
        }),
      });
    }
    return output.done();
  });
};
