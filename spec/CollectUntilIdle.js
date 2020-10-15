describe('CollectUntilIdle component', () => {
  const g = {};

  let loader = null;
  before(() => {
    loader = new noflo.ComponentLoader(baseDir);
  });
  beforeEach(function (done) {
    this.timeout(4000);
    loader.load('flow/CollectUntilIdle', (err, instance) => {
      if (err) {
        done(err);
        return;
      }
      g.c = instance;
      g.ins = noflo.internalSocket.createSocket();
      g.timeout = noflo.internalSocket.createSocket();
      g.out = noflo.internalSocket.createSocket();
      g.c.inPorts.in.attach(g.ins);
      g.c.inPorts.timeout.attach(g.timeout);
      g.c.outPorts.out.attach(g.out);
      done();
    });
  });

  describe('when g.instantiated', () => {
    it('should have input ports', () => {
      chai.expect(g.c.inPorts.in).to.be.an('object');
      chai.expect(g.c.inPorts.timeout).to.be.an('object');
    });

    it('should have an output port', () => {
      chai.expect(g.c.outPorts.out).to.be.an('object');
    });
  });

  describe('without groups', () => {
    it('should send packets out after timeout', (done) => {
      const expected = [
        'a',
        'b',
        'c',
      ];
      const output = [];
      g.out.on('begingroup', (group) => output.push(`< ${group}`));
      g.out.on('data', (data) => {
        output.push(data);
        if (output.length !== expected.length) { return; }
        chai.expect(output).to.eql(expected);
        done();
      });
      g.out.on('endgroup', () => {
        output.push('>');
        if (output.length !== expected.length) { return; }
        chai.expect(output).to.eql(expected);
        done();
      });
      g.timeout.send(300);
      g.ins.send('a');
      g.ins.send('b');
      g.ins.send('c');
      g.ins.disconnect();
    });
  });

  describe('with groups', () => {
    it('should send packets out after timeout', (done) => {
      const expected = [
        '< foo',
        'a',
        'b',
        'c',
        '>',
      ];
      const output = [];
      g.out.on('begingroup', (group) => output.push(`< ${group}`));
      g.out.on('data', (data) => {
        output.push(data);
        if (output.length !== expected.length) { return; }
        chai.expect(output).to.eql(expected);
        done();
      });
      g.out.on('endgroup', () => {
        output.push('>');
        if (output.length !== expected.length) { return; }
        chai.expect(output).to.eql(expected);
        done();
      });
      g.timeout.send(300);
      g.ins.beginGroup('foo');
      g.ins.send('a');
      g.ins.send('b');
      g.ins.send('c');
      g.ins.endGroup();
      g.ins.disconnect();
    });
  });
});
