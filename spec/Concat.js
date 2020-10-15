/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
describe('Concat component', function() {
  const g = {};
  let inCount = 2;
  let loader = null;
  before(() => loader = new noflo.ComponentLoader(baseDir));
  beforeEach(function(done) {
    this.timeout(4000);
    return loader.load('flow/Concat', function(err, instance) {
      if (err) { return done(err); }
      g.c = instance;
      g.ins = [];
      while (inCount) {
        const sock = noflo.internalSocket.createSocket();
        g.ins.push(sock);
        g.c.inPorts.in.attach(sock);
        inCount--;
      }

      g.out = noflo.internalSocket.createSocket();
      g.c.outPorts.out.attach(g.out);
      return done();
    });
  });

  describe('when instantiated', function() {
    it('should have input ports', () => chai.expect(g.c.inPorts.in).to.be.an('object'));

    return it('should have an g.output port', () => chai.expect(g.c.outPorts.out).to.be.an('object'));
  });

  it('packets sent to two ports should be ordered', function(done) {
    g.out.once('data', function(data) {
      chai.expect(data).to.deep.equal('hello');
      return g.out.once('data', function(data) {
        chai.expect(data).to.deep.equal('world');
        return done();
      });
    });
      
    g.ins[0].connect();
    g.ins[1].send('world');
    g.ins[0].send('hello');

    // For next test
    return inCount = 3;
  });

  it('packets sent to three ports should be ordered', function(done) {
    g.out.once('data', function(data) {
      chai.expect(data).to.deep.equal('foo');
      return g.out.once('data', function(data) {
        chai.expect(data).to.deep.equal('bar');
        return g.out.once('data', function(data) {
          chai.expect(data).to.deep.equal('baz');
          return done();
        });
      });
    });
      
    g.ins[0].connect();
    g.ins[1].send('bar');
    g.ins[2].send('baz');
    g.ins[0].send('foo');

    // For next test
    return inCount = 2;
  });

  return it('buffers should be cleared by disconnect to avoid deadlock', function(done) {
    g.out.once('data', function(data) {
      chai.expect(data).to.deep.equal('hello');
      return g.out.once('data', function(data) {
        chai.expect(data).to.deep.equal('world');
        return done();
      });
    });
      
    g.ins[1].send('world');
    return g.ins[0].send('hello');
  });
});
