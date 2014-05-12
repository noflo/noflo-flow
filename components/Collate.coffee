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
    order = sort a.payload[field], b.payload[field]
    return order unless order is 0

  # All fields were the same, send in order of appearance
  if @indexOf(a) < @indexOf(b)
    return -1
  1

# Sending the collated objects to the output port together with bracket IPs
sendWithGroups = (packets, fields, port) ->
  previous = null
  for packet in packets

    # For the first packet send a bracket IP for each control field
    port.beginGroup field for field in fields unless previous

    # For subsequent packets send ending and opening brackets for fields that
    # are different
    if previous
      for field, idx in fields
        continue if packet.payload[field] is previous.payload[field]
        # Differing field found, close this bracket and all following ones
        differing = fields.slice idx
        port.endGroup() for f in differing
        port.beginGroup f for f in differing
        break

    # Send it out
    port.send packet.payload

    # Provide for comparison to the next one
    previous = packet

  # Last packet sent, send closing brackets
  port.endGroup() for field in fields
  # Send end-of-transmission
  port.disconnect()

exports.getComponent = ->
  c = new noflo.Component
  c.description = 'Collate two or more streams, based on
  a list of control field lengths'
  c.icon = 'sort-amount-asc'

  # Array holding out control fields
  fields = []

  # Inport for accepting a comma-separated list of control fields
  c.inPorts.add 'ctlfields',
    datatype: 'string'
    description: 'Comma-separated list of object keys to collate by'
    process: (event, payload) ->
      return unless event is 'data'
      fields = payload.split ','

  # Here we accept packets from 0-n connections that will eventually be collated
  c.inPorts.add 'in',
    description: 'Objects to collate'
    datatype: 'object'
    buffered: true
    process: (event) ->
      # To be able to sort everything we must wait until we have all the data
      return unless event is 'disconnect'
      # Make sure every upstream node has finished sending
      return if c.inPorts.in.isConnected()
      # Receive the packets
      packets = c.inPorts.in.buffer.filter (packet) -> packet.event is 'data'
      # Sort them by control fields if there are any
      original = packets.slice 0
      packets.sort sortByControlFields.bind original, fields
      # Send them out
      sendWithGroups packets, fields, c.outPorts.out
      # Prepare for the next set to collate
      c.inPorts.in.prepareBuffer()

  # We send the packets in collated order with groups to the output port
  c.outPorts.add 'out',
    description: 'Objects in collated order'
    datatype: 'object'

  c
