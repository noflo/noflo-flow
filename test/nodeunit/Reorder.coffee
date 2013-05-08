Socket = require("../../node_modules/noflo/src/lib/InternalSocket")

setup = (component, inNames=[], outNames=[], type = "component") ->
  c = require("../../#{type}s/#{component}").getComponent()
  inPorts = []
  outPorts = []

  for name in inNames
    port = Socket.createSocket()
    c.inPorts[name].attach(port)
    inPorts.push(port)

  for name in outNames
    port = Socket.createSocket()
    c.outPorts[name].attach(port)
    outPorts.push(port)

  [c, inPorts, outPorts]

exports["connect some number of ports and packets are sent in the reverse order of attachment"] = (test) ->
  [c, [insA, insB, insC], [outA, outB, outC]] = setup("Reorder", ["in", "in", "in"], ["out", "out", "out"])

  count = 0

  outA.on "data", (data) ->
    test.equal ++count, 3
    test.equal data, "a"
  outB.on "data", (data) ->
    test.equal ++count, 2
    test.equal data, "b"
  outC.on "data", (data) ->
    test.equal ++count, 1
    test.equal data, "c"
  outA.on "disconnect", ->
    test.done()

  insA.connect()
  insA.send("a")
  insA.disconnect()

  insB.connect()
  insB.send("b")
  insB.disconnect()

  insC.connect()
  insC.send("c")
  insC.disconnect()

exports["the number of ports to wait for disconnection until forwarding takes place is the lessor of the number of inports and the number of outports"] = (test) ->
  [c, [insA, insB], [outA, outB, outC]] = setup("Reorder", ["in", "in"], ["out", "out", "out"])

  count = 0

  outA.on "data", (data) ->
    test.equal ++count, 2
    test.equal data, "a"
  outB.on "data", (data) ->
    test.equal ++count, 1
    test.equal data, "b"
  outC.on "data", (data) ->
    test.ok false, "is not called"
  outA.on "disconnect", ->
    test.done()

  insA.connect()
  insA.send("a")
  insA.disconnect()

  insB.connect()
  insB.send("b")
  insB.disconnect()
