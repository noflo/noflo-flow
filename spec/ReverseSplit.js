describe('ReverseSplit component', () => {
  const g = {};
  let loader = null;
  before(() => {
    loader = new noflo.ComponentLoader(baseDir);
  });
  beforeEach(function (done) {
    this.timeout(4000);
    loader.load('flow/ReverseSplit', (err, instance) => {
      if (err) {
        done(err);
        return;
      }
      g.c = instance;
      g.ins = noflo.internalSocket.createSocket();
      g.outA = noflo.internalSocket.createSocket();
      g.outB = noflo.internalSocket.createSocket();
      g.outC = noflo.internalSocket.createSocket();
      g.c.inPorts.in.attach(g.ins);
      g.c.outPorts.out.attach(g.outA);
      g.c.outPorts.out.attach(g.outB);
      g.c.outPorts.out.attach(g.outC);
      done();
    });
  });

  describe('when instantiated', () => {
    it('should have input ports', () => chai.expect(g.c.inPorts.in).to.be.an('object'));

    it('should have an g.output port', () => chai.expect(g.c.outPorts.out).to.be.an('object'));
  });

  it('send some IPs and they are forwarded in reverse order of port attachments', (done) => {
    let count = 0;

    g.outA.on('data', () => {
      count += 1;
      chai.expect(count).to.equal(3);
      done();
    });
    g.outB.on('data', () => {
      count += 1;
      chai.expect(count).to.equal(2);
    });
    g.outC.on('data', () => {
      count += 1;
      chai.expect(count).to.equal(1);
    });

    g.ins.connect();
    g.ins.send('a');
    g.ins.disconnect();
  });
});
