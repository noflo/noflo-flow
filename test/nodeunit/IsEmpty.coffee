# TODO: find a way to test graphs...
# Socket = require("../../node_modules/noflo/src/lib/InternalSocket")

# setup = (component, inNames=[], outNames=[], type = "component") ->
#   c = require("../../#{type}s/#{component}").getComponent()
#   inPorts = []
#   outPorts = []

#   for name in inNames
#     port = Socket.createSocket()
#     c.inPorts[name].attach(port)
#     inPorts.push(port)

#   for name in outNames
#     port = Socket.createSocket()
#     c.outPorts[name].attach(port)
#     outPorts.push(port)

#   [c, inPorts, outPorts]

# exports["send an empty array and the 'YES' port receives it"] = (test) ->
#   [c, [ins], [yesOut, noOut]] = setup("IsEmpty", ["in"], ["yes", "no"], "graph")

#   yesOut.on "data", (data) ->
#     test.equal data, []
#   noOut.on "data", (data) ->
#     test.ok false
#   yesOut.on "disconnect", ->
#     test.done()

#   ins.connect()
#   ins.send []
#   ins.disconnect()

# exports["send a filled array and the 'NO' port receives it"] = (test) ->
#   [c, [ins], [yesOut, noOut]] = setup("IsEmpty", ["in"], ["yes", "no"], "graph")

#   yesOut.on "data", (data) ->
#     test.equal data, [1, 2, 3]
#   noOut.on "data", (data) ->
#     test.ok false
#   yesOut.on "disconnect", ->
#     test.done()

#   ins.connect()
#   ins.send [1, 2, 3]
#   ins.disconnect()
