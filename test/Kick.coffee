test = require "noflo-test"

test.component("flow/Kick").
  discuss("without specified data").
    send.connect('in').
    send.data('in', 1).
    send.disconnect('in').
  discuss("a null should be sent").
    receive.connect('out').
    receive.data('out', null).
    receive.disconnect('out').

export module
