noflo = require "noflo"
_ = require "underscore"

class Fork extends noflo.Component

  description: "Send the port number to 'PORT' to set where to direct IPs. It
  acts as a 'Split' by default, sending IPs to every out-port."

  constructor: ->
    @indexes = []

    @inPorts = new noflo.InPorts
      in:
        datatype: 'all'
        description: 'IPs to forward'
      port:
        datatype: 'number'
        description: 'Number of ports to forward IPs to'
    @outPorts = new noflo.OutPorts
      out:
        datatype: 'all'
        addressable: true

    @inPorts.port.on "connect", =>
      @indexes = []

    @inPorts.port.on "data", (index) =>
      index = parseInt index
      @indexes.push index if _.isNumber(index) and not isNaN(index)

    @inPorts.port.on "disconnect", =>
      # De-duplicate
      @indexes = _.uniq @indexes

    @inPorts.in.on "begingroup", (group) =>
      if @indexes.length > 0
        for index in @indexes
          @outPorts.out.beginGroup group, index
      else
        for index in @outPorts.out.listAttached()
          @outPorts.out.beginGroup group, idx

    @inPorts.in.on "data", (data) =>
      if @indexes.length > 0
        for index in @indexes
          @outPorts.out.send data, index
      else
        for index in @outPorts.out.listAttached()
          @outPorts.out.send data, index

    @inPorts.in.on "endgroup", (group) =>
      if @indexes.length > 0
        for index in @indexes
          @outPorts.out.endGroup index
      else
        for index in @outPorts.out.listAttached()
          @outPorts.out.endGroup index

    @inPorts.in.on "disconnect", =>
      if @indexes.length > 0
        for index in @indexes
          @outPorts.out.disconnect index
      else
        for index in @outPorts.out.listAttached()
          @outPorts.out.disconnect index

exports.getComponent = -> new Fork
