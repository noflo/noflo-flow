noflo = require "noflo"
{ CacheStorage } = require "nohoarder"

# @runtime noflo-nodejs

class CountedMerge extends noflo.Component

  description: "Like the normal 'Merge', but merge up to a specified
  number of connections."

  constructor: ->
    @count = 0
    @threshold = 1
    @cache = new CacheStorage

    @inPorts = new noflo.InPorts
      in:
        datatype: 'all'
        description: 'IP to merge'
      threshold:
        datatype: 'number'
    @outPorts = new noflo.OutPorts
      out:
        datatype: 'all'

    @inPorts.threshold.on "data", (@threshold) =>

    @inPorts.in.on "connect", =>
      @count++
      @cache.connect @count

    @inPorts.in.on "begingroup", (group) =>
      @cache.beginGroup group, @count

    @inPorts.in.on "data", (data) =>
      @cache.send data, @count

    @inPorts.in.on "endgroup", (group) =>
      @cache.endGroup @count

    @inPorts.in.on "disconnect", =>
      @cache.disconnect @count if @count > 0

      if @count >= @threshold
        @cache.flushCache @outPorts.out, key for key in [1..@count]
        @outPorts.out.disconnect()
        @count = 0

exports.getComponent = -> new CountedMerge
