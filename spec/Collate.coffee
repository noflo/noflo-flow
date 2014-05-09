noflo = require 'noflo'

unless noflo.isBrowser()
  chai = require 'chai' unless chai
  Collate = require '../components/Collate.coffee'
else
  Collate = require 'noflo-flow/components/Collate.js'

describe 'Collate component', ->
  c = null
  cntl = null
  ins = []
  out = null
  beforeEach ->
    c = Collate.getComponent()
    cntl = noflo.internalSocket.createSocket()
    ins.push noflo.internalSocket.createSocket()
    ins.push noflo.internalSocket.createSocket()
    ins.push noflo.internalSocket.createSocket()
    out = noflo.internalSocket.createSocket()
    c.inPorts.ctlfields.attach cntl
    c.inPorts.in.attach inSock for inSock in ins
    c.outPorts.out.attach out

  describe 'Collating a bank statement', ->
    it 'should return the data in the correct order', (done) ->
      original = [
        'branch,account,date,amount,DEP/WD'
        '1,3,1992/3/16,9.26,WD'
        '1,1,1992/3/26,10.10,WD'
        '1,3,1992/3/13,2.15,WD'
        '2,1,1992/4/26,12.00,WD'
        '1,2,1992/3/27,102.99,WD'
        '2,1,1992/3/08,22.00,WD'
        '1,3,1992/3/16,9.26,WD'
        '1,2,1992/3/27,102.99,WD'
        '1,2,1992/3/26,92.10,WD'
      ]

      expected = [
        '< branch'
        '< account'
        '< date'
        '1,1,1992/3/26,10.10,WD'
        '> date'
        '> account'
        '< account'
        '< date'
        '1,2,1992/3/26,92.10,WD'
        '> date'
        '< date'
        '1,2,1992/3/27,102.99,WD'
        '1,2,1992/3/27,102.99,WD'
        '> date'
        '> account'
        '< account'
        '< date'
        '1,3,1992/3/13,2.15,WD'
        '> date'
        '< date'
        '1,3,1992/3/16,9.26,WD'
        '1,3,1992/3/16,9.26,WD'
        '> date'
        '> account'
        '> branch'
        '< branch'
        '< account'
        '< date'
        '2,1,1992/3/08,22.00,WD'
        '> date'
        '< date'
        '2,1,1992/4/26,12.00,WD'
        '> date'
        '> account'
        '> branch'
      ]

      received = []
      groups = []
      out.on 'begingroup', (group) ->
        groups.push group
        received.push "< #{group}"
      out.on 'data', (data) ->
        values = []
        for key, val of data
          values.push val
        received.push values.join ','
      out.on 'endgroup', ->
        received.push "> #{groups.pop()}"
      out.on 'disconnect', ->
        chai.expect(received).to.eql expected
        done()

      # Send the fields to collate by
      cntl.send 'branch,account,date'

      # First line is headers, take that out
      headers = original.shift().split ','

      # Randomize the rest of the entries to make sure we are always collating right
      original.sort -> 0.5 - Math.random()

      # Send the beginning of transmission to all inputs
      inport.connect() for inport in ins

      for entry,index in original
        # Parse comma-separated
        entryData = entry.split ','
        # Convert to object
        entryObj = {}
        for header,idx in headers
          entryObj[header] = entryData[idx]

        # Send to a random input port
        randomConnection = Math.floor Math.random() * ins.length
        ins[randomConnection].send entryObj

        # Once we're close to the end we disconnect one of the inputs
        if index is original.length - 3
          disconnecting = ins.pop()
          disconnecting.disconnect()

      # Finally disconnect all
      inPort.disconnect() for inPort in ins
