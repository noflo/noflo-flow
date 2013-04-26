noflo = require "noflo"
_s = require "underscore.string"
{ CacheStorage } = require "../lib/cache_storage"

class Cache extends noflo.Component

  description: _s.clean "save incoming IPs and send the saved IPs to
  port 'out' upon any data IP from 'ready'"

  constructor: ->
    @key = null
    @cache = new CacheStorage

    @inPorts =
      in: new noflo.Port
      ready: new noflo.Port
      key: new noflo.ArrayPort
      size: new noflo.Port
    @outPorts =
      out: new noflo.Port

    @inPorts.key.on "data", (@key) =>

    @inPorts.size.on "data", (size) =>
      @cache.size = size

    @inPorts.ready.on "data", (data) =>
      @cache.flushCache @outPorts.out, @key
      @outPorts.out.disconnect()
      delete @cache[@key]

    @inPorts.ready.on "disconnect", =>
      @key = null

    @inPorts.in.on "connect", =>
      @cache.connect(@key)

    @inPorts.in.on "begingroup", (group) =>
      @cache.beginGroup(group, @key)

    @inPorts.in.on "data", (data) =>
      @cache.data(data, @key)

    @inPorts.in.on "endgroup", (group) =>
      @cache.endGroup(group, @key)

    @inPorts.in.on "disconnect", =>
      @cache.disconnect(@key)
      @key = null

exports.getComponent = -> new Cache
