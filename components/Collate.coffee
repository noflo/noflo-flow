noflo = require 'noflo'

# The actual collation algorithm, returns a closure with the control fields
# that can be used with Array.prototype.sort()
sortByControlFields = (fields, a, b) ->
  # If there are no control fields specified we can't sort
  return 0 unless fields.length

  # Comparison of a single control field
  sort = (left, right) ->
    # Lowercase strings to they always sort correctly
    left = left.toLowerCase() if typeof left is 'string'
    right = right.toLowerCase() if typeof right is 'string'

    return 0 if left is right
    return 1 if left > right
    -1

  # Traverse the fields until you find one to sort by
  for field in fields
    order = sort a.data[field], b.data[field]
    return order unless order is 0

  # All fields were the same, send in order of appearance
  if @indexOf(a) < @indexOf(b)
    return -1
  1

# Sending the collated objects to the output port together with bracket IPs
sendWithGroups = (packets, fields, output) ->
  previous = null
  for packet in packets
    # For the first packet send a bracket IP for each control field
    for field in fields
      break if previous
      output.send
        out: new noflo.IP 'openBracket', field

    # For subsequent packets send ending and opening brackets for fields that
    # are different
    if previous
      for field, idx in fields
        continue if packet.data[field] is previous.data[field]
        # Differing field found, close this bracket and all following ones
        differing = fields.slice idx
        closes = differing.slice(0)
        closes.reverse()
        for f in closes
          output.send
            out: new noflo.IP 'closeBracket', f
        for f in differing
          output.send
            out: new noflo.IP 'openBracket', f
        break

    # Send it out
    output.send
      out: packet

    # Provide for comparison to the next one
    previous = packet

  # Last packet sent, send closing brackets
  closes = fields.slice(0)
  closes.reverse()
  for field in closes
    output.send
      out: new noflo.IP 'closeBracket', field

exports.getComponent = ->
  c = new noflo.Component
  c.description = 'Collate two or more streams, based on
  a list of control field lengths'
  c.icon = 'sort-amount-asc'
  # Inport for accepting a comma-separated list of control fields
  c.inPorts.add 'ctlfields',
    datatype: 'string'
    description: 'Comma-separated list of object keys to collate by'
    control: true
  # Here we accept packets from 0-n connections that will eventually be collated
  c.inPorts.add 'in',
    description: 'Objects to collate'
    datatype: 'object'
    addressable: true
  # We send the packets in collated order with groups to the output port
  c.outPorts.add 'out',
    description: 'Objects in collated order'
    datatype: 'object'

  c.forwardBrackets = {}

  c.process (input, output) ->
    # We want to have a list of fields to collate by
    return unless input.hasData 'ctlfields'
    # To be able to sort everything we must wait until we have all the data
    return unless input.attached('in').length
    indexesWithStreams = input.attached('in').filter (idx) ->
      input.hasStream ['in', idx]
    return unless indexesWithStreams.length is input.attached('in').length

    fields = input.getData 'ctlfields'
    if typeof fields is 'string'
      fields = fields.split ','

    # Receive the packets
    packets = []
    for idx in indexesWithStreams
      stream = input.getStream(['in', idx]).filter (ip) ->

        ip.type is 'data'
      packets = packets.concat stream
    # Sort them by control fields if there are any
    original = packets.slice 0
    packets.sort sortByControlFields.bind original, fields
    output.send
      out: new noflo.IP 'openBracket', null
    # Send them out
    sendWithGroups packets, fields, output
    # Send end-of-transmission
    output.send
      out: new noflo.IP 'closeBracket', null
    output.done()
