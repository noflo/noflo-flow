noflo = require "noflo"
{ CacheStorage } = require "nohoarder"

# @runtime noflo-nodejs

class Stop extends noflo.Component

  description: "Stop everything that's received and send out once we're
  told that we're ready to send."

  constructor: ->
    @count = 0
    @cache = new CacheStorage

    @inPorts = new noflo.InPorts
      in:
        datatype: 'all'
        description: 'IPs to buffer until an IP arrives on the ready port'
      ready:
        datatype: 'bang'
        description: 'Trigger the emission of all the stored IPs'
    @outPorts = new noflo.OutPorts
      out:
        datatype: 'all'
        description: 'IPs forwarded from the in port'

    @inPorts.ready.on "disconnect", =>
      @cache.flushCache @outPorts.out, key for key in [0...@count]
      @outPorts.out.disconnect()
      @count = 0

    @inPorts.in.on "connect", =>
      @cache.connect @count

    @inPorts.in.on "begingroup", (group) =>
      @cache.beginGroup group, @count

    @inPorts.in.on "data", (data) =>
      @cache.send data, @count

    @inPorts.in.on "endgroup", (group) =>
      @cache.endGroup @count

    @inPorts.in.on "disconnect", =>
      @cache.disconnect @count
      @count++

exports.getComponent = -> new Stop
