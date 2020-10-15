/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
describe('CollectUntilIdle component', function() {
  const g = {};

  let loader = null;
  before(() => loader = new noflo.ComponentLoader(baseDir));
  beforeEach(function(done) {
    this.timeout(4000);
    return loader.load('flow/CollectUntilIdle', function(err, instance) {
      if (err) { return done(err); }
      g.c = instance;
      g.ins = noflo.internalSocket.createSocket();
      g.timeout = noflo.internalSocket.createSocket();
      g.out = noflo.internalSocket.createSocket();
      g.c.inPorts.in.attach(g.ins);
      g.c.inPorts.timeout.attach(g.timeout);
      g.c.outPorts.out.attach(g.out);
      return done();
    });
  });

  describe('when g.instantiated', function() {
    it('should have input ports', function() {
      chai.expect(g.c.inPorts.in).to.be.an('object');
      return chai.expect(g.c.inPorts.timeout).to.be.an('object');
    });

    return it('should have an output port', () => chai.expect(g.c.outPorts.out).to.be.an('object'));
  });

  describe('without groups', () => it("should send packets out after timeout", function(done) {
    const expected = [
      'a',
      'b',
      'c'
    ];
    const output = [];
    g.out.on("begingroup", group => output.push(`< ${group}`));
    g.out.on("data", function(data) {
      output.push(data);
      if (output.length !== expected.length) { return; }
      chai.expect(output).to.eql(expected);
      return done();
    });
    g.out.on("endgroup", function() {
      output.push('>');
      if (output.length !== expected.length) { return; }
      chai.expect(output).to.eql(expected);
      return done();
    });
    g.timeout.send(300);
    g.ins.send("a");
    g.ins.send("b");
    g.ins.send("c");
    return g.ins.disconnect();
  }));

  return describe('with groups', () => it("should send packets out after timeout", function(done) {
    const expected = [
      '< foo',
      'a',
      'b',
      'c',
      '>'
    ];
    const output = [];
    g.out.on("begingroup", group => output.push(`< ${group}`));
    g.out.on("data", function(data) {
      output.push(data);
      if (output.length !== expected.length) { return; }
      chai.expect(output).to.eql(expected);
      return done();
    });
    g.out.on("endgroup", function() {
      output.push('>');
      if (output.length !== expected.length) { return; }
      chai.expect(output).to.eql(expected);
      return done();
    });
    g.timeout.send(300);
    g.ins.beginGroup('foo');
    g.ins.send("a");
    g.ins.send("b");
    g.ins.send("c");
    g.ins.endGroup();
    return g.ins.disconnect();
  }));
});
