noflo = require "noflo"

exports.getComponent = ->
  c = new noflo.Component
  c.description = "count down from particular number, by default 1, and
    send an empty IP when it hits 0"
  c.inPorts.add 'in',
    datatype: 'bang'
    description: 'IPs to decrease the count down'
  c.inPorts.add 'count',
    datatype: 'int'
    description: 'Count down starting number'
    default: 1
    control: true
  c.inPorts.add 'repeat',
    datatype: 'boolean'
    description: 'Repeat the count down mechanism if true'
    default: true
    control: true
  c.outPorts.add 'out',
    datatype: 'bang'
    description: 'IP emitted when the count reach 0'
  c.outPorts.add 'count',
    datatype: 'int'
    description: 'Number of packets received in this cycle'
  c.received = 0
  c.tearDown = (callback) ->
    c.received = 0
    do callback
  c.process (input, output) ->
    return unless input.hasData 'in'
    return if input.attached('count') and not input.hasData 'count'
    return if input.attached('repeat') and not input.hasData 'repeat'
    if input.hasData 'count'
      count = input.getData 'count'
    else
      count = 1
    if input.hasData 'repeat'
      repeat = input.getData 'repeat'
    else
      repeat = true
    input.getData 'in'
    c.received++
    output.send
      count: c.received
    if c.received is count
      output.send
        out: new noflo.IP 'data', null
      c.received = 0 if repeat
    output.done()
