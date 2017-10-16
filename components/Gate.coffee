noflo = require 'noflo'

exports.getComponent = ->
  c = new noflo.Component
  c.description = 'Forward packets only when the gate is open'
  c.icon = 'pause'
  c.inPorts.add 'in',
    datatype: 'all'
  c.inPorts.add 'open',
    datatype: 'bang'
    description: 'Send one IP to open the gate'
  c.inPorts.add 'close',
    datatype: 'bang'
    description: 'Send one IP to close the gate'
  c.outPorts.add 'out',
    datatype: 'all'
  c.isOpen = false
  c.tearDown = (callback) ->
    c.isOpen = false
    c.icon = 'pause'
    do callback
  c.forwardBrackets = {}
  c.process (input, output) ->
    if input.hasData 'open'
      input.getData 'open'
      c.isOpen = true
      c.setIcon 'play'
      output.done()
      return
    if input.hasData 'close'
      input.getData 'close'
      c.isOpen = false
      c.setIcon 'pause'
      output.done()
      return
    return unless input.has 'in'
    packet = input.get 'in'
    unless c.isOpen
      packet.drop()
      output.done()
      return
    output.sendDone
      out: packet
