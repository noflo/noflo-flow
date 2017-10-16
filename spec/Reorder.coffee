noflo = require 'noflo'

unless noflo.isBrowser()
  chai = require 'chai'
  path = require 'path'
  baseDir = path.resolve __dirname, '../'
else
  baseDir = 'noflo-flow'

describe 'Reorder component', ->
  loader = null
  g = {}

  before ->
    loader = new noflo.ComponentLoader baseDir
  beforeEach (done) ->
    @timeout 4000
    loader.load 'flow/Reorder', (err, instance) ->
      return done err if err
      g.c = instance
      g.insA = noflo.internalSocket.createSocket()
      g.insB = noflo.internalSocket.createSocket()
      g.insC = noflo.internalSocket.createSocket()
      g.outA = noflo.internalSocket.createSocket()
      g.outB = noflo.internalSocket.createSocket()
      g.outC = noflo.internalSocket.createSocket()
      g.c.inPorts.in.attach g.insA
      g.c.outPorts.out.attach g.outA
      done()

  describe 'when instantiated', ->
    it 'should have input ports', ->
      chai.expect(g.c.inPorts.in).to.be.an 'object'

    it 'should have an g.output port', ->
      chai.expect(g.c.outPorts.out).to.be.an 'object'

  it "connect some number of ports and packets are sent in the reverse order of attachment", (done) ->
    g.c.inPorts.in.attach g.insB
    g.c.inPorts.in.attach g.insC
    g.c.outPorts.out.attach g.outB
    g.c.outPorts.out.attach g.outC

    expected = [
      '3 c'
      '2 b'
      '1 a'
    ]
    received = []

    g.outA.on "data", (data) ->
      received.push "1 #{data}"
      return unless received.length is expected.length
      chai.expect(received).to.eql expected
      done()
    g.outB.on "data", (data) ->
      received.push "2 #{data}"
      return unless received.length is expected.length
      chai.expect(received).to.eql expected
      done()
    g.outC.on "data", (data) ->
      received.push "3 #{data}"
      return unless received.length is expected.length
      chai.expect(received).to.eql expected
      done()

    g.insA.connect()
    g.insA.send("a")
    g.insA.disconnect()

    g.insB.connect()
    g.insB.send("b")
    g.insB.disconnect()

    g.insC.connect()
    g.insC.send("c")
    g.insC.disconnect()

  it "the number of ports to wait for stream end until forwarding takes place is the lessor of the number of inports and the number of g.outports", (done) ->
    g.c.inPorts.in.attach g.insB
    g.c.outPorts.out.attach g.outB
    g.c.outPorts.out.attach g.outC

    expected = [
      '2 b'
      '1 a'
    ]
    received = []

    g.outA.on "data", (data) ->
      received.push "1 #{data}"
      return unless received.length is expected.length
      chai.expect(received).to.eql expected
      done()
    g.outB.on "data", (data) ->
      received.push "2 #{data}"
      return unless received.length is expected.length
      chai.expect(received).to.eql expected
      done()
    g.outC.on "data", (data) ->
      done new Error "C received data unlike expected"

    g.insA.connect()
    g.insA.send("a")
    g.insA.disconnect()

    g.insB.connect()
    g.insB.send("b")
    g.insB.disconnect()
