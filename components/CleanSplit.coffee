noflo = require "noflo"

exports.getComponent = ->
  c = new noflo.Component
  c.icon = 'expand'
  c.description = 'Like core/Split, but only begins sending at end of a stream'
  c.inPorts.add 'in',
    datatype: 'all'
  c.outPorts.add 'out',
    datatype: 'all'
  c.forwardBrackets = {}
  c.process (input, output) ->
    return unless input.hasStream 'in'
    stream = input.getStream 'in'
    for packet in stream
      output.send
        out: packet
    output.done()
