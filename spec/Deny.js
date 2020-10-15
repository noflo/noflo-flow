/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
describe('Deny component', () => {
  let loader = null;
  let deny = null;
  let ins = null;
  let out = null;

  before(() => loader = new noflo.ComponentLoader(baseDir));
  beforeEach(function (done) {
    this.timeout(4000);
    return loader.load('flow/Deny', (err, instance) => {
      if (err) { return done(err); }
      ins = noflo.internalSocket.createSocket();
      instance.inPorts.in.attach(ins);
      deny = noflo.internalSocket.createSocket();
      instance.inPorts.deny.attach(deny);
      out = noflo.internalSocket.createSocket();
      instance.outPorts.out.attach(out);
      return done();
    });
  });
  return describe('denying only certain numbers', () => it('should send the expected numbers out', (done) => {
    const expected = [
      '< foo',
      '2',
      '4',
      '>',
    ];
    const received = [];
    out.on('begingroup', (group) => received.push(`< ${group}`));
    out.on('data', (data) => received.push(`${data}`));
    out.on('endgroup', (group) => {
      received.push('>');
      if (received.length !== expected.length) { return; }
      chai.expect(received).to.eql(expected);
      return done();
    });
    deny.send(1);
    deny.send(3);
    ins.beginGroup('foo');
    ins.send(1);
    ins.send(2);
    ins.send(3);
    ins.send(4);
    return ins.endGroup('foo');
  }));
});
