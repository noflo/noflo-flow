_ = require "underscore"

class CacheStorage
  constructor: ->
    # The size limit of the storage
    @size = +Infinity
    # The cache container
    @cache = {}
    # An array of stored cache by time of creation
    @journal = []

  connect: (key) ->
    @cache[key] =
      groupCache: {}
      dataCache: []
    @groups = []

  beginGroup: (group, key) ->
    { groupCache, dataCache } = @locate(key)

    groupCache[group] = {}
    dataCache[group] = []

    @groups.push(group)

  data: (data, key) ->
    { dataCache } = @locate(key)

    dataCache.push(data)

  endGroup: (group, key) ->
    @groups.pop()

  disconnect: (key) ->
    if key?
      @cache[key] = @locate(key)

      # Record the new cache and remove old if limit is reached
      @journal.push(key)
      @journal.unshift() if @journal.length > @size

  locate: (key) ->
    { groupCache, dataCache } = @cache[key] or
      throw new Error("No cache with key #{key} to locate")

    for group in @groups
      groupCache = groupCache[group]
      dataCache = dataCache[group]

    groupCache: groupCache
    dataCache: dataCache

  flushCache: (key, port) ->
    { groupCache, dataCache } = @cache[key] or
      throw new Error("No cache with key #{key} to flush")
    @flush(groupCache, dataCache, port)

  flush: (groupCache, dataCache, port) ->
    # Send out the data
    port.send(data) for data in dataCache

    # Just send the data out and call it a round without groups
    return if _.isEmpty(groupCache)

    # Go through everything
    for group in _.keys(groupCache)
      subGroupCache = groupCache[group]
      subDataCache = dataCache[group]

      port.beginGroup(group)
      @flush(subGroupCache, subDataCache, port)
      port.endGroup()

exports.CacheStorage = CacheStorage
