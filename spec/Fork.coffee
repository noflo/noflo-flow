noflo = require 'noflo'

unless noflo.isBrowser()
  chai = require 'chai' unless chai
  Fork = require '../components/Fork.coffee'
else
  Fork = require 'noflo-core/components/Fork.js'

describe 'Fork component', ->
  g = {}

  beforeEach ->
    g.c = Fork.getComponent()
    g.ins = noflo.internalSocket.createSocket()
    g.portIns = noflo.internalSocket.createSocket()
    g.outA = noflo.internalSocket.createSocket()
    g.outB = noflo.internalSocket.createSocket()
    g.outC = noflo.internalSocket.createSocket()
    g.c.inPorts.in.attach g.ins
    g.c.inPorts.port.attach g.portIns
    g.c.outPorts.out.attach g.outA
    g.c.outPorts.out.attach g.outB
    g.c.outPorts.out.attach g.outC

  describe 'when instantiated', ->
    it 'should have input ports', ->
      chai.expect(g.c.inPorts.in).to.be.an 'object'
      chai.expect(g.c.inPorts.port).to.be.an 'object'

    it 'should have an g.output port', ->
      chai.expect(g.c.outPorts.out).to.be.an 'object'

  it "sends IPs to the specified port", (done) ->
    g.outA.on "data", (data) ->
      chai.expect(false).to.be.ok
    g.outB.on "data", (data) ->
      chai.expect("a")
    g.outC.on "data", (data) ->
      chai.expect(false).to.be.ok
    g.outB.on "disconnect", ->
      done()

    g.portIns.connect()
    g.portIns.send(1)
    g.portIns.disconnect()

    g.ins.connect()
    g.ins.send("a")
    g.ins.disconnect()

  it "sends IPs to multiple ports", (done) ->
    g.outA.on "data", (data) ->
      chai.expect("a")
    g.outB.on "data", (data) ->
      chai.expect("a")
    g.outC.on "data", (data) ->
      chai.expect(false).to.be.ok
    g.outB.on "disconnect", ->
      done()

    g.portIns.connect()
    g.portIns.send(0)
    g.portIns.send(1)
    g.portIns.disconnect()

    g.ins.connect()
    g.ins.send("a")
    g.ins.disconnect()

  it "resets fork settings on every connection to 'PORT'", (done) ->
    g.outA.on "data", (data) ->
      chai.expect(false).to.be.ok
    g.outB.on "data", (data) ->
      chai.expect("a")
    g.outC.on "data", (data) ->
      chai.expect(false).to.be.ok
    g.outB.on "disconnect", ->
      done()

    g.portIns.connect()
    g.portIns.send(0)
    g.portIns.disconnect()
    g.portIns.connect()
    g.portIns.send(1)
    g.portIns.disconnect()

    g.ins.connect()
    g.ins.send("a")
    g.ins.disconnect()

  it "send to all by default", (done) ->
    g.outA.on "data", (data) ->
      chai.expect("a")
    g.outB.on "data", (data) ->
      chai.expect("a")
    g.outC.on "data", (data) ->
      chai.expect("a")
    g.outC.on "disconnect", ->
      done()

    g.ins.connect()
    g.ins.send("a")
    g.ins.disconnect()
