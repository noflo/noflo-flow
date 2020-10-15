describe('Concat component', () => {
  const g = {};
  let inCount = 2;
  let loader = null;
  before(() => {
    loader = new noflo.ComponentLoader(baseDir);
  });
  beforeEach(function (done) {
    this.timeout(4000);
    loader.load('flow/Concat', (err, instance) => {
      if (err) {
        done(err);
        return;
      }
      g.c = instance;
      g.ins = [];
      while (inCount) {
        const sock = noflo.internalSocket.createSocket();
        g.ins.push(sock);
        g.c.inPorts.in.attach(sock);
        inCount -= 1;
      }

      g.out = noflo.internalSocket.createSocket();
      g.c.outPorts.out.attach(g.out);
      done();
    });
  });

  it('packets sent to two ports should be ordered', (done) => {
    g.out.once('data', (data) => {
      chai.expect(data).to.deep.equal('hello');
      g.out.once('data', (d) => {
        chai.expect(d).to.deep.equal('world');
        done();
      });
    });

    g.ins[0].connect();
    g.ins[1].send('world');
    g.ins[0].send('hello');

    // For next test
    inCount = 3;
  });

  it('packets sent to three ports should be ordered', (done) => {
    g.out.once('data', (data) => {
      chai.expect(data).to.deep.equal('foo');
      g.out.once('data', (d) => {
        chai.expect(d).to.deep.equal('bar');
        g.out.once('data', (d2) => {
          chai.expect(d2).to.deep.equal('baz');
          done();
        });
      });
    });

    g.ins[0].connect();
    g.ins[1].send('bar');
    g.ins[2].send('baz');
    g.ins[0].send('foo');

    // For next test
    inCount = 2;
  });

  it('buffers should be cleared by disconnect to avoid deadlock', (done) => {
    g.out.once('data', (data) => {
      chai.expect(data).to.deep.equal('hello');
      g.out.once('data', (d) => {
        chai.expect(d).to.deep.equal('world');
        done();
      });
    });

    g.ins[1].send('world');
    g.ins[0].send('hello');
  });
});
