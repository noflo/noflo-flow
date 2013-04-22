test = require "noflo-test"

test.component("flow/IsEmpty").
  discuss("send an empty array").
    send.data("in", []).
  discuss("the 'yes' port receives it").
    receive.data("yes", []).

  next().
  discuss("send a filled empty").
    send.data("in", [1, 2, 3]).
  discuss("the 'no' port receives it").
    receive.data("no", [1, 2, 3]).

export module
