noflo = require('noflo')

initializer =
  "'Where will I go?' -> IN Floodgate(flow/Floodgate)\n"+
  // At port index 0
  "'GroupA' -> GROUP GroupA(Group)\n"+
  "Floodgate() OUT -> IN GroupA() OUT -> IN ReadA(groups/ReadGroup) GROUP -> IN OutputA(core/Output)\n"+
  // At port index 1
  "'GroupB' -> GROUP GroupB(Group)\n"+
  "Floodgate() OUT -> IN GroupB() OUT -> IN ReadB(groups/ReadGroup) GROUP -> IN OutputB(core/Output)\n"+
  // Output: 'GroupB'
  "'1' -> PORT Floodgate()";

noflo.graph.loadFBP(initializer, function(graph){
  noflo.createNetwork(graph, function(network){});
});
