/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const noflo = require("noflo");

exports.getComponent = function() {
  const c = new noflo.Component;
  c.description = `when several streams are nested through the array \
in-port (i.e. a connect through one of the ports before there is a \
disconnect), separate the streams into distinct streams with no \
overlapping`;
  c.inPorts.add('in', {
    datatype: 'all',
    addressable: true
  }
  );
  c.outPorts.add('out', {
    datatype: 'all',
    addressable: true
  }
  );
  c.forwardBrackets = {};
  return c.process(function(input, output) {
    const indexesWithStreams = input.attached('in').filter(idx => input.hasStream(['in', idx]));
    if (!indexesWithStreams.length) { return; }
    indexesWithStreams.forEach(function(idx) {
      const stream = input.getStream(['in', idx]);
      return (() => {
        const result = [];
        for (let packet of Array.from(stream)) {
          packet.index = idx;
          result.push(output.send({
            out: packet}));
        }
        return result;
      })();
    });
    return output.done();
  });
};
