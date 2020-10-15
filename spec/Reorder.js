/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
describe('Reorder component', () => {
  let loader = null;
  const g = {};

  before(() => loader = new noflo.ComponentLoader(baseDir));
  beforeEach(function (done) {
    this.timeout(4000);
    return loader.load('flow/Reorder', (err, instance) => {
      if (err) { return done(err); }
      g.c = instance;
      g.insA = noflo.internalSocket.createSocket();
      g.insB = noflo.internalSocket.createSocket();
      g.insC = noflo.internalSocket.createSocket();
      g.outA = noflo.internalSocket.createSocket();
      g.outB = noflo.internalSocket.createSocket();
      g.outC = noflo.internalSocket.createSocket();
      g.c.inPorts.in.attach(g.insA);
      g.c.outPorts.out.attach(g.outA);
      return done();
    });
  });

  describe('when instantiated', () => {
    it('should have input ports', () => chai.expect(g.c.inPorts.in).to.be.an('object'));

    return it('should have an g.output port', () => chai.expect(g.c.outPorts.out).to.be.an('object'));
  });

  it('connect some number of ports and packets are sent in the reverse order of attachment', (done) => {
    g.c.inPorts.in.attach(g.insB);
    g.c.inPorts.in.attach(g.insC);
    g.c.outPorts.out.attach(g.outB);
    g.c.outPorts.out.attach(g.outC);

    const expected = [
      '3 c',
      '2 b',
      '1 a',
    ];
    const received = [];

    g.outA.on('data', (data) => {
      received.push(`1 ${data}`);
      if (received.length !== expected.length) { return; }
      chai.expect(received).to.eql(expected);
      return done();
    });
    g.outB.on('data', (data) => {
      received.push(`2 ${data}`);
      if (received.length !== expected.length) { return; }
      chai.expect(received).to.eql(expected);
      return done();
    });
    g.outC.on('data', (data) => {
      received.push(`3 ${data}`);
      if (received.length !== expected.length) { return; }
      chai.expect(received).to.eql(expected);
      return done();
    });

    g.insA.connect();
    g.insA.send('a');
    g.insA.disconnect();

    g.insB.connect();
    g.insB.send('b');
    g.insB.disconnect();

    g.insC.connect();
    g.insC.send('c');
    return g.insC.disconnect();
  });

  return it('the number of ports to wait for stream end until forwarding takes place is the lessor of the number of inports and the number of g.outports', (done) => {
    g.c.inPorts.in.attach(g.insB);
    g.c.outPorts.out.attach(g.outB);
    g.c.outPorts.out.attach(g.outC);

    const expected = [
      '2 b',
      '1 a',
    ];
    const received = [];

    g.outA.on('data', (data) => {
      received.push(`1 ${data}`);
      if (received.length !== expected.length) { return; }
      chai.expect(received).to.eql(expected);
      return done();
    });
    g.outB.on('data', (data) => {
      received.push(`2 ${data}`);
      if (received.length !== expected.length) { return; }
      chai.expect(received).to.eql(expected);
      return done();
    });
    g.outC.on('data', (data) => done(new Error('C received data unlike expected')));

    g.insA.connect();
    g.insA.send('a');
    g.insA.disconnect();

    g.insB.connect();
    g.insB.send('b');
    return g.insB.disconnect();
  });
});
