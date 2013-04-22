noflo = require("noflo")
_ = require("underscore")
_s = require("underscore.string")

class Wait extends noflo.Component

  description: _s.clean "save incoming IPs and send the saved IPs to
  port 'out' upon any data IP from 'ready'"

  constructor: ->
    @inPorts =
      in: new noflo.Port
      ready: new noflo.Port
    @outPorts =
      out: new noflo.Port

    @inPorts.ready.on "disconnect", =>
      @emitWait(@groupWait, @dataWait)
      @outPorts.out.disconnect()

    @inPorts.in.on "connect", =>
      @groups = []
      @groupWait = {}
      @dataWait = []

    @inPorts.in.on "begingroup", (group) =>
      { groupWait, dataWait } = @locate()

      groupWait[group] = {}
      dataWait[group] = []

      @groups.push(group)

    @inPorts.in.on "data", (data) =>
      { dataWait } = @locate()

      dataWait.push(data)

    @inPorts.in.on "endgroup", (group) =>
      @groups.pop()

  locate: ->
    groupWait = @groupWait
    dataWait = @dataWait

    for group in @groups
      groupWait = groupWait[group]
      dataWait = dataWait[group]

    groupWait: groupWait
    dataWait: dataWait

  emitWait: (groupWait, dataWait) ->
    # Send out the data
    @outPorts.out.send(data) for data in dataWait

    # Just send the data out and call it a round without groups
    return if _.isEmpty(groupWait)

    # Go through everything
    for group in _.keys(groupWait)
      subGroupWait = groupWait[group]
      subDataWait = dataWait[group]

      @outPorts.out.beginGroup(group)
      @emitWait(subGroupWait, subDataWait)
      @outPorts.out.endGroup()

exports.getComponent = -> new Wait
