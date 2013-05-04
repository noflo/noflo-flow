noflo = require "noflo"
_ = require "underscore"
_s = require "underscore.string"
{ CacheStorage } = require "../lib/cache_storage"

class Split extends noflo.Component

  description: _s.clean "Like the generic split, except this splits the
  incoming connection one by one to each port, so a connection must disconnect
  first before the next port receives the connection. Think of it as
  serializing splits."

  constructor: ->
    @cache = new CacheStorage

    @inPorts =
      in: new noflo.Port
    @outPorts =
      out: new noflo.ArrayPort

    @inPorts.in.on "connect", =>
      @cache.connect()

    @inPorts.in.on "begingroup", (group) =>
      @cache.beginGroup(group)

    @inPorts.in.on "data", (data) =>
      @cache.data(data)

    @inPorts.in.on "endgroup", (group) =>
      @cache.endGroup()

    @inPorts.in.on "disconnect", =>
      @flush()
      @cache.disconnect()

  flush: ->
    for index in [0...@outPorts.out.sockets.length]
      @cache.flushCache @outPorts.out, null, index
      @outPorts.out.disconnect index
    @cache.reset()

exports.getComponent = -> new Split
