/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
describe('Collate component', function() {
  let c = null;
  let cntl = null;
  let ins = null;
  let out = null;
  let loader = null;
  before(() => loader = new noflo.ComponentLoader(baseDir));
  beforeEach(function(done) {
    this.timeout(4000);
    return loader.load('flow/Collate', function(err, instance) {
      if (err) { return done(err); }
      c = instance;
      cntl = noflo.internalSocket.createSocket();
      ins = [];
      ins.push(noflo.internalSocket.createSocket());
      ins.push(noflo.internalSocket.createSocket());
      ins.push(noflo.internalSocket.createSocket());
      out = noflo.internalSocket.createSocket();
      c.inPorts.ctlfields.attach(cntl);
      c.outPorts.out.attach(out);
      return done();
    });
  });

  describe('Collating a bank statement', () => it('should return the data in the correct order', function(done) {
    let inport;
    const original = [
      'branch,account,date,amount,DEP/WD',
      '1,3,1992/3/16,9.26,WD',
      '1,1,1992/3/26,10.10,WD',
      '1,3,1992/3/13,2.15,WD',
      '2,1,1992/4/26,12.00,WD',
      '1,2,1992/3/27,102.99,WD',
      '2,1,1992/3/08,22.00,WD',
      '1,3,1992/3/16,9.26,WD',
      '1,2,1992/3/27,102.99,WD',
      '1,2,1992/3/26,92.10,WD'
    ];

    const expected = [
      '< branch',
      '< account',
      '< date',
      '1,1,1992/3/26,10.10,WD',
      '> date',
      '> account',
      '< account',
      '< date',
      '1,2,1992/3/26,92.10,WD',
      '> date',
      '< date',
      '1,2,1992/3/27,102.99,WD',
      '1,2,1992/3/27,102.99,WD',
      '> date',
      '> account',
      '< account',
      '< date',
      '1,3,1992/3/13,2.15,WD',
      '> date',
      '< date',
      '1,3,1992/3/16,9.26,WD',
      '1,3,1992/3/16,9.26,WD',
      '> date',
      '> account',
      '> branch',
      '< branch',
      '< account',
      '< date',
      '2,1,1992/3/08,22.00,WD',
      '> date',
      '< date',
      '2,1,1992/4/26,12.00,WD',
      '> date',
      '> account',
      '> branch'
    ];

    const received = [];
    const groups = [];
    out.on('begingroup', function(group) {
      groups.push(group);
      if (group === null) { return; }
      return received.push(`< ${group}`);
    });
    out.on('data', function(data) {
      const values = [];
      for (let key in data) {
        const val = data[key];
        values.push(val);
      }
      return received.push(values.join(','));
    });
    out.on('endgroup', function(group) {
      groups.pop();
      if (group === null) { return; }
      return received.push(`> ${group}`);
    });
    out.on('disconnect', function() {
      chai.expect(received).to.eql(expected);
      return done();
    });

    // Send the fields to collate by
    cntl.send('branch,account,date');

    // First line is headers, take that out
    const headers = original.shift().split(',');

    // Randomize the rest of the entries to make sure we are always collating right
    original.sort(() => 0.5 - Math.random());

    // Send the beginning of transmission to all inputs
    for (let inSock of Array.from(ins)) { c.inPorts.in.attach(inSock); }
    for (inport of Array.from(ins)) { inport.beginGroup(null); }

    const hasNotSent = ins.slice(0);
    for (let index = 0; index < original.length; index++) {
      // Parse comma-separated
      const entry = original[index];
      const entryData = entry.split(',');
      // Convert to object
      const entryObj = {};
      for (let idx = 0; idx < headers.length; idx++) {
        const header = headers[idx];
        entryObj[header] = entryData[idx];
      }

      // Send to a random input port
      let randomConnection = Math.floor(Math.random() * ins.length);

      // Ensure each connection sends something
      if ((original.length - index) === hasNotSent.length) {
        randomConnection = ins.indexOf(hasNotSent[0]);
      }
      if (hasNotSent.indexOf(ins[randomConnection]) !== -1) {
        hasNotSent.splice(hasNotSent.indexOf(ins[randomConnection]), 1);
      }

      ins[randomConnection].send(entryObj);

      // Once we're close to the end we end stream on one of the inputs
      if (index === (original.length - 3)) {
        const [disconnecting] = Array.from(ins.splice(randomConnection, 1));
        disconnecting.endGroup();
      }
    }
    // Finally disconnect all
    return (() => {
      const result = [];
      for (inport of Array.from(ins)) {           result.push(inport.endGroup());
      }
      return result;
    })();
  }));

  return describe('Collating space-limited files', () => it('should return the data in the correct order', function(done) {
    // This test works with files so it only works on Node.js
    let line, matched;
    if (noflo.isBrowser()) { return done(); }

    const fs = require('fs');
    const path = require('path');

    const master = fs.readFileSync(path.resolve(__dirname, 'fixtures/collate/01master.txt'), 'utf-8');
    const detail = fs.readFileSync(path.resolve(__dirname, 'fixtures/collate/01detail.txt'), 'utf-8');
    const output = fs.readFileSync(path.resolve(__dirname, 'fixtures/collate/01output.txt'), 'utf-8');
    const received = [];
    const brackets = [];
    out.on('begingroup', function(group) {
      if (group === null) { return; }
      received.push('===> Open Bracket\r');
      return brackets.push(group);
    });
    out.on('data', data => received.push(`${data[0]}${data[1]}${data[2]}   ${data[3]}\r`));
    out.on('endgroup', function(group) {
      if (group === null) { return; }
      brackets.pop();
      return received.push('===> Close Bracket\r');
    });
    out.on('disconnect', function() {
      received.push('Run complete.\r\n');
      chai.expect(received.join("\n")).to.equal(output);
      return done();
    });

    // Configure
    cntl.send('0,1,2');

    // Send lines
    c.inPorts.in.attach(ins[0]);
    c.inPorts.in.attach(ins[1]);
    ins[0].beginGroup('file');
    ins[1].beginGroup('file');
    const masterLines = master.split("\n");
    for (line of Array.from(masterLines)) {
      matched = line.match(/([\d]{3})([A-Z]{2})([\d]{5})   ([A-Z])/);
      if (!matched) { continue; }
      matched.shift();
      ins[0].send(matched);
    }
    const detailLines = detail.split("\n");
    for (line of Array.from(detailLines)) {
      matched = line.match(/([\d]{3})([A-Z]{2})([\d]{5})   ([A-Z])/);
      if (!matched) { continue; }
      matched.shift();
      ins[1].send(matched);
    }

    // All done
    ins[0].endGroup();
    return ins[1].endGroup();
  }));
});
