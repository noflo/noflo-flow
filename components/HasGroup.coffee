noflo = require("noflo")

class HasGroup extends noflo.Component

  description: "send connection to 'yes' if its top-level group is one
  of the provided groups, otherwise 'no'"

  constructor: ->
    @matchGroups = []
    @regexps = []

    @inPorts = new noflo.InPorts
      in:
        datatype: 'all'
        description: 'IPs to route use their groups'
      regexp:
        datatype: 'string'
        description: 'Regexps to match groups'
      group:
        datatype: 'string'
        description: 'List of groups (one group per IP)'
      reset:
        datatype: 'bang'
        description: 'Reset the list of groups and regexps'
    @outPorts = new noflo.OutPorts
      yes:
        datatype: 'all'
        description: 'IPs with group that match the groups or regexps provided'
      no:
        datatype: 'all'
        description: 'IPs with group that don\'t match the groups or regexps
         provided'

    @inPorts.group.on "data", (data) =>
      @matchGroups.push(data)

    @inPorts.regexp.on "data", (data) =>
      @regexps.push(new RegExp(data))

    @inPorts.reset.on "data", (data) =>
      @groups = []
      @regexps = []

    @inPorts.in.on "connect", =>
      @port = null

    @inPorts.in.on "begingroup", (group) =>
      @match(group) unless @port?
      @port?.beginGroup(group)

    @inPorts.in.on "data", (data) =>
      @port?.send(data)

    @inPorts.in.on "endgroup", (group) =>
      @port?.endGroup(group)

    @inPorts.in.on "disconnect", =>
      @port?.disconnect()

  match: (group) ->
    # Full matches
    for matchGroup in @matchGroups
      if matchGroup is group
        return @port = @outPorts.yes

    # RegExp matches
    for regexp in @regexps
      if group.match(regexp)?
        return @port = @outPorts.yes

    # Otherwise, fail
    @port = @outPorts.no

exports.getComponent = -> new HasGroup
