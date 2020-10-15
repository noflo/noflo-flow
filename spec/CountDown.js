describe('CountDown component', () => {
  let c = null;
  let count = null;
  let repeat = null;
  let ins = null;
  let out = null;
  before(function (done) {
    this.timeout(6000);
    const loader = new noflo.ComponentLoader(baseDir);
    loader.load('flow/CountDown', (err, instance) => {
      if (err) {
        done(err);
        return;
      }
      c = instance;
      count = noflo.internalSocket.createSocket();
      repeat = noflo.internalSocket.createSocket();
      ins = noflo.internalSocket.createSocket();
      c.inPorts.count.attach(count);
      c.inPorts.repeat.attach(repeat);
      c.inPorts.in.attach(ins);
      done();
    });
  });
  beforeEach(() => {
    out = noflo.internalSocket.createSocket();
    c.outPorts.out.attach(out);
  });
  afterEach((done) => {
    c.outPorts.out.detach(out);
    out = null;
    c.shutdown(done);
  });

  describe('with a number to count down from', () => it('should count each packet', (done) => {
    let received = 0;
    out.on('data', (data) => {
      chai.expect(data).to.be.a('null');
      received += 1;
    });
    out.on('disconnect', () => {
      chai.expect(received).to.equal(1);
      done();
    });

    count.send(2);
    repeat.send(true);
    ins.connect();
    ins.send('packet');
    ins.disconnect();
    ins.connect();
    ins.send('packet');
    ins.disconnect();
  }));

  describe('when set to "no repeat" mode', () => {
    it('should only count down once', (done) => {
      let received = 0;
      out.on('data', (data) => {
        chai.expect(data).to.be.a('null');
        received += 1;
      });
      out.on('disconnect', () => {
        chai.expect(received).to.equal(1);
        done();
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
      ins.disconnect();
    });
  });
});
