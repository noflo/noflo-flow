/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
describe('Gate component', function() {
  let loader = null;
  let open = null;
  let close = null;
  let ins = null;
  let out = null;

  before(() => loader = new noflo.ComponentLoader(baseDir));
  beforeEach(function(done) {
    this.timeout(4000);
    return loader.load('flow/Gate', function(err, instance) {
      if (err) { return done(err); }
      ins = noflo.internalSocket.createSocket();
      instance.inPorts.in.attach(ins);
      open = noflo.internalSocket.createSocket();
      instance.inPorts.open.attach(open);
      close = noflo.internalSocket.createSocket();
      instance.inPorts.close.attach(close);
      out = noflo.internalSocket.createSocket();
      instance.outPorts.out.attach(out);
      return done();
    });
  });
  return describe('when gate is opened', () => it('should send only the packets while gate was open', function(done) {
    const expected = [
      '2',
      '< bar',
      '3',
      '>'
    ];
    const received = [];
    out.on('begingroup', group => received.push(`< ${group}`));
    out.on('data', data => received.push(`${data}`));
    out.on('endgroup', function(group) {
      received.push('>');
      if (received.length !== expected.length) { return; }
      chai.expect(received).to.eql(expected);
      return done();
    });
    ins.beginGroup('foo');
    ins.send(1);
    open.send(true);
    ins.send(2);
    ins.beginGroup('bar');
    ins.send(3);
    ins.endGroup('bar');
    close.send(true);
    ins.send(4);
    return ins.endGroup('foo');
  }));
});

