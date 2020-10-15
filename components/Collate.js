const noflo = require('noflo');

// Comparison of a single control field
function sort(left, right) {
  // Lowercase strings to they always sort correctly
  let l = left;
  let r = right;
  if (typeof l === 'string') { l = l.toLowerCase(); }
  if (typeof r === 'string') { r = r.toLowerCase(); }

  if (l === r) { return 0; }
  if (l > r) { return 1; }
  return -1;
}

// The actual collation algorithm, returns a closure with the control fields
// that can be used with Array.prototype.sort()
function sortByControlFields(fields, a, b) {
  // If there are no control fields specified we can't sort
  if (!fields.length) { return 0; }

  // Traverse the fields until you find one to sort by
  for (let i = 0; i < fields.length; i += 1) {
    const field = fields[i];
    const order = sort(a.data[field], b.data[field]);
    if (order !== 0) {
      return order;
    }
  }

  // All fields were the same, send in order of appearance
  if (this.indexOf(a) < this.indexOf(b)) {
    return -1;
  }
  return 1;
}

// Sending the collated objects to the output port together with bracket IPs
function sendWithGroups(packets, fields, output) {
  let previous = null;
  packets.forEach((packet) => {
    // For the first packet send a bracket IP for each control field
    fields.forEach((field) => {
      if (previous) { return; }
      output.send({ out: new noflo.IP('openBracket', field) });
    });

    // For subsequent packets send ending and opening brackets for fields that
    // are different
    if (previous) {
      for (let idx = 0; idx < fields.length; idx += 1) {
        const field = fields[idx];
        if (packet.data[field] !== previous.data[field]) {
          // Differing field found, close this bracket and all following ones
          const differing = fields.slice(idx);
          const closes = differing.slice(0);
          closes.reverse();
          closes.forEach((f) => {
            output.send({ out: new noflo.IP('closeBracket', f) });
          });
          differing.forEach((f) => {
            output.send({ out: new noflo.IP('openBracket', f) });
          });
          break;
        }
      }
    }

    // Send it out
    output.send({ out: packet });

    // Provide for comparison to the next one
    previous = packet;
  });

  // Last packet sent, send closing brackets
  const closes = fields.slice(0);
  closes.reverse();
  closes.forEach((field) => {
    output.send({ out: new noflo.IP('closeBracket', field) });
  });
}

exports.getComponent = () => {
  const c = new noflo.Component();
  c.description = 'Collate two or more streams, based on a list of control field lengths';
  c.icon = 'sort-amount-asc';
  // Inport for accepting a comma-separated list of control fields
  c.inPorts.add('ctlfields', {
    datatype: 'string',
    description: 'Comma-separated list of object keys to collate by',
    control: true,
  });
  // Here we accept packets from 0-n connections that will eventually be collated
  c.inPorts.add('in', {
    description: 'Objects to collate',
    datatype: 'object',
    addressable: true,
  });
  // We send the packets in collated order with groups to the output port
  c.outPorts.add('out', {
    description: 'Objects in collated order',
    datatype: 'object',
  });

  c.forwardBrackets = {};

  return c.process((input, output) => {
    // We want to have a list of fields to collate by
    if (!input.hasData('ctlfields')) { return; }
    // To be able to sort everything we must wait until we have all the data
    if (!input.attached('in').length) { return; }
    const indexesWithStreams = input.attached('in').filter((idx) => input.hasStream(['in', idx]));
    if (indexesWithStreams.length !== input.attached('in').length) { return; }

    let fields = input.getData('ctlfields');
    if (typeof fields === 'string') {
      fields = fields.split(',');
    }

    // Receive the packets
    let packets = [];
    indexesWithStreams.forEach((idx) => {
      const stream = input.getStream(['in', idx]).filter((ip) => ip.type === 'data');
      packets = packets.concat(stream);
    });
    // Sort them by control fields if there are any
    const original = packets.slice(0);
    packets.sort(sortByControlFields.bind(original, fields));
    output.send({ out: new noflo.IP('openBracket', null) });
    // Send them out
    sendWithGroups(packets, fields, output);
    // Send end-of-transmission
    output.send({ out: new noflo.IP('closeBracket', null) });
    output.done();
  });
};
