noflo = require("noflo")

class CountDown extends noflo.Component

  description: "count down from particular number, by default 1, and
    send an empty IP when it hits 0"

  constructor: ->
    @default = @count = 1
    @repeat = true

    @inPorts = new noflo.InPorts
      in:
        datatype: 'bang'
        description: 'IPs to decrease the count down'
      count:
        datatype: 'int'
        description: 'Count down starting number'
      repeat:
        datatype: 'boolean'
        description: 'Repeat the count down mechanism if true'
    @outPorts = new noflo.OutPorts
      out:
        datatype: 'bang'
        description: 'IP emitted when the count reach 0'
      count:
        datatype: 'int'
        description: 'Unused at this time'

    @inPorts.count.on "data", (@count) =>
      @default = @count

    @inPorts.repeat.on "data", (@repeat) =>

    @inPorts.in.on "disconnect", =>
      if --@count is 0
        @outPorts.out.send(null)
        @outPorts.out.disconnect()

        @count = @default if @repeat

exports.getComponent = -> new CountDown
