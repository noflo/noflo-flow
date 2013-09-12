noflo = require('noflo');

initializer =
  // Setup
  "Merge(core/Merge) OUT -> IN BufferUntil(flow/BufferUntil)\n"+
  // Buffer
  "'A' -> IN Merge()\n"+
  // Buffer more
  "'B' -> IN Merge()\n"+
  // Don't buffer any more: prints 'A' and 'B'
  "'0' -> READY BufferUntil()\n"+
  // Buffer yet more: prints 'C'
  "'C' -> IN Merge()\n"+
  // Output the result
  "BufferUntil() OUT -> IN Output(core/Output)";

noflo.graph.loadFBP(initializer, function(graph){
  noflo.createNetwork(graph, function(network){});
});
