/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
describe('Stop component', function() {
  let c = null;
  let ready = null;
  let ins = null;
  let out = null;
  before(function(done) {
    this.timeout(6000);
    const loader = new noflo.ComponentLoader(baseDir);
    return loader.load('flow/Stop', function(err, instance) {
      if (err) { return done(err); }
      c = instance;
      ready = noflo.internalSocket.createSocket();
      ins = noflo.internalSocket.createSocket();
      c.inPorts.ready.attach(ready);
      c.inPorts.in.attach(ins);
      return done();
    });
  });
  beforeEach(function() {
    out = noflo.internalSocket.createSocket();
    return c.outPorts.out.attach(out);
  });
  afterEach(function() {
    c.outPorts.out.detach(out);
    return out = null;
  });

  return describe('with a count or 3 and some connections', () => it('should merge packets from first three connections', function(done) {
    const expected = [
      'DATA 1',
      'DATA 2',
      'DATA 3'
    ];
    const received = [];
    let started = false;

    out.on('begingroup', function(grp) {
      chai.expect(started, 'should not receive before allowed').to.equal(true);
      return received.push(`< ${grp}`);
    });
    out.on('data', function(data) {
      chai.expect(started, 'should not receive before allowed').to.equal(true);
      received.push(`DATA ${data}`);
      if (received.length !== expected.length) { return; }
      chai.expect(received).to.eql(expected);
      return done();
    });
    out.on('endgroup', () => received.push('>'));

    ins.send(1);
    ins.send(2);
    ins.send(3);
    ins.disconnect();

    ready.connect();
    started = true;
    ready.send(true);
    return ready.disconnect();
  }));
});
