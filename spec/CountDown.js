/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
describe('CountDown component', function() {
  let c = null;
  let count = null;
  let repeat = null;
  let ins = null;
  let out = null;
  before(function(done) {
    this.timeout(6000);
    const loader = new noflo.ComponentLoader(baseDir);
    return loader.load('flow/CountDown', function(err, instance) {
      if (err) { return done(err); }
      c = instance;
      count = noflo.internalSocket.createSocket();
      repeat = noflo.internalSocket.createSocket();
      ins = noflo.internalSocket.createSocket();
      c.inPorts.count.attach(count);
      c.inPorts.repeat.attach(repeat);
      c.inPorts.in.attach(ins);
      return done();
    });
  });
  beforeEach(function() {
    out = noflo.internalSocket.createSocket();
    return c.outPorts.out.attach(out);
  });
  afterEach(function(done) {
    c.outPorts.out.detach(out);
    out = null;
    return c.shutdown(done);
  });

  describe('with a number to count down from', () => it('should count each packet', function(done) {
    let received = 0;
    out.on('data', function(data) {
      chai.expect(data).to.be.a('null');
      return received++;
    });
    out.on('disconnect', function() {
      chai.expect(received).to.equal(1);
      return done();
    });

    count.send(2);
    repeat.send(true);
    ins.connect();
    ins.send('packet');
    ins.disconnect();
    ins.connect();
    ins.send('packet');
    return ins.disconnect();
  }));

  return describe('when set to "no repeat" mode', () => it('should only count down once', function(done) {
    let received = 0;
    out.on('data', function(data) {
      chai.expect(data).to.be.a('null');
      return received++;
    });
    out.on('disconnect', function() {
      chai.expect(received).to.equal(1);
      return done();
    });

    repeat.send(false);
    count.send(2);
    ins.connect();
    ins.send('packet');
    ins.disconnect();
    ins.connect();
    ins.send('packet');
    ins.disconnect();
    ins.connect();
    ins.send('packet');
    ins.disconnect();
    ins.connect();
    ins.send('packet');
    return ins.disconnect();
  }));
});
