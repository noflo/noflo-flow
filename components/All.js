const noflo = require('noflo');

function prepareScope() {
  const data = {
    results: {},
    resolved: false,
    rejected: false,
  };
  return data;
}

exports.getComponent = () => {
  const c = new noflo.Component();
  c.description = 'Like Promise.all, wait for result from all connected inputs and send them or an error out';
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
  c.tearDown = (callback) => {
    c.pending = {};
    callback();
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
      // Drop any results since something failed
      delete c.pending[input.scope].results;
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
        return stream.map((ip) => ip.drop());
      });
      output.done();
      return;
    }

    // Read results
    const {
      results,
    } = c.pending[input.scope];
    indexesWithStreams.forEach((idx) => {
      const stream = input.getStream(['in', idx]).filter((ip) => ip.type === 'data');
      // If this connection already sent, disregard the new stream
      if (results[idx]) { return; }
      // Add to results
      if (!results[idx]) { results[idx] = []; }
      results[idx] = results[idx].concat(stream);
    });

    // Check if we have all results
    const attached = input.attached('in');
    for (let i = 0; i < attached.length; i += 1) {
      const idx = attached[i];
      if (!results[idx] || !results[idx].length) {
        // Still waiting
        output.done();
        return;
      }
    }

    // Mark as resolved
    c.pending[input.scope].resolved = true;
    // Send data
    const resultData = input.attached('in').map((idx) => results[idx].map((ip) => ip.data));
    output.sendDone({ out: resultData });
    // Clean packets
    delete c.pending[input.scope].results;
  });
};
