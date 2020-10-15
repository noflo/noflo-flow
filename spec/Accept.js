describe('Accept component', () => {
  let loader = null;
  let accept = null;
  let ins = null;
  let out = null;

  before(() => {
    loader = new noflo.ComponentLoader(baseDir);
  });
  beforeEach(function (done) {
    this.timeout(4000);
    loader.load('flow/Accept', (err, instance) => {
      if (err) {
        done(err);
        return;
      }
      ins = noflo.internalSocket.createSocket();
      instance.inPorts.in.attach(ins);
      accept = noflo.internalSocket.createSocket();
      instance.inPorts.accept.attach(accept);
      out = noflo.internalSocket.createSocket();
      instance.outPorts.out.attach(out);
      done();
    });
  });
  describe('accepting only certain numbers', () => {
    it('should send the expected numbers out', (done) => {
      const expected = [
        '< foo',
        '1',
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
      accept.send(1);
      accept.send(3);
      ins.beginGroup('foo');
      ins.send(1);
      ins.send(2);
      ins.send(3);
      ins.send(4);
      ins.endGroup('foo');
    });
  });
});
