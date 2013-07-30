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

exports["ensure nesting streams get separated by disconnection"] = (test) ->
  [c, [insA, insB, insC], [outA, outB, outC]] = setup("CleanDisconnect", ["in", "in", "in"], ["out", "out", "out"])

  count = 0

  outA.on "data", (data) ->
    test.equal data, "a"
    test.equal count, 0
    count++
  outB.on "data", (data) ->
    test.equal data, "b"
    test.equal count, 2
    count++
  outC.on "data", (data) ->
    test.equal data, "c"
    test.equal count, 4
    count++

  outA.on "disconnect", ->
    test.equal count, 1
    count++
  outB.on "disconnect", ->
    test.equal count, 3
    count++
  outC.on "disconnect", ->
    test.equal count, 5
    test.done()

  insA.connect()
  insA.send("a")
  insB.connect()
  insB.send("b")
  insC.connect()
  insC.send("c")
  insC.disconnect()
  insB.disconnect()
  insA.disconnect()
