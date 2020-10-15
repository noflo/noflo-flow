/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
describe('CleanSplit component', function() {
  let loader = null;
  const accept = null;
  let ins = null;
  let out = null;

  before(() => loader = new noflo.ComponentLoader(baseDir));
  beforeEach(function(done) {
    this.timeout(4000);
    return loader.load('flow/CleanSplit', function(err, instance) {
      if (err) { return done(err); }
      ins = noflo.internalSocket.createSocket();
      instance.inPorts.in.attach(ins);
      out = noflo.internalSocket.createSocket();
      instance.outPorts.out.attach(out);
      return done();
    });
  });
  return describe('accepting only certain numbers', () => it('should send the expected numbers out', function(done) {
    const expected = [
      '< foo',
      '1',
      '2',
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
    ins.send(2);
    ins.send(3);
    chai.expect(received).to.eql([]);
    return ins.endGroup('foo');
  }));
});


