test = require "noflo-test"

test.component("flow/Cache").
  discuss("cache somethings").
    send.connect("in").
      send.beginGroup("in", "a").
        send.data("in", "b").
        send.beginGroup("in", "c").
          send.data("in", "d").
        send.endGroup("in").
      send.endGroup("in").
      send.beginGroup("in", "e").
        send.data("in", "f").
      send.endGroup("in").
    send.disconnect("in").
  discuss("signal the cache to be released").
    send.connect("ready").
      send.data("ready", null).
    send.disconnect("ready").
  discuss("get back the cache").
    receive.connect("out").
      receive.beginGroup("out", "a").
        receive.data("out", "b").
        receive.beginGroup("out", "c").
          receive.data("out", "d").
        receive.endGroup("out").
      receive.endGroup("out").
      receive.beginGroup("out", "e").
        receive.data("out", "f").
      receive.endGroup("out").
    receive.disconnect("out").

export module
