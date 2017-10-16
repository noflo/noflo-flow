noflo = require 'noflo'

exports.getComponent = ->
  c = new noflo.Component
  c.description = 'Throttle packets based on load and maximum accepted load'
  c.inPorts.add 'in',
    datatype: 'all'
    description: 'IPs to forward'
  c.inPorts.add 'load',
    datatype: 'int'
    description: 'Current load'
  c.inPorts.add 'max',
    datatype: 'int'
    control: true
    description: 'Maximum number to allow for load'
  c.outPorts.add 'out',
    datatype: 'all'
  c.process (input, output) ->
    return unless input.hasData 'in', 'load', 'max'
    [load, max] = input.getData 'load', 'max'
    unless load < max
      # Waiting for load to decrease
      # FIXME: Workaround for https://github.com/noflo/noflo/issues/558
      setTimeout ->
        output.done()
      , 1
      return
    # Release one packet at a time
    data = input.getData 'in'
    # FIXME: Workaround for https://github.com/noflo/noflo/issues/558
    setTimeout ->
      output.sendDone
        out: data
    , 1
