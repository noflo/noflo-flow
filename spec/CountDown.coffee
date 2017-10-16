noflo = require 'noflo'

unless noflo.isBrowser()
  chai = require 'chai'
  path = require 'path'
  baseDir = path.resolve __dirname, '../'
else
  baseDir = 'noflo-flow'

describe 'CountDown component', ->
  c = null
  count = null
  repeat = null
  ins = null
  out = null
  before (done) ->
    @timeout 6000
    loader = new noflo.ComponentLoader baseDir
    loader.load 'flow/CountDown', (err, instance) ->
      return done err if err
      c = instance
      count = noflo.internalSocket.createSocket()
      repeat = noflo.internalSocket.createSocket()
      ins = noflo.internalSocket.createSocket()
      c.inPorts.count.attach count
      c.inPorts.repeat.attach repeat
      c.inPorts.in.attach ins
      done()
  beforeEach ->
    out = noflo.internalSocket.createSocket()
    c.outPorts.out.attach out
  afterEach (done) ->
    c.outPorts.out.detach out
    out = null
    c.shutdown done

  describe 'with a number to count down from', ->
    it 'should count each packet', (done) ->
      received = 0
      out.on 'data', (data) ->
        chai.expect(data).to.be.a 'null'
        received++
      out.on 'disconnect', ->
        chai.expect(received).to.equal 1
        done()

      count.send 2
      repeat.send true
      ins.connect()
      ins.send 'packet'
      ins.disconnect()
      ins.connect()
      ins.send 'packet'
      ins.disconnect()

  describe 'when set to "no repeat" mode', ->
    it 'should only count down once', (done) ->
      received = 0
      out.on 'data', (data) ->
        chai.expect(data).to.be.a 'null'
        received++
      out.on 'disconnect', ->
        chai.expect(received).to.equal 1
        done()

      repeat.send false
      count.send 2
      ins.connect()
      ins.send 'packet'
      ins.disconnect()
      ins.connect()
      ins.send 'packet'
      ins.disconnect()
      ins.connect()
      ins.send 'packet'
      ins.disconnect()
      ins.connect()
      ins.send 'packet'
      ins.disconnect()
