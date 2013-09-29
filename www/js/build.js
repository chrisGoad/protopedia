
    
(function (__pj__){
 
  var om = __pj__.om;
  var draw = __pj__.draw;
  var page = __pj__.page
 

var cb;
var editor;
var itemPath;
//var theItemPath = '/pj/repoTest2/examples/Nested';
var buildTimeout = 3000;// does not  include load time, just the computation of the bnuild itself
var buildDone;
//var editor;
// var itemPath;
   
  page.elementsToHideOnError = [];


  function layout() {
   
    var awinwid = $(window).width();
    var awinht = $(window).height();
    var topht = $('#topbarOuter').height();
    var eht = awinht - 50 - topht;
    console.log(topht);
    $('#editor').css({height:eht+"px",top:(topht+10)+"px"});
  }

function checkAuth() {
  if (!itemPath) {
    return "No item path; the url should include ?item=/handle/repo ...";
  }
// strip off the handle and repo
  var ip = om.stripInitialSlash(itemPath);
  var spl = ip.split("/");
  var h = localStorage.handle;
  if (spl.length<3) {
    return "The item path must include at least /handle/repo/name";
  }
  if (spl[0] != h) {
     return "You cannot build items outside of your tree /"+h;
  }
}

function pathForItem() {
 // strip off the handle and repo
  var ip = om.stripInitialSlash(itemPath);
  var spl = ip.split("/");
  spl.shift();
  spl.shift();
  return "/"+spl.join("/");
}



function exampleText1() {
   var ipth =pathForItem();
   //var spth = om.pathExceptLast(ipth);
   //var pth = ipth + "/NestedArcs";
   var rs = '\
\n\
//a collection of nested arcs \n\
//see http://prototypejungle.org/tech.html#update for explanations\n\
(function (pj) {\n\
  var om = pj.om; \n\
  var geom = pj.geom;\n\
\n\
  var item = pj.set("'+ipth+'",geom.Shape.mk());\n\
\n\
  //The arc prototype. \n\
  var arcP=item.set("arcP",geom.Arc.mk({radius:100,startAngle:0,endAngle:2*Math.PI})).hide();\n\
  item.radiusFactor = 0.9;\n\
  item.count = 10;\n\
  item.update = function () {\n\
    var om = prototypeJungle.om;\n\
    var arcs = om.LNode.mk().computed();\n\
    this.set("arcs",arcs);\n\
    var crad = this.arcP.radius;\n\
    var cnt = this.count;\n\
    for (var i=0;i<this.count;i++) {\n\
      var ca = this.arcP.instantiate().show();\n\
      arcs.pushChild(ca);\n\
      ca.setf("radius",crad);  // freeze the radius\n\
      crad = crad * this.radiusFactor;\n\
    }\n\
  };\n\
  om.save(item);\n\
})(prototypeJungle);\n\
';
  return rs;

}


function exampleText0() {
   var ipth =pathForItem();
   //var spth = om.pathExceptLast(ipth);
   //var pth = ipth + "/NestedArcs";
   var rs = '\
\n\
//Two Rectangles with a common prototype.\n\
(function (pj) {\n\
    var om = pj.om;\n\
    geom = pj.geom;\n\
    // the item being built \n\
    var item=pj.set("/examples/TwoR",geom.Shape.mk()); \n\
    // A rectangle prototype \n\
    var rectP=item.set("rectP",\n\
        geom.Rectangle.mk(\n\
            {corner:[0,0],extent:[100,100],\n\
             style:{hidden:1,strokeStyle:"black",fillStyle:"green",lineWidth:4}}).hide());\n\
    item.set("r1",rectP.instantiate().show());\n\
    item.set("r2",rectP.instantiate().show());\n\
    item.r2.corner.x = 140;\n\
    item.r2.style.fillStyle = "blue";\n\
    item.r1.draggable = 1;\n\
    item.r2.draggable = 1;\n\
    om.save(item); \n\
})(prototypeJungle);\n\
';
  return rs;

}

function initialText() {
  var rp = om.pathExceptFirst(itemPath);
  if (rp == 'repo0/examples/NestedArcs') {
    return exampleText1();
  }
  if (rp == 'repo0/examples/TwoRectangles') {
    return exampleText0();
  }
  var ipth =pathForItem();
  return  '\n\
// The code that defines the item \n\
(function (pj) {\n\
  pj.om.restore([], // insert dependencies here \n\
    function () {\n\
      // handy variables\n\
      var om = pj.om; \n\
      var geom = pj.geom;\n\
\n\
      // the item being built \n\
      var item = pj.set("'+ipth+'",geom.Shape.mk());  \n\
\n\
      // the code to construct the item goes here \n\
      // for example: item.set("circle",geom.Circle.mk({radius:100})) \n\
\n\
      om.save(item); \n\
    }\n\
  )\n\
})(prototypeJungle)\n\
';

}


function setError(txt,errOnly) {
  if (!errOnly) {
    $('#nowBuilding').hide();
    $('#saving').hide();
     $('#editor').hide();
  }
   $('#error').html(txt);
   layout();
}
var nowSaved = true;

function setSaved(v) {
  nowSaved = v;
  if (v) {
    //$('#saved').html('Saved');
    $('#itemkind').html('Item ');
    $('#stale').html('');
  } else {
    $('#saved').html('');
    $('#stale').html('*');
   
  }
  layout();
}
function buildError(url) {
  if (!buildDone) {
   __pj__.page.genError("<span style='color:red'>Error</span>: the build from <a href='"+url+"'>"+url+"</a> failed, either because the file is missing, or because there was a JavaScript error. \
                        JavaScript debuggers are available in all modern browsers. Edit, and try again.");
  }
}

function saveSource(cb) {
    $('#error').html('');
    var dt = {path:itemPath,source:editor.getValue(),kind:"codebuilt"};
    $('#saving').show();
    om.ajaxPost("/api/toS3",dt,function (rs) {
       $('#saving').hide();
       if (rs.status != "ok") {
        setError("Save failed. (Internal error)");
      } else {
        setSaved(true);
        if (cb) {
          cb();
        }
      }
    });
  }
  
function getSource(cb) {
    // I'm not sure why, but the error call back is being called, whether or not the file is present
    function scb(rs) {
      if (rs.statusText == "OK") {
        cb(rs.responseText);
      } else {
        cb(undefined);
      }
    }
   
    var opts = {url:itemSource,cache:false,contentType:"application/javascript",dataType:"string",type:"GET",success:scb,error:scb};
    $.ajax(opts);
    //code
  }
  
function doTheBuild() {
    saveSource(function () {
       om.customSave = function (built) {
        buildDone = true;
        built.__source__ =  itemSource;
        var whenSaved = function (srs) {
          if (srs.status == "fail") {
            $('#nowBuilding').hide();
            if (srs.msg == "busy") {
              emsg = "The server is overloaded just now. Please try again later";
            } else if ((srs.msg=="noSession")||(srs.msg == "timedOut")) {
              var emsg = 'Your session has timed out. Please sign in again.';
              page.logout();
            } else {
              emsg = "unexpected error- "+srs.msg; //should not happen
            }
            page.genError("Error: "+emsg);
            return;
          }
          var inspectPage = om.useMinified?"/inspect":"inspectd";

          var dst = inspectPage+"?item="+itemUrl;
          location.href = dst;
          return;
        }
        var paths = om.unpackUrl(itemUrl);
        //built.__origin__ = itemUrl;
        om.s3Save(built,paths,whenSaved);
      }
      $('#nowBuilding').show();
      //var tm = Date.now();

      om.getScript(itemSource, function (rs) {
        // the getScript (just an ajax get with script datatype) calls success after the code has been grabbed, but
        // it might need a moment to execute. We give it three seconds (flow took 300 millsecs
        //alert(Date.now() - tm);

        setTimeout(function () {
          if (!buildDone) {
            $('#nowBuilding').hide();
            setError("The build failed because there was a JavaScript error. JavaScript debuggers are available in all modern browsers - retry the build with the debugger on, and/or with edits.",1);
          }
        },buildTimeout);
      });
    });
  }

  var onLeave = function (e) {
    var msg = nowSaved?undefined:"There are unsaved modifications.";
     (e || window.event).returnValue = msg;     //Gecko + IE
     return msg; //webkit
  }
  
page.whenReady = function () {
      $('#saving').hide();
    $('#nowBuilding').hide();
    $('#building').hide();
    om.disableBackspace();
   window.addEventListener("beforeunload",onLeave);

  page.genTopbar($('#topbar'),{includeTitle:1});//,toExclude:{'file':1}});
  
    om.checkSession(function (rs) {
       if (rs.status!="ok") {
          setError("You must be signed in to do a build");
          return;
        }
        var q = om.parseQuerystring();
        itemPath = q.item;
        itemUrl = "http://s3.prototypejungle.org"+itemPath;
        itemSource = itemUrl + "/source.js";
        $('#building').show();      
        $('#whichItem').html(itemPath);
        var ck = checkAuth();
        if (typeof ck == "string") {
          page.setError(ck);
          return;
        }
        getSource(function (rs) {
          if (rs) {
            itxt = rs;
            setSaved(true);
          } else {
            var itxt = initialText();
            setSaved(false);
            $('#itemkind').html("New item ");
          }
          editor = ace.edit("editor");
          editor.setTheme("ace/theme/TextMate");
          editor.getSession().setMode("ace/mode/javascript");
          editor.setValue(itxt);
          editor.on("change",function (){console.log("change");setSaved(false);$('#error').html('');layout();});
          editor.clearSelection();
          $('#buildButton').click(function () {
            doTheBuild();
          });
          $('#saveButton').click(function () {
            saveSource();
          });
          $('#exampleButton').click(function () {
            editor.setValue(exampleText());
            editor.clearSelection();

          });
        });
        layout();
    });
  }
  
  
 


})(prototypeJungle);


    