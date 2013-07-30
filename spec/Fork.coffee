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

exports["send some IPs, then send the index of the ArrayPort to port to"] = (test) ->
  [c, [portIns, ins], [outA, outB, outC]] = setup("Fork", ["port", "in"], ["out", "out", "out"])

  outA.on "data", (data) ->
    test.ok(false)
  outB.on "data", (data) ->
    test.equal(data, "a")
  outC.on "data", (data) ->
    test.ok(false)
  outB.on "disconnect", ->
    test.done()

  ins.connect()
  ins.send("a")
  ins.disconnect()

  portIns.connect()
  portIns.send(1)
  portIns.disconnect()

exports["port to only one (the last one provided) ArrayPort"] = (test) ->
  [c, [portIns, ins], [outA, outB, outC]] = setup("Fork", ["port", "in"], ["out", "out", "out"])

  outA.on "data", (data) ->
    test.ok(false)
  outB.on "data", (data) ->
    test.equal(data, "a")
  outC.on "data", (data) ->
    test.ok(false)
  outB.on "disconnect", ->
    test.done()

  ins.connect()
  ins.send("a")
  ins.disconnect()

  portIns.connect()
  portIns.send(2)
  portIns.send(1)
  portIns.disconnect()

exports["send to all by default"] = (test) ->
  [c, [portIns, ins], [outA, outB, outC]] = setup("Fork", ["port", "in"], ["out", "out", "out"])

  test.expect 3

  outA.on "data", (data) ->
    test.equal(data, "a")
  outB.on "data", (data) ->
    test.equal(data, "a")
  outC.on "data", (data) ->
    test.equal(data, "a")
  outC.on "disconnect", ->
    test.done()

  ins.connect()
  ins.send("a")
  ins.disconnect()

  portIns.connect()
  portIns.disconnect()
