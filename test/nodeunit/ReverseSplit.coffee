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

exports["send some IPs and they are forwarded in reverse order of port attachments"] = (test) ->
  [c, [ins], [outA, outB, outC]] = setup("ReverseSplit", ["in"], ["out", "out", "out"])

  count = 0

  outA.on "data", (data) ->
    test.equal ++count, 3
  outB.on "data", (data) ->
    test.equal ++count, 2
  outC.on "data", (data) ->
    test.equal ++count, 1
  outA.on "disconnect", ->
    test.done()

  ins.connect()
  ins.send("a")
  ins.disconnect()
