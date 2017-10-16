noflo = require 'noflo'

unless noflo.isBrowser()
  chai = require 'chai'
  path = require 'path'
  baseDir = path.resolve __dirname, '../'
else
  baseDir = 'noflo-flow'

describe 'Gate component', ->
  loader = null
  open = null
  close = null
  ins = null
  out = null

  before ->
    loader = new noflo.ComponentLoader baseDir
  beforeEach (done) ->
    @timeout 4000
    loader.load 'flow/Gate', (err, instance) ->
      return done err if err
      ins = noflo.internalSocket.createSocket()
      instance.inPorts.in.attach ins
      open = noflo.internalSocket.createSocket()
      instance.inPorts.open.attach open
      close = noflo.internalSocket.createSocket()
      instance.inPorts.close.attach close
      out = noflo.internalSocket.createSocket()
      instance.outPorts.out.attach out
      done()
  describe 'when gate is opened', ->
    it 'should send only the packets while gate was open', (done) ->
      expected = [
        '2'
        '< bar'
        '3'
        '>'
      ]
      received = []
      out.on 'begingroup', (group) ->
        received.push "< #{group}"
      out.on 'data', (data) ->
        received.push "#{data}"
      out.on 'endgroup', (group) ->
        received.push '>'
        return unless received.length is expected.length
        chai.expect(received).to.eql expected
        done()
      ins.beginGroup 'foo'
      ins.send 1
      open.send true
      ins.send 2
      ins.beginGroup 'bar'
      ins.send 3
      ins.endGroup 'bar'
      close.send true
      ins.send 4
      ins.endGroup 'foo'

