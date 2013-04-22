test = require "noflo-test"

test.component("flow/CountDown").
  discuss("set a number to count down from").
    send.data("count", 2).
  discuss("each disconnect is counted").
    send.connect("in").
    send.disconnect("in").
    send.connect("in").
    send.disconnect("in").
  discuss("an empty IPs is emitted").
    receive.data("out", null).
    receive.disconnect("out").
  # TODO: test second round when cross-receive issue has been fixed at
  # https://github.com/bergie/noflo-test/issues/3
  # discuss("trigger it again").
  #   send.connect("in").
  #   send.disconnect("in").
  #   send.connect("in").
  #   send.disconnect("in").
  # discuss("another empty IPs is emitted").
  #   receive.data("out", null).
  #   receive.disconnect("out").

  next().
  discuss("do not repeat the count once we've reached 0").
    send.data("repeat", false).
  discuss("set a number to count down from").
    send.data("count", 2).
  discuss("each disconnect is counted").
    send.connect("in").
    send.disconnect("in").
    send.connect("in").
    send.disconnect("in").
    send.connect("in").
    send.disconnect("in").
    send.connect("in").
    send.disconnect("in").
  discuss("only one empty IP is emitted").
    receive.data("out", null).
    receive.disconnect("out").

export module
