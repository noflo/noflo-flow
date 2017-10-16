noflo = require "noflo"

exports.getComponent = ->
  c = new noflo.Component
  c.description = "Stop everything that's received and send out once we're
  told that we're ready to send."
  c.inPorts.add 'in',
    datatype: 'all'
    description: 'IPs to buffer until an IP arrives on the ready port'
  c.inPorts.add 'ready',
    datatype: 'bang'
    description: 'Trigger the emission of all the stored IPs'
  c.outPorts.add 'out',
    datatype: 'all'
    description: 'IPs forwarded from the in port'
  c.forwardBracets = {}
  c.process (input, output) ->
    return unless input.hasData 'ready', 'in'
    input.getData 'ready'
    packets = []
    while input.has 'in'
      packets.push input.get 'in'
    for packet in packets
      output.send
        out: packet
    output.done()
