noflo = require "noflo"

exports.getComponent = ->
  c = new noflo.Component
  c.description = 'deny certain incoming packets'
  c.inPorts.add 'in',
    datatype: 'all'
    description: 'An IP to be forwarded if accepted'
  c.inPorts.add 'deny',
    datatype: 'all'
    description: 'IP to be denied'
  c.inPorts.add 'reset',
    datatype: 'bang'
    description: 'Reset the list denied IPs'
  c.outPorts.add 'out',
    datatype: 'all'
  c.denied = {}
  c.tearDown = (callback) ->
    c.denied = {}
    do callback
  c.process (input, output) ->
    if input.hasData 'deny'
      deny = input.getData 'deny'
      c.denied[input.scope] = [] unless c.denied[input.scope]
      c.denied[input.scope].push deny
      output.done()
      return
    if input.hasData 'reset'
      input.getData 'reset'
      c.denied = {}
      output.done()
      return
    return unless input.hasData 'in'
    data = input.getData 'in'
    if c.denied[input.scope].indexOf(data) isnt -1
      output.done()
      return
    output.sendDone
      out: data
