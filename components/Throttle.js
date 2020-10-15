/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const noflo = require('noflo');

exports.getComponent = function () {
  const c = new noflo.Component();
  c.description = 'Throttle packets based on load and maximum accepted load';
  c.inPorts.add('in', {
    datatype: 'all',
    description: 'IPs to forward',
  });
  c.inPorts.add('load', {
    datatype: 'int',
    description: 'Current load',
  });
  c.inPorts.add('max', {
    datatype: 'int',
    control: true,
    description: 'Maximum number to allow for load',
  });
  c.outPorts.add('out',
    { datatype: 'all' });
  return c.process((input, output) => {
    if (!input.hasData('in', 'load', 'max')) { return; }
    const [load, max] = Array.from(input.getData('load', 'max'));
    if (!(load < max)) {
      // Waiting for load to decrease
      // FIXME: Workaround for https://github.com/noflo/noflo/issues/558
      setTimeout(() => output.done(),
        1);
      return;
    }
    // Release one packet at a time
    const data = input.getData('in');
    // FIXME: Workaround for https://github.com/noflo/noflo/issues/558
    return setTimeout(() => output.sendDone({ out: data }),
      1);
  });
};
