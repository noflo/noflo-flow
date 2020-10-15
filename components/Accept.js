/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const noflo = require("noflo");

exports.getComponent = function() {
  const c = new noflo.Component;
  c.description = 'accept and forward certain incoming packets';
  c.inPorts.add('in', {
    datatype: 'all',
    description: 'An IP to be forwarded if accepted'
  }
  );
  c.inPorts.add('accept', {
    datatype: 'all',
    description: 'IP to be accepted'
  }
  );
  c.inPorts.add('reset', {
    datatype: 'bang',
    description: 'Reset the list accepted IPs'
  }
  );
  c.outPorts.add('out',
    {datatype: 'all'});
  c.accepts = {};
  c.tearDown = function(callback) {
    c.accepts = {};
    return callback();
  };
  return c.process(function(input, output) {
    if (input.hasData('accept')) {
      const accept = input.getData('accept');
      if (!c.accepts[input.scope]) { c.accepts[input.scope] = []; }
      c.accepts[input.scope].push(accept);
      output.done();
      return;
    }
    if (input.hasData('reset')) {
      input.getData('reset');
      c.accepts = {};
      output.done();
      return;
    }
    if (!input.hasData('in')) { return; }
    const data = input.getData('in');
    if (c.accepts[input.scope].indexOf(data) === -1) {
      output.done();
      return;
    }
    return output.sendDone({
      out: data});
  });
};
