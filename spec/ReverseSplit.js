/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
describe('ReverseSplit component', function() {
  const g = {};
  let loader = null;
  before(() => loader = new noflo.ComponentLoader(baseDir));
  beforeEach(function(done) {
    this.timeout(4000);
    return loader.load('flow/ReverseSplit', function(err, instance) {
      if (err) { return done(err); }
      g.c = instance;
      g.ins = noflo.internalSocket.createSocket();
      g.outA = noflo.internalSocket.createSocket();
      g.outB = noflo.internalSocket.createSocket();
      g.outC = noflo.internalSocket.createSocket();
      g.c.inPorts.in.attach(g.ins);
      g.c.outPorts.out.attach(g.outA);
      g.c.outPorts.out.attach(g.outB);
      g.c.outPorts.out.attach(g.outC);
      return done();
    });
  });

  describe('when instantiated', function() {
    it('should have input ports', () => chai.expect(g.c.inPorts.in).to.be.an('object'));

    return it('should have an g.output port', () => chai.expect(g.c.outPorts.out).to.be.an('object'));
  });

  return it("send some IPs and they are forwarded in reverse order of port attachments", function(done) {
    let count = 0;

    g.outA.on("data", data => chai.expect(++count).to.equal(3));
    g.outB.on("data", data => chai.expect(++count).to.equal(2));
    g.outC.on("data", data => chai.expect(++count).to.equal(1));
    g.outA.on("disconnect", () => done());

    g.ins.connect();
    g.ins.send("a");
    return g.ins.disconnect();
  });
});
