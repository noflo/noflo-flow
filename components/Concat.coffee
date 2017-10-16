noflo = require 'noflo'

exports.getComponent = ->
  c = new noflo.Component
  c.description = 'Gathers data from all incoming connections and sends
  them together in order of connection'
  c.inPorts.add 'in',
    datatype: 'all'
    addressable: true
  c.outPorts.add 'out',
    datatype: 'all'
  c.process (input, output) ->
    indexesWithStreams = input.attached('in').filter (idx) ->
      input.hasStream ['in', idx]
    return unless indexesWithStreams.length is input.attached('in').length
    for idx in indexesWithStreams
      stream = input.getStream ['in', idx]
      for packet in stream
        packet.index = idx
        output.send
          out: packet
    output.done()
