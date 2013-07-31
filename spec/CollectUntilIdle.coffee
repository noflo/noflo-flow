noflo = require 'noflo'

if typeof process is 'object' and process.title is 'node'
  chai = require 'chai' unless chai
  CollectUntilIdle = require '../components/CollectUntilIdle.coffee'
else
  CollectUntilIdle = require 'noflo-core/components/CollectUntilIdle.js'

describe 'CollectUntilIdle component', ->
  g = {}

  beforeEach ->
    g.c = CollectUntilIdle.getComponent()
    g.ins = noflo.internalSocket.createSocket()
    g.timeout = noflo.internalSocket.createSocket()
    g.out = noflo.internalSocket.createSocket()
    g.c.inPorts.in.attach g.ins
    g.c.inPorts.timeout.attach g.timeout
    g.c.outPorts.out.attach g.out

  describe 'when g.instantiated', ->
    it 'should have input ports', ->
      chai.expect(g.c.inPorts.in).to.be.an 'object'
      chai.expect(g.c.inPorts.timeout).to.be.an 'object'

    it 'should have an output port', ->
      chai.expect(g.c.outPorts.out).to.be.an 'object'

  it "test no groups", (done) ->
    output = []
    g.out.on "data", (data) ->
      output.push data
    g.out.on "disconnect", ->
      chai.expect(output).to.deep.equal ["a","b","c"]
      done()
    g.ins.send "a"
    g.ins.send "b"
    g.ins.send "c"
    g.ins.disconnect()
