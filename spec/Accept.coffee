noflo = require 'noflo'

unless noflo.isBrowser()
  chai = require 'chai'
  path = require 'path'
  baseDir = path.resolve __dirname, '../'
else
  baseDir = 'noflo-flow'

describe 'Accept component', ->
  loader = null
  accept = null
  ins = null
  out = null

  before ->
    loader = new noflo.ComponentLoader baseDir
  beforeEach (done) ->
    @timeout 4000
    loader.load 'flow/Accept', (err, instance) ->
      return done err if err
      ins = noflo.internalSocket.createSocket()
      instance.inPorts.in.attach ins
      accept = noflo.internalSocket.createSocket()
      instance.inPorts.accept.attach accept
      out = noflo.internalSocket.createSocket()
      instance.outPorts.out.attach out
      done()
  describe 'accepting only certain numbers', ->
    it 'should send the expected numbers out', (done) ->
      expected = [
        '< foo'
        '1'
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
      accept.send 1
      accept.send 3
      ins.beginGroup 'foo'
      ins.send 1
      ins.send 2
      ins.send 3
      ins.send 4
      ins.endGroup 'foo'

