noflo = require 'noflo'

class Gate extends noflo.Component
  description: 'This component forwards received packets when the gate is open'
  icon: 'pause'

  constructor: ->
    @open = false

    @inPorts = new noflo.InPorts
      in:
        datatype: 'all'
      open:
        datatype: 'bang'
        description: 'Send one IP to open the gate'
      close:
        datatype: 'bang'
        description: 'Send one IP to close the gate'
    @outPorts = new noflo.OutPorts
      out:
        datatype: 'all'

    @inPorts.in.on 'connect', =>
      return unless @open
      @outPorts.out.connect()
    @inPorts.in.on 'begingroup', (group) =>
      return unless @open
      @outPorts.out.beginGroup group
    @inPorts.in.on 'data', (data) =>
      return unless @open
      @outPorts.out.send data
    @inPorts.in.on 'endgroup', =>
      return unless @open
      @outPorts.out.endGroup()
    @inPorts.in.on 'disconnect', =>
      return unless @open
      @outPorts.out.disconnect()

    @inPorts.open.on 'data', =>
      @open = true
      @setIcon 'play'
    @inPorts.close.on 'data', =>
      @open = false
      @outPorts.out.disconnect()
      @setIcon 'pause'

exports.getComponent = -> new Gate
