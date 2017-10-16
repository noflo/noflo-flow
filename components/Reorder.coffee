noflo = require "noflo"

exports.getComponent = ->
  c = new noflo.Component
  c.description = "Send packets in to outport indexes in reverse order
   when matching number of inport indexes have received data to attached
   outports"
  c.inPorts.add 'in',
    datatype: 'all'
    addressable: true
  c.outPorts.add 'out',
    datatype: 'all'
    addressable: true
  c.forwardBrackets = {}
  c.process (input, output) ->
    indexesWithStreams = input.attached('in').filter (idx) ->
      input.hasStream ['in', idx]
    attached = c.outPorts.out.listAttached().slice 0
    expectedStreams = attached.length
    if input.attached('in').length < attached.length
      # Fewer attached inputs than outputs, use their number
      expectedStreams = input.attached('in').length
      attached = attached.slice 0, expectedStreams
    return if indexesWithStreams.length < expectedStreams
    streams = []
    for idx in indexesWithStreams
      streams.push input.getStream ['in', idx]
    streams.reverse()
    attached.reverse()
    for outIdx in attached
      continue unless streams.length
      stream = streams.shift()
      for packet in stream
        output.send new noflo.IP packet.type, packet.data,
          index: outIdx
          datatype: packet.datatype
          schema: packet.schema
          clonable: packet.clonable
    output.done()
