const noflo = require('noflo');

function clear(c) {
  if (!c.timeout) { return; }
  clearTimeout(c.timeout.timeout);
  c.timeout.ctx.deactivate();
}

exports.getComponent = () => {
  const c = new noflo.Component();
  c.description = 'Collect packets and send them when input stops after a given timeout';
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
  c.tearDown = (callback) => {
    clear(c);
    return callback();
  };
  return c.process((input, output, context) => {
    let timeout;
    if (!input.hasData('in')) {
      return;
    }
    if (input.attached('timeout').length && !input.hasData('timeout')) {
      return;
    }
    if (input.hasData('timeout')) {
      timeout = parseInt(input.getData('timeout'), 10);
    } else {
      timeout = 300;
    }

    clear(c);

    c.timeout = {
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
