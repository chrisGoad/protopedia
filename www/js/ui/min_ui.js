// so that some ui functions can be included in items that are used in a non-ui context
(function (pj) {
  
// This is one of the code files assembled into pjtopobar.js. //start extract and //end extract indicate the part used in the assembly
//start extract
  var ui = pj.set("ui",Object.create(pj.Object)); 
  ui.setNote = function () {}
  ui.watch = function () {}
  ui.freeze = function (){}
  ui.hide = function () {}
  ui.melt = function () {}
  pj.Object.__setUIStatus = function () {}


//end extract
  
})(prototypeJungle);