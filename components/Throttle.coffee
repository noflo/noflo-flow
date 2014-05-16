noflo = require 'noflo'

class Throttle extends noflo.Component
  description: 'Throttle packets based on load and maximum accepted load'

  constructor: ->
    @inPorts = new noflo.InPorts
      in:
        datatype: 'all'
        description: 'IPs to forward'
      load:
        datatype: 'int'
      max:
        datatype: 'int'
    @outPorts = new noflo.OutPorts
      out:
        datatype: 'all'

    @q = []
    @groups = []
    @load = 0
    @max = 10

    @inPorts.load.on 'data', (data) =>
      @load = data
      @process()

    @inPorts.max.on 'data', (data) =>
      @max = parseInt data
      @process()

    @inPorts.in.on 'begingroup', (group) =>
      @groups.push group
    @inPorts.in.on 'data', (data) =>
      @push 'data', data
    @inPorts.in.on 'endgroup', =>
      @groups.pop()
    @inPorts.in.on 'disconnect', =>
      @push 'disconnect'

  push: (eventname, data) ->
    @q.push
      name: eventname
      data: data
      groups: @groups.slice 0
    @process()

  process: ->
    sent = 0
    while @q.length > 0 and @load < @max
      return if sent >= @max
      event = @q.shift()
      switch event.name
        when 'data'
          for group in event.groups
            @outPorts.out.beginGroup group
          @outPorts.out.send event.data
          for group in event.groups
            @outPorts.out.endGroup()
        when 'disconnect' then @outPorts.out.disconnect()
      sent++

exports.getComponent = -> new Throttle
