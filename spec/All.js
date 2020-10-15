/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
describe('All component', function() {
  let c = null;
  const ins = [];
  let errIn = null;
  let out = null;
  let errOut = null;

  before(function(done) {
    this.timeout(4000);
    const loader = new noflo.ComponentLoader(baseDir);
    return loader.load('flow/All', function(err, instance) {
      if (err) { return done(err); }
      c = instance;
      ins.push(noflo.internalSocket.createSocket());
      ins.push(noflo.internalSocket.createSocket());
      ins.push(noflo.internalSocket.createSocket());
      ins.push(noflo.internalSocket.createSocket());
      ins.push(noflo.internalSocket.createSocket());
      errIn = noflo.internalSocket.createSocket();
      instance.inPorts.error.attach(errIn);
      return done();
    });
  });
  beforeEach(function() {
    out = noflo.internalSocket.createSocket();
    c.outPorts.out.attach(out);
    errOut = noflo.internalSocket.createSocket();
    return c.outPorts.error.attach(errOut);
  });
  afterEach(function() {
    c.outPorts.out.detach(out);
    out = null;
    c.outPorts.error.detach(errOut);
    return errOut = null;
  });
  describe('receiving results for two inbound connections', function() {
    before(function() {
      c.inPorts.in.attach(ins[0]);
      return c.inPorts.in.attach(ins[1]);});
    after(function(done) {
      c.inPorts.in.detach(ins[1]);
      c.inPorts.in.detach(ins[0]);
      return c.shutdown(done);
    });
    it('should send the results out', function(done) {
      errOut.on('data', done);
      out.on('data', function(data) {
        chai.expect(data).to.eql([
          ['hello world'],
          [123]
        ]);
        return done();
      });
      ins[1].send(123);
      return ins[0].send('hello world');
    });
    it('should support a stream in input data', function(done) {
      errOut.on('data', done);
      out.on('data', function(data) {
        chai.expect(data).to.eql([
          ['hello world'],
          [123, 456]
        ]);
        return done();
      });
      ins[1].send(new noflo.IP('openBracket', null,
        {scope: 0})
      );
      ins[1].send(new noflo.IP('data', 123,
        {scope: 0})
      );
      ins[1].send(new noflo.IP('data', 456,
        {scope: 0})
      );
      ins[1].send(new noflo.IP('closeBracket', null,
        {scope: 0})
      );
      return ins[0].send(new noflo.IP('data', 'hello world',
        {scope: 0})
      );
    });
    it('should only use first stream from input data', function(done) {
      errOut.on('data', done);
      out.on('data', function(data) {
        chai.expect(data).to.eql([
          ['hello world'],
          [123]
        ]);
        return done();
      });
      ins[1].send(new noflo.IP('data', 123,
        {scope: 3})
      );
      ins[1].send(new noflo.IP('data', 456,
        {scope: 3})
      );
      return ins[0].send(new noflo.IP('data', 'hello world',
        {scope: 3})
      );
    });
    return it('should send results by scope', function(done) {
      const expected = [{
        scope: 2,
        data: [['hello world'], [123]]
      }
      , {
        scope: 1,
        data: [[5542], ['foo bar']]
      }
      ];
      errOut.on('data', done);
      out.on('ip', function(ip) {
        if (ip.type !== 'data') { return; }
        const expect = expected.shift();
        chai.expect(ip.scope).to.equal(expect.scope);
        chai.expect(ip.data).to.eql(expect.data);
        if (expected.length) { return; }
        return done();
      });
      ins[0].send(new noflo.IP('data', 5542,
        {scope: 1})
      );
      ins[1].send(new noflo.IP('data', 123,
        {scope: 2})
      );
      ins[0].send(new noflo.IP('data', 'hello world',
        {scope: 2})
      );
      return ins[1].send(new noflo.IP('data', 'foo bar',
        {scope: 1})
      );
    });
  });
  return describe('receiving result and error for two inbound connections', function() {
    before(function() {
      c.inPorts.in.attach(ins[0]);
      return c.inPorts.in.attach(ins[1]);});
    after(function(done) {
      c.inPorts.in.detach(ins[1]);
      c.inPorts.in.detach(ins[0]);
      return c.shutdown(done);
    });
    it('should send the error out and no results', function(done) {
      errOut.on('data', function(err) {
        chai.expect(err).to.be.an('error');
        chai.expect(err.message).to.equal('Error on first');
        return done();
      });
      out.on('data', data => done(new Error('Unexpected data received')));
      ins[1].send(123);
      return errIn.send(new Error("Error on first"));
    });
    it('should send the error out and no results', function(done) {
      errOut.on('ip', function(ip) {
        if (ip.type !== 'data') { return; }
        chai.expect(ip.data).to.be.an('error');
        chai.expect(ip.data.message).to.equal('Error on scope');
        chai.expect(ip.scope).to.equal(0);
        return done();
      });
      out.on('data', data => done(new Error('Unexpected data received')));
      ins[1].send(new noflo.IP('data', 123,
        {scope: 0})
      );
      ins[1].send(new noflo.IP('data', 456,
        {scope: 0})
      );
      return errIn.send(new noflo.IP('data', new Error('Error on scope'),
        {scope: 0})
      );
    });
    return it('should send results by scope', function(done) {
      const expected = [{
        scope: 2,
        error: 'Second scope failed'
      }
      , {
        scope: 1,
        data: [[65432], ['foo bar baz']]
      }
      ];
      errOut.on('ip', function(ip) {
        if (ip.type !== 'data') { return; }
        const expect = expected.shift();
        chai.expect(ip.scope).to.equal(expect.scope);
        chai.expect(ip.data).to.be.an('error');
        chai.expect(ip.data.message).to.eql(expect.error);
        if (expected.length) { return; }
        return done();
      });
      out.on('ip', function(ip) {
        if (ip.type !== 'data') { return; }
        const expect = expected.shift();
        chai.expect(ip.scope).to.equal(expect.scope);
        chai.expect(ip.data).to.eql(expect.data);
        if (expected.length) { return; }
        return done();
      });
      ins[0].send(new noflo.IP('data', 65432,
        {scope: 1})
      );
      ins[1].send(new noflo.IP('data', 123,
        {scope: 2})
      );
      errIn.send(new noflo.IP('data', new Error('Second scope failed'),
        {scope: 2})
      );
      return ins[1].send(new noflo.IP('data', 'foo bar baz',
        {scope: 1})
      );
    });
  });
});
