noflo = require("noflo")

class Accept extends noflo.Component

  description: "accept and forward certain incoming packets"

  constructor: ->
    @default = []
    @accept = @default

    @inPorts = new noflo.InPorts
      in:
        datatype: 'all'
        description: 'An IP to be forwarded if accepted'
      accept:
        datatype: 'all'
        description: 'IP to be accepted'
      reset:
        datatype: 'bang'
        description: 'Reset the list accepted IP'
    @outPorts = new noflo.OutPorts
      out:
        datatype: 'all'

    @inPorts.accept.on "data", (data) =>
      @accept.push(data)

    @inPorts.reset.on "data", (data) =>
      @accept = @default

    @inPorts.in.on "begingroup", (group) =>
      @outPorts.out.beginGroup(group)

    @inPorts.in.on "data", (data) =>
      if @accept.indexOf(data) > -1
        @outPorts.out.send(data)

    @inPorts.in.on "endgroup", (group) =>
      @outPorts.out.endGroup()

    @inPorts.in.on "disconnect", =>
      @outPorts.out.disconnect()

exports.getComponent = -> new Accept
