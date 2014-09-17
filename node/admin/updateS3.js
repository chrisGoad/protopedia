

/*
Utility for updating  S3.

It also sends logout_template, sign_in_template, and handle_template into logout,sign_in, and handle (needed
to install versions)

To run this script (for version 3)
cd /mnt/ebs0/prototypejungledev/node;node admin/updateS3.js d
cd /mnt/ebs0/prototypejungledev/node;node admin/updateS3.js p all

*/


var fromCloudFront = 1;
var useMin = 1;

var versions = require("./versions.js");
var util = require('../util.js');
//util.activeTags = ["s3"];

var fs = require('fs');
var s3 = require('../s3');
util.activateTagForDev("s3");

var defaultMaxAge = 0; // if not explicitly specified 
var a0 = process.argv[2];
var updateAll = process.argv[3] === 'all';

console.log('UPDATE ALL',updateAll);


function insertVersions(s) {
  if (fromCloudFront) {
    var rs =  s.replace(/\{\{domain\}\}/g,'prototypejungle.org');
  } else {
    rs = s.replace(/\{\{domain\}\}/g,'prototypejungle.org.s3.amazonaws.com');
  }
  var min = useMin?'.min':'';
  rs =  rs.replace(/\{\{pjdom_version\}\}/g,versions.pjdom+min);
  rs = rs.replace(/\{\{pjui_version\}\}/g,versions.pjui+min);
  rs = rs.replace(/\{\{pjtopbar_version\}\}/g,versions.pjtopbar+min);
  rs = rs.replace(/\{\{pjchooser_version\}\}/g,versions.pjchooser+min);
  rs = rs.replace(/\{\{pjview_version\}\}/g,versions.pjview+min);
  rs = rs.replace(/\{\{pjloginout_version\}\}/g,versions.pjloginout+min);
  rs = rs.replace(/\{\{pjworker_version\}\}/g,versions.pjworker+min);

  return rs;

}

var boiler0 = '\n'+
'<script>\n'+
'if (!Object.create) {\n'+
'  window.location.href = "/unsupportedbrowser";\n'+
'}\n'+
'</script>\n'+
'<script src="http://{{domain}}/js/pjtopbar-{{pjtopbar_version}}.js"></script>\n'+
'<script>\n'+
'pj.ui.checkBrowser();\n'+
'</script>\n'+
'<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>\n\n'+
'\n';

var boiler1 = '\n'+
'<script>\n'+
"$('document').ready(function () {\n"+
'  pj.om.checkSession(function (rs) {\n'+
"    pj.ui.genTopbar($('#topbar'),{includeTitle:1});\n"+
'  });\n'+
'});\n'+
'</script>\n';

var boiler2 = '\n'+
'<div id="outerContainer">\n'+
'  <div id="topbar">\n'+
'     <div id="topbarOuter" style="padding-bottom:30px"><span class="mainTitle">PrototypeJungle</span>\n'+
'        <div id = "topbarInner" style="float:right"></div>\n'+
'        <div id ="worker" style="position:absolute;left:50px;top:4px">\n'+
'           <iframe style="border-width:0px" id="workerIframe" width="1" height="1"></iframe>\n'+
'        </div>\n'+
'    </div>\n'+
'  </div>\n';

var boilerplate = boiler0+boiler1+boiler2;
//var standaloneBoilerplate = 'SABSAB';

// for standalone pages
function insertBoilerplate(s) {
  var rs = s.replace(/\{\{boilerplate\}\}/g,boilerplate);
  if (rs == s) {
    rs = rs.replace(/\{\{boiler0\}\}/g,boiler0);
    rs = rs.replace(/\{\{boiler1\}\}/g,boiler1);
    rs = rs.replace(/\{\{boiler2\}\}/g,boiler2);
  }
  return rs;
}

var ppjdir = "/mnt/ebs0/prototypejungle/www/";

if (a0 === "p") {
  var forDev = false;
  var pjdir = "/mnt/ebs0/prototypejungle/www/";
} else if (a0 ==="d") {
  forDev = true;
  var pjdir = "/mnt/ebs0/prototypejungledev/www/";
} else {
  console.log("Usage: 'node updateS3.js p' or 'node updateS3.js d', for the production or dev environtments, respectively")
}

  var fromTemplate = function (path) {
    var ipth = pjdir+path+"_template";
    console.log("Reading from ",ipth);
    var vl =  insertVersions(insertBoilerplate(fs.readFileSync(ipth).toString()));
    var opth = ppjdir+path;
    if ((path === "worker") || (path === "twitter_oauth")) {
      opth += ".html";
    }
    console.log("Instantiating ",ipth," to ",opth);

    fs.writeFileSync(opth,vl);
  }
  
  var templated = ["sign_in","logout","handle","worker","twitter_oauth"];
  
  if (updateAll) {
    templated.forEach(function (p) {
      fromTemplate(p);
    });
  }
  
    

  var toS3 = function (dt,cb) {
    console.log("OO",dt);
    var path = dt.source;
    var mxa = (dt.maxAge)?dt.maxAge:defaultMaxAge;
    var fpth = pjdir+path;
    var ctp = dt.ctype;
    if (dt.dest) {
      path = dt.dest;
    }
    console.log("Reading from ",fpth);
    var ivl = fs.readFileSync(fpth).toString();
    
    var vl = insertVersions(insertBoilerplate(ivl));
    console.log("ToS3 from ",fpth,"to",path,"age",mxa);
    if (path === "newuser") {
      console.log("**IVL**",ivl);

      console.log("**VL**",vl);
    }
     s3.save(path,vl,{contentType:ctp,encoding:"utf8",maxAge:mxa,dontCount:1},cb);
  }
  
  var jst = "application/javascript";
  var htt = "text/html";
 
  
  var add1Html = function(a,fl,dst) {
    var rs = {source:fl,ctype:htt};
    if (dst) {
      rs.dest = "/"+dst;
    }
    a.push(rs);
  }
  
  
  var addHtml = function (a,fls) {
    fls.forEach(function (fl) {
      add1Html(a,fl);
    });
  }
  
  var addHtmlDoc = function(a,fl) {
    a.push({source:"doc/"+fl+".html",ctype:htt});
  }
  
  var addHtmlDocs = function (a,fls) {
    fls.forEach(function (fl) {
      addHtmlDoc(a,fl);
    });
  }
  
  
  //var fts = [["index.html",htt],["style.css","text/css"],["min/common1.js",jst],
  //           ["min/view.js",jst],["min/core.js",jst],["min/draw.js",jst],["min/min.js",jst],
  //           ["choosedoc.html",htt],["tech.html",htt],["userguide.html",htt],["about.html",htt]];
  
  var fts = [{source:"style.css",ctype:"text/css"}];
  if (updateAll) {

    
  //add1Html(fts,"index.html","tindex.html");
  //add1Html(fts,"notyet.html","index.html");
    addHtml(fts,["inspect","newuser","view","chooser.html","unsupportedbrowser","missing.html","limit.html","denied.html"]);
  }
  add1Html(fts,"index.html","index.html");

  addHtmlDocs(fts,["chartdoc","choosedoc","embed","guide","inherit","opaque","tech","about"]);

  console.log(fts);
  
  
  util.asyncFor(toS3,fts,function () {
    console.log("DONE UPDATING S3");
  },1);

