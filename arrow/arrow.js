// arrow

core.require('/arrow/arrow0.js','/line/line.js','/arrow/solidHead.js',function (arrowP,linePP,headPP) {

let rs = arrowP.instantiate();
rs.initializePrototype  = function () {
  core.assignPrototypes(this,'shaftP',linePP,'headP',headPP);
}
return rs;
});


