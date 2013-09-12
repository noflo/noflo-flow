noflo = require('noflo')

initializer =
  // Set to red light (by default it sends to all, i.e. doesn't fork)
  "'0' -> IN MergeOn()\n"+
  // Stopped and cached by default
  "'Stopped' -> IN TrafficLight(flow/TrafficLight)\n"+
  "'Stopped again' -> IN TrafficLight()\n"+
  // Set to green light
  "'1' -> IN MergeOn(core/Merge) OUT -> ON TrafficLight()\n"+
  // Passed through
  "'Passed' -> IN TrafficLight()\n"+
  "'Passed again' -> IN TrafficLight()\n"+
  // Flushed
  "'1' -> READY TrafficLight()\n"+
  // Set to red light
  "'0' -> IN MergeOn()\n"+
  // Stopped again
  "'Stopped yet again' -> IN TrafficLight()\n"+
  // Output the result
  "TrafficLight() OUT -> IN Output(core/Output)";

noflo.graph.loadFBP(initializer, function(graph){
  noflo.createNetwork(graph, function(network){});
});
