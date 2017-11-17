noflo = require 'noflo'

prepareScope = ->
  data =
    resolved: false
    rejected: false
  return data

exports.getComponent = ->
  c = new noflo.Component
  c.description = 'Like Promise.all, wait for result from all connected inputs
   and send them or an error out'
  c.icon = 'compress'
  c.inPorts.add 'in',
    datatype: 'all'
    addressable: true
  c.inPorts.add 'error',
    datatype: 'object'
  c.outPorts.add 'out',
    datatype: 'array'
  c.outPorts.add 'error',
    datatype: 'object'
  c.pending = {}
  c.tearDown = (callback) ->
    c.pending = {}
    do callback
  c.forwardBrackets = {}
  c.process (input, output) ->
    if input.hasData 'error'
      # There is a failure in this scope, reject it
      err = input.getData 'error'
      unless c.pending[input.scope]
        c.pending[input.scope] = prepareScope()
      if c.pending[input.scope].rejected or c.pending[input.scope].resolved
        # This scope was already resolved
        output.done()
        return
      # Mark scope as rejected
      c.pending[input.scope].rejected = true
      output.sendDone
        error: err
      return

    # See if we have any input results
    indexesWithStreams = input.attached('in').filter (idx) ->
      input.hasStream ['in', idx]
    return unless indexesWithStreams.length

    unless c.pending[input.scope]
      c.pending[input.scope] = prepareScope()

    # Check if the execution was already resolved
    if c.pending[input.scope].rejected or c.pending[input.scope].resolved
      indexesWithStreams.forEach (idx) ->
        # Drop all packets that arrive after resolution
        stream = input.getStream ['in', idx]
        ip.drop() for ip in stream
      output.done()
      return

    # Read results
    results = input.getStream(['in', indexesWithStreams[0]]).filter (ip) ->
      ip.type is 'data'

    # Mark as resolved
    c.pending[input.scope].resolved = true
    # Send data
    data = results.map (ip) -> ip.data
    output.sendDone
      out: data
