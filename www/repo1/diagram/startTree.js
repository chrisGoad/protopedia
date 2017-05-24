pj.require('/diagram/itree2.js','/shape/arrow.js',function (treeP,arrowPP) {
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
var item = pj.svg.Element.mk('<g/>');
//var tree = pj.root.set('__graph',treeP.instantiate());
var tree =  item.set('__graph',treeP.instantiate());
var vertexP = tree.vertexP;
vertexP.fill = "black";
vertexP.stroke = "transparent";
vertexP.__dimension = 15;
var edgeP = tree.edgeP;

/*var leafP = tree.leafVertexP;
leafP.fill = "green";
leafP.stroke = "black";
leafP.dimension = 18;
*/
edgeP.headGap = 5;
edgeP.tailGap = 7;
edgeP['stroke-width'] = 2;
edgeP.headWidth = 5;
edgeP.headLength = 7;
tree.buildSimpleTree();
return item;
});
