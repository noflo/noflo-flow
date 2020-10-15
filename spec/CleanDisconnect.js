/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
describe('CleanDisconnect component', () => {
  const g = {};
  let loader = null;

  before(() => loader = new noflo.ComponentLoader(baseDir));
  beforeEach(function (done) {
    this.timeout(4000);
    return loader.load('flow/CleanDisconnect', (err, instance) => {
      if (err) { return done(err); }
      g.c = instance;
      g.insA = noflo.internalSocket.createSocket();
      g.insB = noflo.internalSocket.createSocket();
      g.insC = noflo.internalSocket.createSocket();
      g.outA = noflo.internalSocket.createSocket();
      g.outB = noflo.internalSocket.createSocket();
      g.outC = noflo.internalSocket.createSocket();
      g.c.inPorts.in.attach(g.insA);
      g.c.inPorts.in.attach(g.insB);
      g.c.inPorts.in.attach(g.insC);
      g.c.outPorts.out.attach(g.outA);
      g.c.outPorts.out.attach(g.outB);
      g.c.outPorts.out.attach(g.outC);
      return done();
    });
  });

  describe('when g.instantiated', () => {
    it('should have input ports', () => chai.expect(g.c.inPorts.in).to.be.an('object'));

    return it('should have an g.output port', () => chai.expect(g.c.outPorts.out).to.be.an('object'));
  });

  return it('ensure nesting streams get separated by disconnection', (done) => {
    let count = 0;

    g.outA.on('data', (data) => {
      chai.expect(data).to.equal('a');
      chai.expect(count).to.equal(0);
      return count++;
    });
    g.outB.on('data', (data) => {
      chai.expect(data).to.equal('b');
      chai.expect(count).to.equal(2);
      return count++;
    });
    g.outC.on('data', (data) => {
      chai.expect(data).to.equal('c');
      chai.expect(count).to.equal(4);
      return count++;
    });

    g.outA.on('disconnect', () => {
      chai.expect(count).to.equal(1);
      return count++;
    });
    g.outB.on('disconnect', () => {
      chai.expect(count).to.equal(3);
      return count++;
    });
    g.outC.on('disconnect', () => {
      chai.expect(count).to.equal(5);
      return done();
    });

    g.insA.connect();
    g.insA.send('a');
    g.insB.connect();
    g.insB.send('b');
    g.insC.connect();
    g.insC.send('c');
    g.insC.disconnect();
    g.insB.disconnect();
    return g.insA.disconnect();
  });
});
