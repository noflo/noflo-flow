noflo = require("noflo")

exports.getComponent = ->
  c = new noflo.Component
  c.description = "send connection to 'yes' if its top-level group is one
  of the provided groups, otherwise 'no'"
  c.inPorts.add 'in',
    datatype: 'all'
    description: 'IPs to route use their groups'
  c.inPorts.add 'regexp',
    datatype: 'string'
    description: 'Regexps to match groups'
  c.inPorts.add 'group',
    datatype: 'string'
    description: 'List of groups (one group per IP)'
  c.inPorts.add 'reset',
    datatype: 'bang'
    description: 'Reset the list of groups and regexps'
  c.outPorts.add 'yes',
    datatype: 'all'
    description: 'IPs with group that match the groups or regexps provided'
  c.outPorts.add 'no',
    datatype: 'all'
    description: 'IPs with group that don\'t match the groups or regexps
     provided'
  c.forwardBrackets = {}
  c.matchGroups = []
  c.regexps = []
  reset = ->
    c.matchGroups = []
    c.regexps = []
  c.tearDown = (callback) ->
    do reset
    do callback
  c.process (input, output) ->
    if input.hasData 'group'
      c.matchGroups.push input.getData 'group'
      output.done()
      return
    if input.hasData 'regexp'
      c.regexps.push new RegExp input.getData 'regexp'
      output.done()
      return
    if input.hasData 'reset'
      input.getData 'reset'
      do reset
      output.done()
      return
    return unless input.hasStream 'in'
    packets = input.getStream 'in'
    unless packets[0].type is 'openBracket'
      # Stream doesn't start with a group, send to NO
      for packet in packets
        output.send
          no: packet
      output.done()
      return
    matched = false
    group = packets[0].data
    for matchGroup in c.matchGroups
      continue unless group is matchGroup
      matched = true
    for regexp in c.regexps
      continue unless group.match(regexp)?
      matched = true
    unless matched
      for packet in packets
        output.send
          no: packet
      output.done()
      return
    for packet in packets
      output.send
        yes: packet
    output.done()
    return
