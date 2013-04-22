noflo = require("noflo")
_ = require("underscore")
_s = require("underscore.string")

class IsEmpty extends noflo.Component

  description: _s.clean "forward input as-is to 'yes' if input is falsy
  or empty if it is an object/array and 'no' otherwise"

  constructor: ->
    @inPorts =
      in: new noflo.Port
    @outPorts =
      yes: new noflo.Port
      no: new noflo.Port

    @inPorts.in.on "connect", =>
      @groups = []
      @sentPorts = []

    @inPorts.in.on "begingroup", (group) =>
      @groups.push(group)

    @inPorts.in.on "data", (data) =>
      isObj = _.isObject(data)

      if isObj and _.isEmpty(data) or not isObj and not data
        @sentPorts.push("yes")
        port = @outPorts.yes
      else
        @sentPorts.push("no")
        port = @outPorts.no

      port.beginGroup(group) for group in @groups
      port.send(data)
      port.endGroup() for group in @groups

    @inPorts.in.on "endgroup", (group) =>
      @groups.pop()

    @inPorts.in.on "disconnect", =>
      @outPorts.yes.disconnect() if @sentPorts.indexOf("yes") > -1
      @outPorts.no.disconnect() if @sentPorts.indexOf("no") > -1

exports.getComponent = -> new IsEmpty
