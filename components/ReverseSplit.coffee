noflo = require "noflo"

exports.getComponent = ->
  c = new noflo.Component
  c.icon = 'expand'
  c.description = "Like core/Split, expect the last port gets forwarded
   packets first"
  c.inPorts.add 'in',
    datatype: 'all'
  c.outPorts.add 'out',
    datatype: 'all'
    addressable: true
  c.forwardBrackets = {}
  c.process (input, output) ->
    return unless input.has 'in'
    packet = input.get 'in'
    attached = c.outPorts.out.listAttached()
    attached.reverse()
    for idx in attached
      output.send
        out: new noflo.IP packet.type, packet.data,
          index: idx
          datatype: packet.datatype
          schema: packet.schema
          clonable: packet.clonable
    output.done()
