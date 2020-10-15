/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
describe('CountedMerge component', function() {
  let c = null;
  let threshold = null;
  let ins = null;
  let out = null;
  before(function(done) {
    this.timeout(6000);
    const loader = new noflo.ComponentLoader(baseDir);
    return loader.load('flow/CountedMerge', function(err, instance) {
      if (err) { return done(err); }
      c = instance;
      threshold = noflo.internalSocket.createSocket();
      ins = noflo.internalSocket.createSocket();
      c.inPorts.threshold.attach(threshold);
      c.inPorts.in.attach(ins);
      return done();
    });
  });
  beforeEach(function() {
    out = noflo.internalSocket.createSocket();
    return c.outPorts.out.attach(out);
  });
  afterEach(function() {
    c.outPorts.out.detach(out);
    return out = null;
  });

  return describe('with a count or 3 and some streams', () => it('should merge packets from first three streams', function(done) {
    const expected = [
      '< a',
      'DATA a',
      '>',
      '< b',
      'DATA b',
      '>',
      '< c',
      'DATA c',
      '>'
    ];
    const received = [];

    out.on('begingroup', grp => received.push(`< ${grp}`));
    out.on('data', data => received.push(`DATA ${data}`));
    out.on('endgroup', function() {
      received.push('>');
      if (received.length !== expected.length) { return; }
      return setTimeout(function() {
        chai.expect(received).to.eql(expected);
        return done();
      }
      , 100);
    });

    threshold.send(3);

    ins.connect();
    ins.beginGroup('a');
    ins.send('a');
    ins.endGroup();
    ins.disconnect();
    ins.connect();
    ins.beginGroup('b');
    ins.send('b');
    ins.endGroup();
    ins.disconnect();
    ins.connect();
    ins.beginGroup('c');
    ins.send('c');
    ins.endGroup();
    ins.disconnect();
    ins.connect();
    ins.beginGroup('d');
    ins.send('d');
    ins.endGroup();
    return ins.disconnect();
  }));
});
