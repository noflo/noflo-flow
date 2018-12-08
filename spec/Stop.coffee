describe 'Stop component', ->
  c = null
  ready = null
  ins = null
  out = null
  before (done) ->
    @timeout 6000
    loader = new noflo.ComponentLoader baseDir
    loader.load 'flow/Stop', (err, instance) ->
      return done err if err
      c = instance
      ready = noflo.internalSocket.createSocket()
      ins = noflo.internalSocket.createSocket()
      c.inPorts.ready.attach ready
      c.inPorts.in.attach ins
      done()
  beforeEach ->
    out = noflo.internalSocket.createSocket()
    c.outPorts.out.attach out
  afterEach ->
    c.outPorts.out.detach out
    out = null

  describe 'with a count or 3 and some connections', ->
    it 'should merge packets from first three connections', (done) ->
      expected = [
        'DATA 1'
        'DATA 2'
        'DATA 3'
      ]
      received = []
      started = false

      out.on 'begingroup', (grp) ->
        chai.expect(started, 'should not receive before allowed').to.equal true
        received.push "< #{grp}"
      out.on 'data', (data) ->
        chai.expect(started, 'should not receive before allowed').to.equal true
        received.push "DATA #{data}"
        return unless received.length is expected.length
        chai.expect(received).to.eql expected
        done()
      out.on 'endgroup', ->
        received.push '>'

      ins.send 1
      ins.send 2
      ins.send 3
      ins.disconnect()

      ready.connect()
      started = true
      ready.send true
      ready.disconnect()
