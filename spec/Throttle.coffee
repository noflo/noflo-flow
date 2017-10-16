noflo = require 'noflo'

unless noflo.isBrowser()
  chai = require 'chai'
  path = require 'path'
  baseDir = path.resolve __dirname, '../'
else
  baseDir = 'noflo-flow'

describe 'Throttle component', ->
  loader = null
  load = null
  max = null
  ins = null
  out = null

  before ->
    loader = new noflo.ComponentLoader baseDir
  beforeEach (done) ->
    @timeout 4000
    loader.load 'flow/Throttle', (err, instance) ->
      return done err if err
      ins = noflo.internalSocket.createSocket()
      instance.inPorts.in.attach ins
      load = noflo.internalSocket.createSocket()
      instance.inPorts.load.attach load
      max = noflo.internalSocket.createSocket()
      instance.inPorts.max.attach max
      out = noflo.internalSocket.createSocket()
      instance.outPorts.out.attach out
      done()
  it 'should only send packets when load is acceptable', (done) ->
      expected = [
        'LOAD 2'
        'LOAD 1'
        '< bar'
        'LOAD 2'
        '1'
        'LOAD 1'
        '>'
        'LOAD 2'
        '2'
      ]
      received = []
      setLoad = (number) ->
        received.push "LOAD #{number}"
        load.send number
        return unless received.length is expected.length
        chai.expect(received).to.eql expected
        done()
      out.on 'begingroup', (group) ->
        received.push "< #{group}"
      out.on 'data', (data) ->
        setLoad 2
        received.push "#{data}"
        unless received.length >= expected.length
          setLoad 1
          return
        chai.expect(received).to.eql expected
        done()
      out.on 'endgroup', (group) ->
        received.push '>'
        return unless received.length is expected.length
        chai.expect(received).to.eql expected
        done()
      max.send 2
      setLoad 2
      ins.beginGroup 'bar'
      ins.send 1
      ins.endGroup 'bar'
      ins.send 2
      ins.send 3
      setLoad 1
