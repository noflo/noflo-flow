noflo = require "noflo"

exports.getComponent = ->
  c = new noflo.Component
  c.description = "Send the port number to 'PORT' to set where to direct IPs. It
  acts as a 'Split' by default, sending IPs to every out-port."
  c.inPorts.add 'in',
    datatype: 'all'
    description: 'IPs to forward'
  c.inPorts.add 'port',
    datatype: 'number'
    description: 'Number of ports to forward IPs to'
  c.outPorts.add 'out',
    datatype: 'all'
    addressable: true
  c.indexes = []
  c.tearDown = (callback) ->
    c.indexes = []
    do callback
  c.process (input, output) ->
    if input.hasStream 'port'
      # New set of port indexes to work with
      ports = input.getStream('port').filter (ip) -> ip.type is 'data'
      c.indexes = []
      for port in ports
        index = parseInt port.data
        continue if c.indexes.indexOf(index) isnt -1
        c.indexes.push index
      output.done()
      return
    return unless input.hasData 'in'
    data = input.getData 'in'
    if c.indexes.length is 0
      indexes = c.outPorts.out.listAttached()
    else
      indexes = c.indexes.slice 0
    for idx in indexes
      output.send
        out: new noflo.IP 'data', data,
          index: idx
    output.done()
