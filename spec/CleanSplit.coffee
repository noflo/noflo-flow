noflo = require 'noflo'

unless noflo.isBrowser()
  chai = require 'chai'
  path = require 'path'
  baseDir = path.resolve __dirname, '../'
else
  baseDir = 'noflo-flow'

describe 'CleanSplit component', ->
  loader = null
  accept = null
  ins = null
  out = null

  before ->
    loader = new noflo.ComponentLoader baseDir
  beforeEach (done) ->
    @timeout 4000
    loader.load 'flow/CleanSplit', (err, instance) ->
      return done err if err
      ins = noflo.internalSocket.createSocket()
      instance.inPorts.in.attach ins
      out = noflo.internalSocket.createSocket()
      instance.outPorts.out.attach out
      done()
  describe 'accepting only certain numbers', ->
    it 'should send the expected numbers out', (done) ->
      expected = [
        '< foo'
        '1'
        '2'
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
      ins.send 2
      ins.send 3
      chai.expect(received).to.eql []
      ins.endGroup 'foo'


