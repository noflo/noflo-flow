/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const noflo = require('noflo');

exports.getComponent = function () {
  const c = new noflo.Component();
  c.description = 'deny certain incoming packets';
  c.inPorts.add('in', {
    datatype: 'all',
    description: 'An IP to be forwarded if accepted',
  });
  c.inPorts.add('deny', {
    datatype: 'all',
    description: 'IP to be denied',
  });
  c.inPorts.add('reset', {
    datatype: 'bang',
    description: 'Reset the list denied IPs',
  });
  c.outPorts.add('out',
    { datatype: 'all' });
  c.denied = {};
  c.tearDown = function (callback) {
    c.denied = {};
    return callback();
  };
  return c.process((input, output) => {
    if (input.hasData('deny')) {
      const deny = input.getData('deny');
      if (!c.denied[input.scope]) { c.denied[input.scope] = []; }
      c.denied[input.scope].push(deny);
      output.done();
      return;
    }
    if (input.hasData('reset')) {
      input.getData('reset');
      c.denied = {};
      output.done();
      return;
    }
    if (!input.hasData('in')) { return; }
    const data = input.getData('in');
    if (c.denied[input.scope].indexOf(data) !== -1) {
      output.done();
      return;
    }
    return output.sendDone({ out: data });
  });
};
