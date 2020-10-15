/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const noflo = require("noflo");

exports.getComponent = function() {
  const c = new noflo.Component;
  c.description = `Send the port number to 'PORT' to set where to direct IPs. It \
acts as a 'Split' by default, sending IPs to every out-port.`;
  c.inPorts.add('in', {
    datatype: 'all',
    description: 'IPs to forward'
  }
  );
  c.inPorts.add('port', {
    datatype: 'number',
    description: 'Number of ports to forward IPs to'
  }
  );
  c.outPorts.add('out', {
    datatype: 'all',
    addressable: true
  }
  );
  c.indexes = [];
  c.tearDown = function(callback) {
    c.indexes = [];
    return callback();
  };
  return c.process(function(input, output) {
    let index, indexes;
    if (input.hasStream('port')) {
      // New set of port indexes to work with
      const ports = input.getStream('port').filter(ip => ip.type === 'data');
      c.indexes = [];
      for (let port of Array.from(ports)) {
        index = parseInt(port.data);
        if (c.indexes.indexOf(index) !== -1) { continue; }
        c.indexes.push(index);
      }
      output.done();
      return;
    }
    if (!input.hasData('in')) { return; }
    const data = input.getData('in');
    if (c.indexes.length === 0) {
      indexes = c.outPorts.out.listAttached();
    } else {
      indexes = c.indexes.slice(0);
    }
    for (let idx of Array.from(indexes)) {
      output.send({
        out: new noflo.IP('data', data,
          {index: idx})
      });
    }
    return output.done();
  });
};
