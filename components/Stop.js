/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const noflo = require("noflo");

exports.getComponent = function() {
  const c = new noflo.Component;
  c.description = `Stop everything that's received and send out once we're \
told that we're ready to send.`;
  c.inPorts.add('in', {
    datatype: 'all',
    description: 'IPs to buffer until an IP arrives on the ready port'
  }
  );
  c.inPorts.add('ready', {
    datatype: 'bang',
    description: 'Trigger the emission of all the stored IPs'
  }
  );
  c.outPorts.add('out', {
    datatype: 'all',
    description: 'IPs forwarded from the in port'
  }
  );
  c.forwardBracets = {};
  return c.process(function(input, output) {
    if (!input.hasData('ready', 'in')) { return; }
    input.getData('ready');
    const packets = [];
    while (input.has('in')) {
      packets.push(input.get('in'));
    }
    for (let packet of Array.from(packets)) {
      output.send({
        out: packet});
    }
    return output.done();
  });
};
