noflo = require 'noflo'

class CollectUntilIdle extends noflo.Component
  description: 'Collect packets and send them when input stops after a given
  timeout'

  constructor: ->
    @milliseconds = 500
    @data = []
    @groups = []
    @timeout = null

    @inPorts = new noflo.InPorts
      in:
        datatype: 'all'
        description: 'IPs to collect until a timeout'
      timeout:
        datatype: 'number'
        description: 'Amount of time to hold IPs for in milliseconds'
    @outPorts = new noflo.OutPorts
      out:
        datatype: 'all'
        description: 'IPs collected until the timeout'

    @inPorts.timeout.on 'data', (data) =>
      @milliseconds = parseInt data

    @inPorts.in.on 'connect', =>
      @outPorts.out.connect()

    @inPorts.in.on 'begingroup', (group) =>
      @groups.push group

    @inPorts.in.on 'data', (data) =>
      @data.push
        data: data
        groups: @groups.slice 0
      do @refresh

    @inPorts.in.on 'endgroup', =>
      @groups.pop()

    @inPorts.in.on 'disconnect', =>
      do @refresh

  refresh: ->
    clearTimeout @timeout if @timeout
    @timeout = setTimeout =>
      do @send
    , @milliseconds

  send: ->
    @sendData data for data in @data
    @outPorts.out.disconnect()

  sendData: (data) ->
    for group in data.groups
      @outPorts.out.beginGroup group
    @outPorts.out.send data.data
    for group in data.groups
      @outPorts.out.endGroup()

exports.getComponent = -> new CollectUntilIdle
