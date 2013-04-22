noflo = require("noflo")
_ = require("underscore")
_s = require("underscore.string")

class IsEqual extends noflo.Component

  description: _s.clean "tests if 'left' and 'right' are the same; if
  so, forward 'right' to 'yes'; otherwise, forward 'right' to 'no'"

  constructor: ->
    @inPorts =
      left: new noflo.Port
      right: new noflo.Port
    @outPorts =
      yes: new noflo.Port
      no: new noflo.Port

    @inPorts.left.on "connect", =>
      @left = []

    @inPorts.left.on "data", (data) =>
      @left.push(data)

    @inPorts.left.on "disconnect", =>
      @compare()

    @inPorts.right.on "connect", =>
      @groups = []
      @right = []

    @inPorts.right.on "begingroup", (group) =>
      @groups.push(group)

    @inPorts.right.on "data", (data) =>
      @right.push(data)

    @inPorts.right.on "disconnect", =>
      @compare()

  compare: ->
    return unless @left? and @right?

    if _.isEqual(@left, @right)
      port = @outPorts.yes
    else
      port = @outPorts.no

    port.beginGroup(group) for group in @groups
    port.send(data) for data in @right
    port.endGroup(group) for group in @groups
    port.disconnect()

    @left = null
    @right = null

exports.getComponent = -> new IsEqual
