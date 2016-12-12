noflo = require 'noflo'

unless noflo.isBrowser()
  chai = require 'chai'
  path = require 'path'
  baseDir = path.resolve __dirname, '../'
else
  baseDir = 'noflo-flow'

describe 'ReverseSplit component', ->
  g = {}
  loader = null
  before ->
    loader = new noflo.ComponentLoader baseDir
  beforeEach (done) ->
    @timeout 4000
    loader.load 'flow/ReverseSplit', (err, instance) ->
      return done err if err
      g.c = instance
      g.ins = noflo.internalSocket.createSocket()
      g.outA = noflo.internalSocket.createSocket()
      g.outB = noflo.internalSocket.createSocket()
      g.outC = noflo.internalSocket.createSocket()
      g.c.inPorts.in.attach g.ins
      g.c.outPorts.out.attach g.outA
      g.c.outPorts.out.attach g.outB
      g.c.outPorts.out.attach g.outC
      done()

  describe 'when instantiated', ->
    it 'should have input ports', ->
      chai.expect(g.c.inPorts.in).to.be.an 'object'

    it 'should have an g.output port', ->
      chai.expect(g.c.outPorts.out).to.be.an 'object'

  it "send some IPs and they are forwarded in reverse order of port attachments", (done) ->
    count = 0

    g.outA.on "data", (data) ->
      chai.expect(++count).to.equal 3
    g.outB.on "data", (data) ->
      chai.expect(++count).to.equal 2
    g.outC.on "data", (data) ->
      chai.expect(++count).to.equal 1
    g.outA.on "disconnect", ->
      done()

    g.ins.connect()
    g.ins.send("a")
    g.ins.disconnect()
