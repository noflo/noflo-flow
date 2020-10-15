describe('CleanSplit component', () => {
  let loader = null;
  let ins = null;
  let out = null;

  before(() => {
    loader = new noflo.ComponentLoader(baseDir);
  });
  beforeEach(function (done) {
    this.timeout(4000);
    loader.load('flow/CleanSplit', (err, instance) => {
      if (err) {
        done(err);
        return;
      }
      ins = noflo.internalSocket.createSocket();
      instance.inPorts.in.attach(ins);
      out = noflo.internalSocket.createSocket();
      instance.outPorts.out.attach(out);
      done();
    });
  });
  describe('accepting only certain numbers', () => it('should send the expected numbers out', (done) => {
    const expected = [
      '< foo',
      '1',
      '2',
      '3',
      '>',
    ];
    const received = [];
    out.on('begingroup', (group) => received.push(`< ${group}`));
    out.on('data', (data) => received.push(`${data}`));
    out.on('endgroup', () => {
      received.push('>');
      if (received.length !== expected.length) { return; }
      chai.expect(received).to.eql(expected);
      done();
    });
    ins.beginGroup('foo');
    ins.send(1);
    ins.send(2);
    ins.send(3);
    chai.expect(received).to.eql([]);
    ins.endGroup('foo');
  }));
});
