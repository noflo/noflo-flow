noflo = require "noflo"
_ = require "underscore"

class Fork extends noflo.Component

  description: "Send the port number to 'PORT' to set where to direct IPs. It
  acts as a 'Split' by default, sending IPs to every out-port."

  constructor: ->
    @indexes = []

    @inPorts =
      in: new noflo.Port 'all'
      port: new noflo.Port 'number'
    @outPorts =
      out: new noflo.ArrayPort 'all'

    @inPorts.port.on "connect", =>
      @indexes = []

    @inPorts.port.on "data", (index) =>
      index = parseInt index
      @indexes.push index if _.isNumber(index) and not isNaN(index)

    @inPorts.in.on "begingroup", (group) =>
      if @indexes.length > 0
        for index in @indexes
          @outPorts.out.beginGroup group, index
      else
        @outPorts.out.beginGroup group

    @inPorts.in.on "data", (data) =>
      if @indexes.length > 0
        for index in @indexes
          @outPorts.out.send data, index
      else
        @outPorts.out.send data

    @inPorts.in.on "endgroup", (group) =>
      if @indexes.length > 0
        for index in @indexes
          @outPorts.out.endGroup index
      else
        @outPorts.out.endGroup()

    @inPorts.in.on "disconnect", =>
      @outPorts.out.disconnect()

exports.getComponent = -> new Fork
