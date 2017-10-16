noflo = require 'noflo'

unless noflo.isBrowser()
  chai = require 'chai'
  path = require 'path'
  baseDir = path.resolve __dirname, '../'
else
  baseDir = 'noflo-flow'

describe 'Deny component', ->
  loader = null
  deny = null
  ins = null
  out = null

  before ->
    loader = new noflo.ComponentLoader baseDir
  beforeEach (done) ->
    @timeout 4000
    loader.load 'flow/Deny', (err, instance) ->
      return done err if err
      ins = noflo.internalSocket.createSocket()
      instance.inPorts.in.attach ins
      deny = noflo.internalSocket.createSocket()
      instance.inPorts.deny.attach deny
      out = noflo.internalSocket.createSocket()
      instance.outPorts.out.attach out
      done()
  describe 'denying only certain numbers', ->
    it 'should send the expected numbers out', (done) ->
      expected = [
        '< foo'
        '2'
        '4'
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
      deny.send 1
      deny.send 3
      ins.beginGroup 'foo'
      ins.send 1
      ins.send 2
      ins.send 3
      ins.send 4
      ins.endGroup 'foo'
