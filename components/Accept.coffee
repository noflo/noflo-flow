noflo = require "noflo"

exports.getComponent = ->
  c = new noflo.Component
  c.description = 'accept and forward certain incoming packets'
  c.inPorts.add 'in',
    datatype: 'all'
    description: 'An IP to be forwarded if accepted'
  c.inPorts.add 'accept',
    datatype: 'all'
    description: 'IP to be accepted'
  c.inPorts.add 'reset',
    datatype: 'bang'
    description: 'Reset the list accepted IP'
  c.outPorts.add 'out',
    datatype: 'all'
  c.accepts = {}
  c.tearDown = (callback) ->
    c.accepts = {}
    do callback
  c.process (input, output) ->
    if input.hasData 'accept'
      accept = input.getData 'accept'
      c.accepts[input.scope] = [] unless c.accepts[input.scope]
      c.accepts[input.scope].push accept
      output.done()
      return
    if input.hasData 'reset'
      input.getData 'reset'
      c.accepts = {}
      output.done()
      return
    return unless input.hasData 'in'
    data = input.getData 'in'
    if c.accepts[input.scope].indexOf(data) is -1
      output.done()
      return
    output.sendDone
      out: data
