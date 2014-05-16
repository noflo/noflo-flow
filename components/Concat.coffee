noflo = require 'noflo'

class Concat extends noflo.Component
  description: 'Gathers data from all incoming connections and sends
  them together in order of connection'
  constructor: ->
    @mapping = []
    @buffers = []
    @connections = 0

    @inPorts = new noflo.InPorts
      in:
        datatype: 'all'
        addressable: true
    @outPorts = new noflo.OutPorts
      out:
        datatype: 'all'

    subscribed = false
    @connections = 0
    @inPorts.in.on 'connect', (socket, index) =>
      @mapping[index] = @connections
      @buffers[@mapping[index]] = [] unless @buffers[@mapping[index]]
      @connections++
    @inPorts.in.on 'begingroup', (group) =>
      @outPorts.out.beginGroup group
    @inPorts.in.on 'data', (data, index) =>
      @buffers[@mapping[index]].push data
      @sendIfPossible()
    @inPorts.in.on 'endgroup', =>
      @outPorts.out.endGroup()
    @inPorts.in.on 'disconnect', =>
      @connections--
      @sendIfPossible()
      @clearBuffers() if @connections is 0

  clearBuffers: ->
    @buffers = []
    @mapping = []
    @connections = 0
    @outPorts.out.disconnect()

  sendIfPossible: ->
    nbSend = -1
    for buffer in @buffers
      nbSend = buffer.length if nbSend < 0
      nbSend = Math.min buffer.length, nbSend
    console.log "buffers=#{@buffers.length} send=#{nbSend}"

    i = 0
    while i < nbSend
      for buffer in @buffers
        @outPorts.out.send buffer.shift()
      i++

exports.getComponent = -> new Concat
