describe('Stop component', () => {
  let c = null;
  let ready = null;
  let ins = null;
  let out = null;
  before(function (done) {
    this.timeout(6000);
    const loader = new noflo.ComponentLoader(baseDir);
    loader.load('flow/Stop', (err, instance) => {
      if (err) {
        done(err);
        return;
      }
      c = instance;
      ready = noflo.internalSocket.createSocket();
      ins = noflo.internalSocket.createSocket();
      c.inPorts.ready.attach(ready);
      c.inPorts.in.attach(ins);
      done();
    });
  });
  beforeEach(() => {
    out = noflo.internalSocket.createSocket();
    c.outPorts.out.attach(out);
  });
  afterEach(() => {
    c.outPorts.out.detach(out);
    out = null;
  });

  describe('with a count or 3 and some connections', () => it('should merge packets from first three connections', (done) => {
    const expected = [
      'DATA 1',
      'DATA 2',
      'DATA 3',
    ];
    const received = [];
    let started = false;

    out.on('begingroup', (grp) => {
      chai.expect(started, 'should not receive before allowed').to.equal(true);
      received.push(`< ${grp}`);
    });
    out.on('data', (data) => {
      chai.expect(started, 'should not receive before allowed').to.equal(true);
      received.push(`DATA ${data}`);
      if (received.length !== expected.length) { return; }
      chai.expect(received).to.eql(expected);
      done();
    });
    out.on('endgroup', () => received.push('>'));

    ins.send(1);
    ins.send(2);
    ins.send(3);
    ins.disconnect();

    ready.connect();
    started = true;
    ready.send(true);
    ready.disconnect();
  }));
});
