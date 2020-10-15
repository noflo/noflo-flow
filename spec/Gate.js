describe('Gate component', () => {
  let loader = null;
  let open = null;
  let close = null;
  let ins = null;
  let out = null;

  before(() => {
    loader = new noflo.ComponentLoader(baseDir);
  });
  beforeEach(function (done) {
    this.timeout(4000);
    loader.load('flow/Gate', (err, instance) => {
      if (err) {
        done(err);
        return;
      }
      ins = noflo.internalSocket.createSocket();
      instance.inPorts.in.attach(ins);
      open = noflo.internalSocket.createSocket();
      instance.inPorts.open.attach(open);
      close = noflo.internalSocket.createSocket();
      instance.inPorts.close.attach(close);
      out = noflo.internalSocket.createSocket();
      instance.outPorts.out.attach(out);
      done();
    });
  });
  describe('when gate is opened', () => {
    it('should send only the packets while gate was open', (done) => {
      const expected = [
        '2',
        '< bar',
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
      open.send(true);
      ins.send(2);
      ins.beginGroup('bar');
      ins.send(3);
      ins.endGroup('bar');
      close.send(true);
      ins.send(4);
      ins.endGroup('foo');
    });
  });
});
