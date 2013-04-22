noflo = require("noflo")
_ = require("underscore")
_s = require("underscore.string")

class Cache extends noflo.Component

  description: _s.clean "save incoming IPs and send the saved IPs to
  port 'out' upon any data IP from 'ready'"

  constructor: ->
    @size = +Infinity
    @cache = {}
    @journal = []

    @inPorts =
      in: new noflo.Port
      ready: new noflo.Port
      key: new noflo.Port
      size: new noflo.Port
    @outPorts =
      out: new noflo.Port

    @inPorts.key.on "data", (@key) =>

    @inPorts.size.on "data", (@size) =>

    @inPorts.ready.on "data", (@key) =>
      if @key? and @cache[@key]?
        @groupCache = @cache[@key].groups
        @dataCache = @cache[@key].data

    @inPorts.ready.on "disconnect", =>
      @emitCache(@groupCache, @dataCache)
      @outPorts.out.disconnect()

      # Remove cache
      delete @cache[@key]
      @key = null

    @inPorts.in.on "connect", =>
      @groups = []
      @groupCache = {}
      @dataCache = []

    @inPorts.in.on "begingroup", (group) =>
      { groupCache, dataCache } = @locate()

      groupCache[group] = {}
      dataCache[group] = []

      @groups.push(group)

    @inPorts.in.on "data", (data) =>
      { dataCache } = @locate()

      dataCache.push(data)

    @inPorts.in.on "endgroup", (group) =>
      @groups.pop()

    @inPorts.in.on "disconnect", =>
      if @key?
        @cache[@key] =
          groups: @groupCache
          data: @dataCache

        # Record the new cache and remove old if limit is reached
        @journal.push(@key)
        @journal.unshift() if @journal.length > @size
        @key = null

  locate: ->
    groupCache = @groupCache
    dataCache = @dataCache

    for group in @groups
      groupCache = groupCache[group]
      dataCache = dataCache[group]

    groupCache: groupCache
    dataCache: dataCache

  emitCache: (groupCache, dataCache) ->
    # Send out the data
    @outPorts.out.send(data) for data in dataCache

    # Just send the data out and call it a round without groups
    return if _.isEmpty(groupCache)

    # Go through everything
    for group in _.keys(groupCache)
      subGroupCache = groupCache[group]
      subDataCache = dataCache[group]

      @outPorts.out.beginGroup(group)
      @emitCache(subGroupCache, subDataCache)
      @outPorts.out.endGroup()

exports.getComponent = -> new Cache
