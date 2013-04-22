test = require "noflo-test"

test.component("flow/HasGroup").
  discuss("pass in an exact match").
    send.data("group", "match").
  discuss("pass in a matching group").
    send.connect("in").
      send.beginGroup("in", "match").
        send.data("in", "a").
      send.endGroup("in").
    send.disconnect("in").
  discuss("get the match").
    receive.data("yes", "a").

  next().
  discuss("pass in an exact match").
    send.data("group", "match").
  discuss("pass in a non-matching group").
    send.connect("in").
      send.beginGroup("in", "not a match").
        send.data("in", "b").
      send.endGroup("in").
    send.disconnect("in").
  discuss("get the non-match").
    receive.data("no", "b").

  next().
  discuss("pass in a regexp match").
    send.data("regexp", "reg.*").
  discuss("pass in a matching group").
    send.connect("in").
      send.beginGroup("in", "a regexp match").
        send.data("in", "c").
      send.endGroup("in").
    send.disconnect("in").
  discuss("get the match").
    receive.data("yes", "c").

export module
