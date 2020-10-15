/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const noflo = require('noflo');

exports.getComponent = function () {
  const c = new noflo.Component();
  c.description = 'Collect packets and send them when input stops after a given \
timeout';
  c.inPorts.add('in', {
    datatype: 'all',
    description: 'IPs to collect until a timeout',
  });
  c.inPorts.add('timeout', {
    datatype: 'number',
    description: 'Amount of time to hold IPs for in milliseconds',
    default: 300,
    control: true,
  });
  c.outPorts.add('out', {
    datatype: 'all',
    description: 'IPs collected until the timeout',
  });
  c.timeout = null;
  const clear = function () {
    if (!c.timeout) { return; }
    clearTimeout(c.timeout.timeout);
    return c.timeout.ctx.deactivate();
  };
  c.tearDown = function (callback) {
    clear();
    return callback();
  };
  return c.process((input, output, context) => {
    let timeout;
    if (!input.hasData('in')) { return; }
    if (input.attached('timeout').length && !input.hasData('timeout')) { return; }
    if (input.hasData('timeout')) {
      timeout = parseInt(input.getData('timeout'));
    } else {
      timeout = 300;
    }

    clear();

    return c.timeout = {
      ctx: context,
      timeout: setTimeout(() => {
        while (input.hasData('in')) {
          const packet = input.getData('in');
          output.send({ out: packet });
        }
        return output.done();
      },
      timeout),
    };
  });
};
