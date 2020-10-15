describe('Collate component', () => {
  let c = null;
  let cntl = null;
  let ins = null;
  let out = null;
  let loader = null;
  before(() => {
    loader = new noflo.ComponentLoader(baseDir);
  });
  beforeEach(function (done) {
    this.timeout(4000);
    loader.load('flow/Collate', (err, instance) => {
      if (err) {
        done(err);
        return;
      }
      c = instance;
      cntl = noflo.internalSocket.createSocket();
      ins = [];
      ins.push(noflo.internalSocket.createSocket());
      ins.push(noflo.internalSocket.createSocket());
      ins.push(noflo.internalSocket.createSocket());
      out = noflo.internalSocket.createSocket();
      c.inPorts.ctlfields.attach(cntl);
      c.outPorts.out.attach(out);
      done();
    });
  });

  describe('Collating a bank statement', () => {
    it('should return the data in the correct order', (done) => {
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
        '1,2,1992/3/26,92.10,WD',
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
        '> branch',
      ];

      const received = [];
      const groups = [];
      out.on('begingroup', (group) => {
        groups.push(group);
        if (group === null) { return; }
        received.push(`< ${group}`);
      });
      out.on('data', (data) => {
        const values = [];
        Object.keys(data).forEach((key) => {
          const val = data[key];
          values.push(val);
        });
        received.push(values.join(','));
      });
      out.on('endgroup', (group) => {
        groups.pop();
        if (group === null) { return; }
        received.push(`> ${group}`);
      });
      out.on('disconnect', () => {
        chai.expect(received).to.eql(expected);
        done();
      });

      // Send the fields to collate by
      cntl.send('branch,account,date');

      // First line is headers, take that out
      const headers = original.shift().split(',');

      // Randomize the rest of the entries to make sure we are always collating right
      original.sort(() => 0.5 - Math.random());

      // Send the beginning of transmission to all inputs
      ins.forEach((inSock) => {
        c.inPorts.in.attach(inSock);
        inSock.beginGroup(null);
      });

      const hasNotSent = ins.slice(0);
      for (let index = 0; index < original.length; index += 1) {
        // Parse comma-separated
        const entry = original[index];
        const entryData = entry.split(',');
        // Convert to object
        const entryObj = {};
        for (let idx = 0; idx < headers.length; idx += 1) {
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
      ins.forEach((inSock) => {
        inSock.endGroup();
      });
    });
  });

  describe('Collating space-limited files', () => {
    before(function () {
      // This test works with files so it only works on Node.js
      if (noflo.isBrowser()) {
        this.skip();
      }
    });
    it('should return the data in the correct order', (done) => {
      // eslint-disable-next-line
      const fs = require('fs');
      // eslint-disable-next-line
      const path = require('path');

      const master = fs.readFileSync(path.resolve(__dirname, 'fixtures/collate/01master.txt'), 'utf-8');
      const detail = fs.readFileSync(path.resolve(__dirname, 'fixtures/collate/01detail.txt'), 'utf-8');
      const output = fs.readFileSync(path.resolve(__dirname, 'fixtures/collate/01output.txt'), 'utf-8');
      const received = [];
      const brackets = [];
      out.on('begingroup', (group) => {
        if (group === null) { return; }
        received.push('===> Open Bracket\r');
        brackets.push(group);
      });
      out.on('data', (data) => received.push(`${data[0]}${data[1]}${data[2]}   ${data[3]}\r`));
      out.on('endgroup', (group) => {
        if (group === null) { return; }
        brackets.pop();
        received.push('===> Close Bracket\r');
      });
      out.on('disconnect', () => {
        received.push('Run complete.\r\n');
        chai.expect(received.join('\n')).to.equal(output);
        done();
      });

      // Configure
      cntl.send('0,1,2');

      // Send lines
      c.inPorts.in.attach(ins[0]);
      c.inPorts.in.attach(ins[1]);
      ins[0].beginGroup('file');
      ins[1].beginGroup('file');
      const masterLines = master.split('\n');
      masterLines.forEach((line) => {
        const matched = line.match(/([\d]{3})([A-Z]{2})([\d]{5}) {3}([A-Z])/);
        if (!matched) { return; }
        matched.shift();
        ins[0].send(matched);
      });
      const detailLines = detail.split('\n');
      detailLines.forEach((line) => {
        const matched = line.match(/([\d]{3})([A-Z]{2})([\d]{5}) {3}([A-Z])/);
        if (!matched) { return; }
        matched.shift();
        ins[1].send(matched);
      });

      // All done
      ins[0].endGroup();
      ins[1].endGroup();
    });
  });
});
