test = require "noflo-test"

test.component("flow/CountedMerge").
  discuss("provide a count").
  send.data("threshold", 3).
  discuss("provide some connections").
    send.connect("in").
      send.beginGroup("in", "a").
      send.data("in", "a").
      send.endGroup("in").
    send.disconnect("in").
    send.connect("in").
      send.beginGroup("in", "b").
      send.data("in", "b").
      send.endGroup("in").
    send.disconnect("in").
    send.connect("in").
      send.beginGroup("in", "c").
      send.data("in", "c").
      send.endGroup("in").
    send.disconnect("in").
    send.connect("in").
      send.beginGroup("in", "d").
      send.data("in", "d").
      send.endGroup("in").
    send.disconnect("in").
  discuss("all packets in the first three connections are merged").
    receive.connect("out").
      receive.beginGroup("out", "a").
      receive.data("out", "a").
      receive.endGroup("out").
      receive.beginGroup("out", "b").
      receive.data("out", "b").
      receive.endGroup("out").
      receive.beginGroup("out", "c").
      receive.data("out", "c").
      receive.endGroup("out").
    receive.disconnect("out").

export module
