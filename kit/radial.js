core.require('/container/circle.js','/arrow/arrow.js',function (vertexPP,arrowPP) {
  
let item = svg.Element.mk('<g/>');

/* adjustable parameters */
item.numNodes = 5
item.dimension = 200;
/* end adjustable parameters */


item.resizable = true;
item.isKit = true;
item.hideAdvancedButtons = true;


item.initialize = function () {
  this.vertexP = core.installPrototype('vertexP',vertexPP);
  this.edgeP = core.installPrototype('edgeP',arrowPP);
}
item.updateVertices = function () {
  core.forEachTreeProperty(this.vertices,function (child) {
    child.updateAndDraw();
  });
}

item.updatePositions = function () {
  let numNodes= this.numNodes;
  for (let i=0;i<numNodes;i++) {
    let angle = 2*Math.PI*(0 +i/numNodes-1/4);
    let pos = geom.Point.mk(Math.cos(angle),Math.sin(angle)).times(0.5 * this.dimension);
    let nm = 'v'+i;
    let vertex = this.vertices[nm];
    vertex.moveto(pos);
  }
  this.builtDimension = this.dimension;
}

item.update = function () {
  let center;
  let numNodes= this.numNodes;
  let numNodesBuilt = this.numNodesBuilt;
  if (numNodes === numNodesBuilt) {
    if (this.builtDimension !== this.dimension) {
      this.updatePositions();
    }
    this.updateVertices();
    graph.graphUpdate();
    return;
  }
  graph.reset(this);
  let vertex;
  for (let i=0;i<numNodes;i++) {
    let nm = 'v'+i;
    vertex = this.vertexP.instantiate().show();
    this.vertices.set(nm,vertex);
  }
  vertex = this.vertexP.instantiate().show();
  center = this.set('center',vertex);
  this.updatePositions();
  let edgeIndex = 0;
  const addEdge =  (v0,v1) => {
    let edge = this.edgeP.instantiate().show();
    let nm = 'e'+(edgeIndex++);
    this.edges.set(nm,edge);
    graph.connectVertices(edge,v0,v1);
  }
  for (let i=0;i<numNodes;i++) {
    let v = this.vertices['v'+i];
    addEdge(center,v);
   
  }
 this.numNodesBuilt = numNodes;
}

ui.hide(item,['builtDimension','vertices','edges','numNodesBuilt','hideAdvancedButtons']);

return item;
});
     
