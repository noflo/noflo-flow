noflo = require("noflo")

class Deny extends noflo.Component

  description: "deny certain incoming packets and forwards the rest"

  constructor: ->
    @default = ["", null, undefined]
    @deny = @default

    @inPorts = new noflo.InPorts
      in:
        datatype: 'all'
        description: 'IPs to filter through the deny list'
      deny:
        datatype: 'all'
        description: 'IPs to deny'
      reset:
        datatype: 'bang'
        description: 'Reset list of denied IPs'
    @outPorts = new noflo.OutPorts
      out:
        datatype: 'all'
        description: 'Non denied IPs'

    @inPorts.deny.on "data", (data) =>
      @deny.push(data)

    @inPorts.reset.on "data", (data) =>
      @deny = @default

    @inPorts.in.on "begingroup", (group) =>
      @outPorts.out.beginGroup(group)

    @inPorts.in.on "data", (data) =>
      if @deny.indexOf(data) < 0
        @outPorts.out.send(data)

    @inPorts.in.on "endgroup", (group) =>
      @outPorts.out.endGroup()

    @inPorts.in.on "disconnect", =>
      @outPorts.out.disconnect()

exports.getComponent = -> new Deny
