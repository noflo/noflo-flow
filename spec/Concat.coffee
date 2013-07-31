noflo = require 'noflo'

unless noflo.isBrowser()
  chai = require 'chai' unless chai
  Concat = require '../components/Concat.coffee'
else
  Concat = require 'noflo-core/components/Concat.js'

describe 'Concat component', ->
  g = {}
  inCount = 2

  beforeEach ->
    g.c = Concat.getComponent()

    g.ins = []
    while inCount
      sock = noflo.internalSocket.createSocket()
      g.ins.push sock
      g.c.inPorts.in.attach sock
      inCount--

    g.out = noflo.internalSocket.createSocket()
    g.c.outPorts.out.attach g.out

  describe 'when instantiated', ->
    it 'should have input ports', ->
      chai.expect(g.c.inPorts.in).to.be.an 'object'

    it 'should have an g.output port', ->
      chai.expect(g.c.outPorts.out).to.be.an 'object'

  it 'packets sent to two ports should be ordered', (done) ->
    g.out.once 'data', (data) ->
      chai.expect(data).to.deep.equal 'hello'
      g.out.once 'data', (data) ->
        chai.expect(data).to.deep.equal 'world'
        done()
      
    g.ins[0].connect()
    g.ins[1].send 'world'
    g.ins[0].send 'hello'

    # For next test
    inCount = 3

  it 'packets sent to three ports should be ordered', (done) ->
    g.out.once 'data', (data) ->
      chai.expect(data).to.deep.equal 'foo'
      g.out.once 'data', (data) ->
        chai.expect(data).to.deep.equal 'bar'
        g.out.once 'data', (data) ->
          chai.expect(data).to.deep.equal 'baz'
          done()
      
    g.ins[0].connect()
    g.ins[1].send 'bar'
    g.ins[2].send 'baz'
    g.ins[0].send 'foo'

    # For next test
    inCount = 2

  it 'buffers should be cleared by disconnect to avoid deadlock', (done) ->
    g.out.once 'data', (data) ->
      chai.expect(data).to.deep.equal 'hello'
      g.out.once 'data', (data) ->
        chai.expect(data).to.deep.equal 'world'
        done()
      
    g.ins[0].connect()
    g.ins[1].connect()
    # This packet will be lost because it doesn't have a pair
    # and we disconnect
    g.ins[1].send 'foo'
    g.ins[0].disconnect()
    g.ins[1].disconnect()
    g.ins[0].connect()
    g.ins[1].send 'world'
    g.ins[0].send 'hello'
