/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const noflo = require('noflo');

exports.getComponent = function() {
  const c = new noflo.Component;
  c.description = `Gathers data from all incoming connections and sends \
them together in order of connection`;
  c.inPorts.add('in', {
    datatype: 'all',
    addressable: true
  }
  );
  c.outPorts.add('out',
    {datatype: 'all'});
  return c.process(function(input, output) {
    const indexesWithStreams = input.attached('in').filter(idx => input.hasStream(['in', idx]));
    if (indexesWithStreams.length !== input.attached('in').length) { return; }
    for (let idx of Array.from(indexesWithStreams)) {
      const stream = input.getStream(['in', idx]);
      for (let packet of Array.from(stream)) {
        packet.index = idx;
        output.send({
          out: packet});
      }
    }
    return output.done();
  });
};
