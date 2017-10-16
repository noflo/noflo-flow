noflo = require "noflo"

exports.getComponent = ->
  c = new noflo.Component
  c.description = "Like 'core/Merge', but merge up to a specified
  number of streams."
  c.inPorts.add 'in',
    datatype: 'all'
    description: 'IP to merge'
  c.inPorts.add 'threshold',
    datatype: 'int'
    control: true
    default: 1
  c.outPorts.add 'out',
    datatype: 'all'

  c.received = 0
  c.tearDown = (callback) ->
    c.received = 0
    do callback

  c.forwardBrackets = {}

  c.process (input, output) ->
    return unless input.hasStream 'in'
    return if input.attached('threshold') and not input.hasData 'threshold'
    if input.hasData 'threshold'
      threshold = input.getData 'threshold'
    else
      threshold = 1
    packets = input.getStream 'in'
    if c.received < threshold
      # We can still send
      for packet in packets
        output.send
          out: packet
    else
      # Over threshold, drop packets
      packet.drop() for packet in packets
    c.received++
    output.done()
