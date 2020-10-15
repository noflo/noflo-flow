describe('Fork component', () => {
  const g = {};

  let loader = null;
  before(() => {
    loader = new noflo.ComponentLoader(baseDir);
  });
  beforeEach(function (done) {
    this.timeout(4000);
    loader.load('flow/Fork', (err, instance) => {
      if (err) {
        done(err);
        return;
      }
      g.c = instance;
      g.ins = noflo.internalSocket.createSocket();
      g.portIns = noflo.internalSocket.createSocket();
      g.outA = noflo.internalSocket.createSocket();
      g.outB = noflo.internalSocket.createSocket();
      g.outC = noflo.internalSocket.createSocket();
      g.c.inPorts.in.attach(g.ins);
      g.c.inPorts.port.attach(g.portIns);
      g.c.outPorts.out.attach(g.outA);
      g.c.outPorts.out.attach(g.outB);
      g.c.outPorts.out.attach(g.outC);
      done();
    });
  });

  it('sends IPs to the specified port', (done) => {
    g.outA.on('data', () => {
      throw new Error('Unexpected data to "a"');
    });
    g.outB.on('data', (data) => {
      chai.expect(data).to.equal('a');
      done();
    });
    g.outC.on('data', () => {
      throw new Error('Unexpected data to "c"');
    });

    g.portIns.connect();
    g.portIns.send(1);
    g.portIns.disconnect();

    g.ins.connect();
    g.ins.send('a');
    g.ins.disconnect();
  });

  it('sends IPs to multiple ports', (done) => {
    const received = [];
    const expected = 2;
    g.outA.on('data', (data) => {
      chai.expect(data).to.equal('a');
      received.push(data);
      if (received.length === expected) {
        done();
      }
    });
    g.outB.on('data', (data) => {
      chai.expect(data).to.equal('a');
      received.push(data);
      if (received.length === expected) {
        done();
      }
    });
    g.outC.on('data', () => {
      throw new Error('Unexpected data to "c"');
    });

    g.portIns.beginGroup(0);
    g.portIns.send(0);
    g.portIns.send(1);
    g.portIns.endGroup(0);

    g.ins.connect();
    g.ins.send('a');
    g.ins.disconnect();
  });

  it("resets fork settings on every connection to 'PORT'", (done) => {
    g.outA.on('data', () => {
      throw new Error('Unexpected data to "a"');
    });
    g.outB.on('data', (data) => {
      chai.expect(data).to.equal('a');
      done();
    });
    g.outC.on('data', () => {
      throw new Error('Unexpected data to "c"');
    });

    g.portIns.connect();
    g.portIns.send(0);
    g.portIns.disconnect();
    g.portIns.connect();
    g.portIns.send(1);
    g.portIns.disconnect();

    g.ins.connect();
    g.ins.send('a');
    g.ins.disconnect();
  });

  it('send to all by default', (done) => {
    const received = [];
    const expected = 3;
    g.outA.on('data', (data) => {
      chai.expect(data).to.equal('a');
      received.push(data);
      if (received.length === expected) {
        done();
      }
    });
    g.outB.on('data', (data) => {
      chai.expect(data).to.equal('a');
      received.push(data);
      if (received.length === expected) {
        done();
      }
    });
    g.outC.on('data', (data) => {
      chai.expect(data).to.equal('a');
      received.push(data);
      if (received.length === expected) {
        done();
      }
    });

    g.ins.connect();
    g.ins.send('a');
    g.ins.disconnect();
  });
});
