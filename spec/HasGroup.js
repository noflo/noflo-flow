describe('HasGroup component', () => {
  let c = null;
  let regexp = null;
  let group = null;
  let reset = null;
  let ins = null;
  let yesOut = null;
  let noOut = null;
  before(function (done) {
    this.timeout(6000);
    const loader = new noflo.ComponentLoader(baseDir);
    loader.load('flow/HasGroup', (err, instance) => {
      if (err) {
        done(err);
        return;
      }
      c = instance;
      regexp = noflo.internalSocket.createSocket();
      group = noflo.internalSocket.createSocket();
      reset = noflo.internalSocket.createSocket();
      ins = noflo.internalSocket.createSocket();
      c.inPorts.regexp.attach(regexp);
      c.inPorts.group.attach(group);
      c.inPorts.reset.attach(reset);
      c.inPorts.in.attach(ins);
      done();
    });
  });
  beforeEach(() => {
    yesOut = noflo.internalSocket.createSocket();
    c.outPorts.yes.attach(yesOut);
    noOut = noflo.internalSocket.createSocket();
    c.outPorts.no.attach(noOut);
  });
  afterEach(() => {
    c.outPorts.yes.detach(yesOut);
    yesOut = null;
    c.outPorts.no.detach(noOut);
    noOut = null;
    reset.send(true);
  });

  describe('with an exact group match', () => it('it should get a match', (done) => {
    noOut.on('data', () => {
      chai.expect(true, 'Received on wrong port').to.equal(false);
      done();
    });
    yesOut.on('data', (data) => {
      chai.expect(data).to.equal('a');
      done();
    });

    group.send('match');
    ins.connect();
    ins.beginGroup('match');
    ins.send('a');
    ins.endGroup();
    ins.disconnect();
  }));

  describe('with an exact group mismatch', () => it('it should not get a match', (done) => {
    yesOut.on('data', () => {
      chai.expect(true, 'Received on wrong port').to.equal(false);
      done();
    });
    noOut.on('data', (data) => {
      chai.expect(data).to.equal('b');
      done();
    });

    group.send('match');
    ins.connect();
    ins.beginGroup('not a match');
    ins.send('b');
    ins.endGroup();
    ins.disconnect();
  }));

  describe('with a regexp group match', () => it('it should get a match', (done) => {
    noOut.on('data', () => {
      chai.expect(true, 'Received on wrong port').to.equal(false);
      done();
    });
    yesOut.on('data', (data) => {
      chai.expect(data).to.equal('c');
      done();
    });

    regexp.send('reg.*');
    ins.connect();
    ins.beginGroup('a regexp match');
    ins.send('c');
    ins.endGroup();
    ins.disconnect();
  }));
});
