const noflo = require('noflo');

exports.getComponent = () => {
  const c = new noflo.Component();
  c.description = 'Send the port number to \'PORT\' to set where to direct IPs. It acts as a \'Split\' by default, sending IPs to every out-port.';
  c.inPorts.add('in', {
    datatype: 'all',
    description: 'IPs to forward',
  });
  c.inPorts.add('port', {
    datatype: 'number',
    description: 'Number of ports to forward IPs to',
  });
  c.outPorts.add('out', {
    datatype: 'all',
    addressable: true,
  });
  c.indexes = [];
  c.tearDown = (callback) => {
    c.indexes = [];
    return callback();
  };
  return c.process((input, output) => {
    if (input.hasStream('port')) {
      // New set of port indexes to work with
      const ports = input.getStream('port').filter((ip) => ip.type === 'data');
      c.indexes = [];
      ports.forEach((port) => {
        const index = parseInt(port.data, 10);
        if (c.indexes.indexOf(index) !== -1) { return; }
        c.indexes.push(index);
      });
      output.done();
      return;
    }
    if (!input.hasData('in')) { return; }
    const data = input.getData('in');
    let indexes;
    if (c.indexes.length === 0) {
      indexes = c.outPorts.out.listAttached();
    } else {
      indexes = c.indexes.slice(0);
    }
    indexes.forEach((idx) => {
      output.send({
        out: new noflo.IP('data', data,
          { index: idx }),
      });
    });
    output.done();
  });
};
