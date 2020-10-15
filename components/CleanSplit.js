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
  c.description = 'Like core/Split, but only begins sending at end of a stream';
  c.inPorts.add('in',
    { datatype: 'all' });
  c.outPorts.add('out',
    { datatype: 'all' });
  c.forwardBrackets = {};
  return c.process((input, output) => {
    if (!input.hasStream('in')) { return; }
    const stream = input.getStream('in');
    for (const packet of Array.from(stream)) {
      output.send({ out: packet });
    }
    return output.done();
  });
};
