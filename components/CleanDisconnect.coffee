noflo = require "noflo"

exports.getComponent = ->
  c = new noflo.Component
  c.description = "when several streams are nested through the array
  in-port (i.e. a connect through one of the ports before there is a
  disconnect), separate the streams into distinct streams with no
  overlapping"
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
    return unless indexesWithStreams.length
    indexesWithStreams.forEach (idx) ->
      stream = input.getStream ['in', idx]
      for packet in stream
        packet.index = idx
        output.send
          out: packet
    output.done()
