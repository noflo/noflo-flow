noflo = require 'noflo'

unless noflo.isBrowser()
  chai = require 'chai'
  path = require 'path'
  baseDir = path.resolve __dirname, '../'
else
  baseDir = 'noflo-flow'

describe 'CountedMerge component', ->
  c = null
  threshold = null
  ins = null
  out = null
  before (done) ->
    @timeout 6000
    loader = new noflo.ComponentLoader baseDir
    loader.load 'flow/CountedMerge', (err, instance) ->
      return done err if err
      c = instance
      threshold = noflo.internalSocket.createSocket()
      ins = noflo.internalSocket.createSocket()
      c.inPorts.threshold.attach threshold
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
        '< a'
        'DATA a'
        '>'
        '< b'
        'DATA b'
        '>'
        '< c'
        'DATA c'
        '>'
      ]
      received = []

      out.on 'begingroup', (grp) ->
        received.push "< #{grp}"
      out.on 'data', (data) ->
        received.push "DATA #{data}"
      out.on 'endgroup', ->
        received.push '>'
      out.on 'disconnect', ->
        chai.expect(received).to.eql expected
        done()

      threshold.send 3

      ins.connect()
      ins.beginGroup 'a'
      ins.send 'a'
      ins.endGroup()
      ins.disconnect()
      ins.connect()
      ins.beginGroup 'b'
      ins.send 'b'
      ins.endGroup()
      ins.disconnect()
      ins.connect()
      ins.beginGroup 'c'
      ins.send 'c'
      ins.endGroup()
      ins.disconnect()
      ins.connect()
      ins.beginGroup 'd'
      ins.send 'd'
      ins.endGroup()
      ins.disconnect()
