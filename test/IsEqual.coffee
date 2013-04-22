test = require "noflo-test"

test.component("flow/IsEqual").
  discuss("'left' and 'right' are equal").
    send.data("left", [1, 2, 3]).
    send.disconnect("left").
    send.data("right", [1, 2, 3]).
    send.disconnect("right").
  discuss("forward to 'right' to 'yes'").
    receive.data("yes", [1, 2, 3]).

  next().
  discuss("'left' and 'right' are not equal").
    send.data("left", [1, 2, 3]).
    send.disconnect("left").
    send.data("right", [2, 3, 4]).
    send.disconnect("right").
  discuss("forward to 'right' to 'no'").
    receive.data("no", [2, 3, 4]).

export module
