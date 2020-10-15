/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
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
    return loader.load('flow/HasGroup', (err, instance) => {
      if (err) { return done(err); }
      c = instance;
      regexp = noflo.internalSocket.createSocket();
      group = noflo.internalSocket.createSocket();
      reset = noflo.internalSocket.createSocket();
      ins = noflo.internalSocket.createSocket();
      c.inPorts.regexp.attach(regexp);
      c.inPorts.group.attach(group);
      c.inPorts.reset.attach(reset);
      c.inPorts.in.attach(ins);
      return done();
    });
  });
  beforeEach(() => {
    yesOut = noflo.internalSocket.createSocket();
    c.outPorts.yes.attach(yesOut);
    noOut = noflo.internalSocket.createSocket();
    return c.outPorts.no.attach(noOut);
  });
  afterEach(() => {
    c.outPorts.yes.detach(yesOut);
    yesOut = null;
    c.outPorts.no.detach(noOut);
    noOut = null;
    return reset.send(true);
  });

  describe('with an exact group match', () => it('it should get a match', (done) => {
    noOut.on('data', (data) => {
      chai.expect(true, 'Received on wrong port').to.equal(false);
      return done();
    });
    yesOut.on('data', (data) => {
      chai.expect(data).to.equal('a');
      return done();
    });

    group.send('match');
    ins.connect();
    ins.beginGroup('match');
    ins.send('a');
    ins.endGroup();
    return ins.disconnect();
  }));

  describe('with an exact group mismatch', () => it('it should not get a match', (done) => {
    yesOut.on('data', (data) => {
      chai.expect(true, 'Received on wrong port').to.equal(false);
      return done();
    });
    noOut.on('data', (data) => {
      chai.expect(data).to.equal('b');
      return done();
    });

    group.send('match');
    ins.connect();
    ins.beginGroup('not a match');
    ins.send('b');
    ins.endGroup();
    return ins.disconnect();
  }));

  return describe('with a regexp group match', () => it('it should get a match', (done) => {
    noOut.on('data', (data) => {
      chai.expect(true, 'Received on wrong port').to.equal(false);
      return done();
    });
    yesOut.on('data', (data) => {
      chai.expect(data).to.equal('c');
      return done();
    });

    regexp.send('reg.*');
    ins.connect();
    ins.beginGroup('a regexp match');
    ins.send('c');
    ins.endGroup();
    return ins.disconnect();
  }));
});
