noflo = require 'noflo'

unless noflo.isBrowser()
  chai = require 'chai' unless chai
  Reorder = require '../components/Reorder.coffee'
else
  Reorder = require 'noflo-core/components/Reorder.js'

describe 'Reorder component', ->
  g = {}

  beforeEach ->
    g.c = Reorder.getComponent()
    g.insA = noflo.internalSocket.createSocket()
    g.insB = noflo.internalSocket.createSocket()
    g.insC = noflo.internalSocket.createSocket()
    g.outA = noflo.internalSocket.createSocket()
    g.outB = noflo.internalSocket.createSocket()
    g.outC = noflo.internalSocket.createSocket()
    g.c.inPorts.in.attach g.insA
    g.c.outPorts.out.attach g.outA

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

    count = 0

    g.outA.on "data", (data) ->
      chai.expect(++count).to.equal 3
      chai.expect(data).to.equal "a"
    g.outB.on "data", (data) ->
      chai.expect(++count).to.equal 2
      chai.expect(data).to.equal "b"
    g.outC.on "data", (data) ->
      chai.expect(++count).to.equal 1
      chai.expect(data).to.equal "c"
    g.outA.on "disconnect", ->
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

  it "the number of ports to wait for disconnection until forwarding takes place is the lessor of the number of inports and the number of g.outports", (done) ->
    g.c.inPorts.in.attach g.insB
    g.c.outPorts.out.attach g.outB
    g.c.outPorts.out.attach g.outC

    count = 0

    g.outA.on "data", (data) ->
      chai.expect(++count).to.equal 2
      chai.expect(data).to.equal "a"
    g.outB.on "data", (data) ->
      chai.expect(++count).to.equal 1
      chai.expect(data).to.equal "b"
    g.outC.on "data", (data) ->
      chai.expect(false).to.be.ok
    g.outA.on "disconnect", ->
      done()

    g.insA.connect()
    g.insA.send("a")
    g.insA.disconnect()

    g.insB.connect()
    g.insB.send("b")
    g.insB.disconnect()
