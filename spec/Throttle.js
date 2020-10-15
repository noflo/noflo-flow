/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
describe('Throttle component', function() {
  let loader = null;
  let load = null;
  let max = null;
  let ins = null;
  let out = null;

  before(() => loader = new noflo.ComponentLoader(baseDir));
  beforeEach(function(done) {
    this.timeout(4000);
    return loader.load('flow/Throttle', function(err, instance) {
      if (err) { return done(err); }
      ins = noflo.internalSocket.createSocket();
      instance.inPorts.in.attach(ins);
      load = noflo.internalSocket.createSocket();
      instance.inPorts.load.attach(load);
      max = noflo.internalSocket.createSocket();
      instance.inPorts.max.attach(max);
      out = noflo.internalSocket.createSocket();
      instance.outPorts.out.attach(out);
      return done();
    });
  });
  return it('should only send packets when load is acceptable', function(done) {
      const expected = [
        'LOAD 2',
        'LOAD 1',
        '< bar',
        'LOAD 2',
        '1',
        'LOAD 1',
        '>',
        'LOAD 2',
        '2'
      ];
      const received = [];
      const setLoad = function(number) {
        received.push(`LOAD ${number}`);
        load.send(number);
        if (received.length !== expected.length) { return; }
        chai.expect(received).to.eql(expected);
        return done();
      };
      out.on('begingroup', group => received.push(`< ${group}`));
      out.on('data', function(data) {
        setLoad(2);
        received.push(`${data}`);
        if (!(received.length >= expected.length)) {
          setLoad(1);
          return;
        }
        chai.expect(received).to.eql(expected);
        return done();
      });
      out.on('endgroup', function(group) {
        received.push('>');
        if (received.length !== expected.length) { return; }
        chai.expect(received).to.eql(expected);
        return done();
      });
      max.send(2);
      setLoad(2);
      ins.beginGroup('bar');
      ins.send(1);
      ins.endGroup('bar');
      ins.send(2);
      ins.send(3);
      return setLoad(1);
  });
});
