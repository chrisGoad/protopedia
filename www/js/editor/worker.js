

prototypeJungle.work = {};
(function (pj) {
  
// This is one of the code files assembled into pjworker.js. //start extract and //end extract indicate the part used in the assembly
//start extract
var work = pj.work = {};
work.initPage = function () {
  pj.noSession = 1;
  //  expected message: {apiCall:,postData:,opId:} opid specifies the callback
  window.addEventListener("message",function (event) {
    debugger;
    var jdt = event.data;
    var dt = JSON.parse(jdt);
    if (pj.systemDown) {
    sendDownMsg(dt.opId);
    } else {
      apiPost(dt.apiCall,dt.postData,dt.opId);
    }
  });
  // at initialization time,let the caller know about who's signed in 
  apiPost('/api/aboutme','none','workerReady')
  //sendTopMsg(JSON.stringify({opId:"workerReady"}));
}

  
  

var sendTopMsg = function(msg) {
  // dont send a message to yourself
  pj.log('worker','sendingTopMsg',msg);
  if (window !== window.top) {
    window.top.postMessage(msg,"*");
  }
}

  
var sendDownMsg = function (opId) {
  pj.clearStorageOnLogout();
  var rmsg = JSON.stringify({opId:opId,value:{status:"fail",msg:"systemDown"}});
  sendTopMsg(rmsg);
}
  
var doThePost = function(cmd,dt,opId) {
  pj.log('worker',"POSTING ",opId);
  pj.ajaxPost(cmd,dt,function (rs) {
    var rmsg = JSON.stringify({opId:opId,value:rs,postDone:1});
    pj.log('worker',"sending top msg",rmsg);
    sendTopMsg(rmsg);
  },function (rs) { // the error callback
    sendDownMsg(opId);
  });
}

var apiCalls = {'/api/aboutme':1,'/api/list':1,'/api/save':1,'/api/signout':1}

var apiPost = function (cmd,dt,opId) {
  if (apiCalls[cmd]) {
    doThePost(cmd,dt,opId);
  } else {
    console.log('Unkown call ',cmd);
  }
}


//end extract	
})(prototypeJungle);

