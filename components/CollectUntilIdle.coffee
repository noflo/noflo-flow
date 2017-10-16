noflo = require 'noflo'

exports.getComponent = ->
  c = new noflo.Component
  c.description = 'Collect packets and send them when input stops after a given
  timeout'
  c.inPorts.add 'in',
    datatype: 'all'
    description: 'IPs to collect until a timeout'
  c.inPorts.add 'timeout',
    datatype: 'number'
    description: 'Amount of time to hold IPs for in milliseconds'
    default: 300
    control: true
  c.outPorts.add 'out',
    datatype: 'all'
    description: 'IPs collected until the timeout'
  c.timeout = null
  clear = ->
    return unless c.timeout
    clearTimeout c.timeout.timeout
    c.timeout.ctx.deactivate()
  c.tearDown = (callback) ->
    do clear
    do callback
  c.process (input, output, context) ->
    return unless input.hasData 'in'
    return if input.attached('timeout') and not input.hasData('timeout')
    if input.hasData 'timeout'
      timeout = parseInt input.getData 'timeout'
    else
      timeout = 300

    do clear

    c.timeout =
      ctx: context
      timeout: setTimeout ->
        while input.hasData 'in'
          packet = input.getData 'in'
          output.send
            out: packet
        output.done()
      , timeout
