_ = require "underscore"

class CacheStorage
  constructor: ->
    # The size limit of the storage
    @size = Infinity
    # The cache container
    @cache = {}
    # An array of stored cache by time of creation
    @journal = []

  connect: (key = null) ->
    key = @encode key
    @cache[key] =
      groupCache: {}
      dataCache: []
    @groups = []

  beginGroup: (group, key = null) ->
    group = @encode group
    key = @encode key
    { groupCache, dataCache } = @locate key

    groupCache[group] = {}
    dataCache[group] = []

    @groups.push group

  send: (data, key = null) ->
    key = @encode key
    { dataCache } = @locate key

    dataCache.push data

  endGroup: (key = null) ->
    key = @encode key
    @groups.pop()

  disconnect: (key = null) ->
    key = @encode key
    if key?
      @cache[key] = @locate key

      # Record the new cache and remove old if limit is reached
      @journal.push key
      @journal.unshift() if @journal.length > @size

  encode: (x) -> if x? then "__cache__#{x}" else x
  decode: (x) -> if x? then x.replace /^__cache__/, "" else x

  locate: (key = null) ->
    { groupCache, dataCache } = @cache[key] or
      throw new Error("No cache with key #{key} to locate")

    for group in @groups
      groupCache = groupCache[group]
      dataCache = dataCache[group]

    groupCache: groupCache
    dataCache: dataCache

  reset: (key = null) ->
    key = @encode key
    if key?
      delete @cache[key]
    else
      @cache = {}

  # Get all the saved caches' keys
  getCacheKeys: ->
    _.keys @cache

  # Does the cache exist?
  isCacheValid: (key = null) ->
    key = @encode key
    not _.isEmpty @cache[key]

  # Flush given a NoFlo port, a key of a particular cache object, and the index
  # of the port to send
  flushCache: (port, key = null, index = null) ->
    key = @encode key
    return false unless @cache[key]?
    { groupCache, dataCache } = @cache[key]
    @flush port, index, groupCache, dataCache
    true

  # Flush all cache objects
  flushAll: (port, index) ->
    for key, cache of @cache
      { groupCache, dataCache } = cache
      @flush port, index, groupCache, dataCache
    true

  flush: (port, index, groupCache, dataCache) ->
    # Send out the data
    for data in dataCache
      port.send data, index

    # Just send the data out and call it a round without groups
    return if _.isEmpty groupCache

    # Go through everything
    for group in _.keys groupCache
      subGroupCache = groupCache[group]
      subDataCache = dataCache[group]

      group = @decode group
      port.beginGroup group, index
      @flush port, index, subGroupCache, subDataCache
      port.endGroup index

exports.CacheStorage = CacheStorage
