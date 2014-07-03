
(function (pj) {
  "use strict"
var om = pj.om;

// This is one of the code files assembled into pjcs.js. //start extract and //end extract indicate the part used in the assembly
//start extract

// a trivial exception setup.  System is meant to indicate which general system generated the error (eg instantiate, install, externalize, or  what not.
om.Exception = {};

om.throwOnErrors = 0;
om.Exception.mk = function (msg,sys,vl) {
  var rs = Object.create(om.Exception);
  rs.message = msg;
  rs.system = sys;
  rs.value = vl;
  return rs;
}

// A default handler
om.Exception.handler = function () {
  var msg = this.message;
  if (this.system) msg += " in system "+this.system;
  om.log("error",msg);
}
  
om.error = function (msg,sys) {
  om.log('error',msg+sys?' from '+sys:'')
  debugger;
  if (om.throwOnErrors) {
    var ex = om.Exception.mk(msg,sys);
    throw ex;
  } 
}
//end extract
})(prototypeJungle);
