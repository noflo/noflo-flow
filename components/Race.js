/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const noflo = require('noflo');

const prepareScope = function () {
  const data = {
    resolved: false,
    rejected: false,
  };
  return data;
};

exports.getComponent = function () {
  const c = new noflo.Component();
  c.description = 'Like Promise.all, wait for result from all connected inputs \
and send them or an error out';
  c.icon = 'compress';
  c.inPorts.add('in', {
    datatype: 'all',
    addressable: true,
  });
  c.inPorts.add('error',
    { datatype: 'object' });
  c.outPorts.add('out',
    { datatype: 'array' });
  c.outPorts.add('error',
    { datatype: 'object' });
  c.pending = {};
  c.tearDown = function (callback) {
    c.pending = {};
    return callback();
  };
  c.forwardBrackets = {};
  return c.process((input, output) => {
    if (input.hasData('error')) {
      // There is a failure in this scope, reject it
      const err = input.getData('error');
      if (!c.pending[input.scope]) {
        c.pending[input.scope] = prepareScope();
      }
      if (c.pending[input.scope].rejected || c.pending[input.scope].resolved) {
        // This scope was already resolved
        output.done();
        return;
      }
      // Mark scope as rejected
      c.pending[input.scope].rejected = true;
      output.sendDone({ error: err });
      return;
    }

    // See if we have any input results
    const indexesWithStreams = input.attached('in').filter((idx) => input.hasStream(['in', idx]));
    if (!indexesWithStreams.length) { return; }

    if (!c.pending[input.scope]) {
      c.pending[input.scope] = prepareScope();
    }

    // Check if the execution was already resolved
    if (c.pending[input.scope].rejected || c.pending[input.scope].resolved) {
      indexesWithStreams.forEach((idx) => {
        // Drop all packets that arrive after resolution
        const stream = input.getStream(['in', idx]);
        return Array.from(stream).map((ip) => ip.drop());
      });
      output.done();
      return;
    }

    // Read results
    const results = input.getStream(['in', indexesWithStreams[0]]).filter((ip) => ip.type === 'data');

    // Mark as resolved
    c.pending[input.scope].resolved = true;
    // Send data
    const data = results.map((ip) => ip.data);
    return output.sendDone({ out: data });
  });
};
