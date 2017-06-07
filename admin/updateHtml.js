

/*
Utility for dealing with html files from wwwscrc. Inserts boilerplate, does substitutions,  and writes to www
For the index file:
node admin/updateHtml.js p index
For the rest
node admin/updateHtml.js p

"p" means production (use of .min js files). Use d for non-min
*/

var fs = require('fs');

var minimize = process.argv[2] === 'p';//for production
var index = process.argv[3] === 'index';

var boilerplate0 = 
`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="description" content="An open drawing system based on deep prototypes">
<title>PrototypeJungle</title>
<link rel="stylesheet" type="text/css"  href="/style.css">
<link rel="icon" href="/images/favicon.ico" />
</head>
`;
var minimalScripts =
`<script src="js/minimal-0.9.4.js"></script>
`;

var signInScripts = 
`<script src="https://www.gstatic.com/firebasejs/4.1.1/firebase.js"></script>
<script src="js/firebase_only-0.9.4.js"></script>
`;

var buttonStyle = index?'indexUbutton':'ubutton';
//var buttonStyle = 'indexUbutton';
//`<body style="background-color:rgb(30,30,30)">

var boilerplate1 =
`<body style="background-color:`+(index?"rgb(30,30,30)":"white")+`">
<div id="outerContainer">  
  <div id="topbar"> 
     <div id="topbarOuter" style="padding-bottom:0px">`+
        (index?'\n':'<a href="/"><span style="position:relative;"top:${index?-27:-10}px" class="mainTitle">PrototypeJungle</span></a>\n')+
`         <img style ="position:relative;border:none;top:${index?0:10}px;left:${index?0:20}px;" alt="images/logo_alt.html" src="/images/logo2.svg"  width="60" height="25"/>
         <div id = "topbarInner" style="position:relative;float:right;top12px">
           <a href="/draw.html?source=/diagram/cayleyD3.js&intro=intro1" class="${buttonStyle}">Intro</a>
            <a href="/draw.html" class="${buttonStyle}">Draw</a> 
           <a href="/code.html" class="${buttonStyle}">Code</a> 
          <a href="/doc/choosedoc.html" class="${buttonStyle}">Docs</a> 
           <a href="/doc/about.html" class="${buttonStyle}">About</a>
           <a href="https://github.com/chrisGoad/prototypejungle/tree/master" class="${buttonStyle}">GitHub</a>
           <a id ="signInButton" style="display:none" href="/sign_in.html" class="${buttonStyle}">Sign In</a>
           <a id="accountButton" style="display:none" href="/account.html" class="${buttonStyle}">Account</a>      
         </div> 
    </div>
  </div>
  <div id="innerContainer" style="margin-top:30px">`;

var endplate =
`  </div>
</div>
</body>
</html>
`;



function doSubstitution(s,what,value,withDoubleBracket) {
    var rge = withDoubleBracket?new RegExp('\{\{'+what+'\}\}','g'):new RegExp(what,'g');
    return s.replace(rge,value);
}

function insertBoilerplate(s,scripts) {
  var irs = doSubstitution(s,'boilerplate',boilerplate0+scripts+boilerplate1,1);
  var irs = doSubstitution(irs,'min',minimize?'min.':'',1);
  var irs = doSubstitution(irs,'<cw>','<span class="codeWord">');
  var irs = doSubstitution(irs,'</cw>','</span>');
  var irs = doSubstitution(irs,'<precode>','<pre><code>');
  var irs = doSubstitution(irs,'</precode>','</code></pre>');
  return doSubstitution(irs,'endplate',endplate,1);
}

  
  var needsSignInScripts = {sign_in:1,account:1,index:1,svg:1};
  
  var addHtml1 = function(fl) {
    console.log('read',fl);
    var scripts = needsSignInScripts[fl]?signInScripts:minimalScripts;
    var ffl = fl+'.html';
    var ivl = fs.readFileSync('wwwsrc/'+ffl).toString();
    var vl = insertBoilerplate(ivl,scripts);
    console.log('writing',ffl);
    fs.writeFileSync('www/'+ffl,vl);
    return;
  }
  
  
  var addHtml = function (fls) {
    fls.forEach(function (fl) {
      addHtml1(fl);
    });
  }
  
  var addHtmlDoc = function(fl) { 
     var ffl = "doc/"+fl;
   console.log('ADDING HTML DOC ',ffl);
    addHtml1(ffl); 
  }

  var addHtmlDocs = function (a,fls) {
    fls.forEach(function (fl) {
      addHtmlDoc(fl); 
    });
  }
 
var fts = [];
if (index) {
  addHtml(['index']);
} else {
//  index = 1;
  addHtml(['draw','code','catalogEdit','404','svg','sign_in','account',"signupsDisabled",]);
  addHtmlDocs(fts,["code","about","choosedoc","inherit","deepPrototypes","tech","toc","privacy",
                   "intro1","intro2","intro3","intro4","intro5","beta"]);
}

  
