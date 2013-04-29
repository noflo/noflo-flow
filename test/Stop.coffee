test = require "noflo-test"

test.component("flow/Stop").
  discuss("pass in whatever").
    send.connect("in").
    send.data("in", 1).
    send.disconnect("in").
    send.connect("in").
    send.data("in", 2).
    send.disconnect("in").
    send.connect("in").
    send.data("in", 3).
    send.disconnect("in").
  discuss("we're ready").
    send.connect("ready").
    send.disconnect("ready").
  discuss("pass everything in one go").
    receive.connect("out").
    receive.data("out", 1).
    receive.data("out", 2).
    receive.data("out", 3).
    receive.disconnect("out").

export module
