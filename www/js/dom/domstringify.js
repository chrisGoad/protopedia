(function (pj) {
  "use strict";
  var ui = pj.ui;
  var dat = pj.dat;
  var dom = pj.dom;

  
// This is one of the code files assembled into pjui.js. //start extract and //end extract indicate the part used in the assembly
//start extract

  
  // some state of an item is not suitable for saving (eg all of the dom links). This sta
  var propsToStash = ["__objectsModified","__xdata","surrounders","__container","__controlBoxes","__customBoxes"];
  var computeStash;
  var domStash;
  var stateStash;
  
  var stashPreSave = function (itm,needRestore) {
      stateStash = needRestore?{}:undefined;
      if (needRestore) {
        pj.setProperties(stateStash,itm,propsToStash,1);
      }
      propsToStash.forEach(function (p) {
        delete itm[p];
      });
      //dat.stashData(itm);
      domStash = needRestore?{}:undefined;
      dom.removeDom(itm,domStash);
      computeStash = needRestore?{}:undefined;
      pj.removeComputed(itm,computeStash);
  } 
  
  
  pj.beforeStringify.push( function (itm) {stashPreSave(itm,1)});
  
  var restoreAfterSave = function (itm) {
    pj.setProperties(itm,pj.stashedState,propsToStash,1);
   // dat.restoreData(itm);
    pj.restoreComputed(itm,computeStash);
    pj.restoreDom(itm,domStash);
  }
    
  pj.afterStringify.push(restoreAfterSave);

//end extract

 
})(prototypeJungle);