// at some point, this code will be reworked based on a structured description of the desired DOM rather than construction by code
(function (__pj__) {
  var om = __pj__.om;
  var ui = __pj__.ui;
  var dom = __pj__.dom;
  var html = __pj__.html;
  var tree = __pj__.tree;
  var jqp = __pj__.jqPrototypes;
  var mpg; // main page
  var mpg = html.Element.mk('<div style="position:absolute;margin:0px;padding:0px"/>');
 // var useCannedSysList = 1;//(!om.isDev) || (localStorage.handle !=="sys");  // for productino, use the canned list of sys-owned items
  
   var highlightColor = "rgb(100,140,255)"; //light blue


  var codeBuilt = false;
  var itemLines;
  var itemLinesByName;
  var selectedItemLine;
  var selectedItemName;
  var selectedFolder;
  var fileTree;
  var afterYes;
  var isVariant;
  var itemsMode;
  var folderError;
  var repo; // the repo of the current user, if any
  var handle; // ditto if any
  var fhandle; // the handle of the currently selected folder
  var pathLine;
  var itemName;
  var currentItemPath; // for saving, this is the current item in the inspector
  var newItem = false;
  var currentItemFolder; // for saving, this is the current item in the inspector
  var inFrame = 0;// is this page in an iframe, or at top level? usually the former, only the latter for debugging
  var whichPage;
  var imageIsOpen;
  var lastClickTime0; // double clicking is confusing; ignore clicks too close together. to keep track of dbl clicks, we need to
  var lastClickTime1; //store the last three click
  var lastClickTime2;
  var minClickInterval = 500; // millisecs
  var baseTime = Date.now();
  var parentPJ;
  var noItemSelectedError = false;
  
  var newUserInitialPath = "sys/repo0/example";
  
  function initVars() {
    itemLines = [];
    itemLinesByName = {}
    selectedFolder = selectedFolderPath = undefined;
      isVariant = 0;
    inFrame = window !== window.top;
    
   
  }
  
  
  
  var openB,folderPanel,itemsPanel,panels,urlPreamble,fileName,fileNameExt,errDiv0,errDiv1,yesBut,noBut,newFolderLine,newFolderB,
      newFolderInput,newFolderOk,closeX,modeLine,bottomDiv,errDiv1Container,forImage,imageDoneBut,forImageDiv,itemsDiv,
      fileNameSpan,fpCloseX,fullPageText,insertPanel,insertPrototype,insertPrototypePath,insertInstance,insertInstanceTitle,insertInstancePath,
      insertOkB,insertCancelB,insertError;
 
  var itemsBrowser =  html.Element.mk('<div  style="position:absolute;width:100%;height:100%"/>');
    itemsBrowser.addChildren([
    closeX = html.Element.mk('<div style="padding:3px;cursor:pointer;background-color:red;font-weight:bold,border:thin solid black;\
        font-size:12pt;color:black;float:right">X</div>'),
    modeLine = html.Element.mk('<div style="padding:10px;width:100%;text-align:center">Mode</div>'),
    newFolderLine = html.Element.mk('<div/>').addChildren([
      newFolderB  = html.Element.mk('<div class="button">New Folder</div>'),
                             // hoverOut:{"background-color":"white"},
                             // hoverIn:{"background-color":highlightColor},style="cursor:"pointer"}}),
      newFolderInput = html.Element.mk('<input type="input" style="display:none;font:8pt arial;background-color:#e7e7ee,width:60%;margin-left:10px"/>'),
      newFolderOk =  html.Element.mk('<div class="button">Ok</div>')

    ]),
    errDiv0 =  html.Element.mk('<span class="error" style="font-size:12pt"/>'),
    html.Element.mk('<div/>').addChildren([
       pathLine = html.Element.mk('<span/>'),
       itemName = html.Element.mk('<span/>')
       ]),

   
    insertPanel = html.Element.mk('<div style="overflow:auto;height:50%;width:100%;border:solid thin black"/>').addChildren([
	insertPrototype = html.Element.mk('<div/>').addChildren([
	    html.Element.mk('<div style="font-size:8pt;padding:4px">On the first insert, an item is inserted twice: once as a prototype, \
and then as an instance of that prototype.  With repeated insertions, only the \
new instance is added, retaining the same prototype. This allows editing of __properties of all of the instances at once, via \
the prototype.</div>'),
	    html.Element.mk('<div style="padding:5px"/>').addChildren([
	      html.Element.mk('<span style="padding-right:20px">Prototype path: </span>'),
	      html.Element.mk('<span style="font-weight:bold;text-decoration:underline">prototypes</span>'),
	      insertPrototypePath = html.Element.mk('<input type="input" style="width:40%"/>')
	    ])
	  ])
	]),
    itemsPanel = html.Element.mk('<div id="itemsPanel" style="overflow:auto;ffloat:right;height:100%;width:100%;border:solid thin black"/>').addChildren([
        itemsDiv=html.Element.mk('<div style="width:100%;height:100%"/>'),
	forImage =  html.Element.mk('<img style="display:none;border:solid thin black;margin-right:auto;margin-left:auto"/>')
      ]),
   
    bottomDiv = html.Element.mk('<div style="padding-top:10px;width:100%"/>').addChildren([

      fileNameSpan = html.Element.mk('<span>Filename: </span>'),
      //urlPreamble = html.Element.mk('<span"}),
      fileName = html.Element.mk('<input type="input" style="font:8pt arial;background-color:#e7e7ee,width:30%;margin-left:10px"/>'),
      fileNameExt = html.Element.mk('<span>json</span>'),
       openB =  html.Element.mk('<span class="button" style="float:right">New Folder</span>'),
      //deleteB =  html.Element.mk('<span",html:"Delete",class:"smallButton",style="float:"right"}}); for later implementation

     ]),
    errDiv1Container = html.Element.mk('<div/>').addChildren([
        errDiv1 = html.Element.mk('<div class="error" style="font-size:12pt"/>'),
        html.Element.mk('<div/>').addChildren([
          yesBut =  html.Element.mk('<div class="button">Yes</div>'),
          noBut =  html.Element.mk('<div class="button">No</div>')
	])
      ]),

    ]);
    fullPageDiv = html.Element.mk('<div style="width:100%"/>').addChildren([
    
     fpcloseX = html.Element.mk('<div style="padding:3px,cursor:pointer;background-color:red;font-weight:bold;border:thin solid black;\
        font-size:12pt;color:black;float:right">X</div>'),
     fullPageText = html.Element.mk('<div style="padding-top:30px;width:90%;text-align:center;font-weight:bold"/>')
    ]);
    
  var buttonText = {"saveAsVariant":"Save","saveAsBuild":"Save","new":"Build New Item","open":"Open",
                    "addComponent":"Add Component"};

		    
  var dismissChooser = function () {
    ui.sendTopMsg(JSON.stringify({opId:"dismissChooser"}));
  }
  closeX.$click(dismissChooser);
  fpcloseX.$click(dismissChooser);
  
  mpg.addChild(itemsBrowser);
    mpg.addChild(fullPageDiv);
    noNewFolderTextEntered = 0;
    newFolderB.$click(function() {
      newFolderInput.$show();
      newFolderOk.$show();
      newFolderInput.$prop("value","Name for the new folder");
      noNewFolderTextEntered = 1;
    });
  function layout() {
    var awinwid = $(window).width();
    var awinht = $(window).height();
    var topht = ((itemsMode === "open")?0:newFolderLine.$height()) + modeLine.$height() + pathLine.$height();
    var botht = bottomDiv.$height() + errDiv1Container.$height();
    var itemsht = awinht - topht - botht - 60;
    itemsPanel.$css({height:itemsht+"px"});
    var eht = awinht - 10;
    mpg.$css({height:eht,top:"0px",width:"98%"});
  }
  // for accessibility from the parent window
  window.layout = layout;
  
  

  function setFilename(vl,ext) {
    fileName.$prop("value",vl);
    clearError();
  }
  
  function fileExists(nm) {
    var cv = selectedFolder[nm];
    if (cv) {
      if (typeof cv === "object") {
        return "folder"
      } else {
        return "file";
      }
    }
  }
  
  function clearError() {
    errDiv0.$hide();
    errDiv1.$hide();
    yesBut.$hide();
    noBut.$hide();
    openB.$show();
    layout();
  }
  
  function fullPageError(txt) {
    itemsBrowser.$hide();
    fullPageDiv.$show();
    if (typeof txt === "string") {
      fullPageText.$html(txt);
    } else {
      fullPageText.__element.append(txt);
    }
  }
  
  /*
  function showImage(path) {
    var url = om.itemHost+"/"+path;
    itemsDiv.$hide();
    forImage.$show();
    forImage.attr("src",url);
    var ht = itemsPanel.$height();
    var wd = itemsPanel.width();
    forImage.attr("height",ht-10);
    openB.$html('Close');
    imageIsOpen = true;
    itemName.$html("/" + om.pathLast(path));
  }
  
  
  function showJson(path) {
    var url = om.itemHost+"/"+path;    
      var viewPage = om.useMinified?"/viewdata":"/view_datad";
      window.top.location.href =viewPage+"?data=/"+path;
  }
  
  function closeImage() {
    if (imageIsOpen) {
      forImage.$hide();
      itemsDiv.$show();
      imageIsOpen = false;
      openB.$html('Open');
      setPathLine(selectedFolder);
      itemName.$html("");

    }
  }
  */
  //function setError(txt,yesNo,temporary,div1) {
  function setError(options) {
    if (typeof options === "string"){
      var txt  = options;
      var ed = errDiv0;
    } else {
      var div1 = options.div1;
      var txt = options.text;
      var temporary = options.temporary;
      var yesNo  = options.yesNo;
      var ed = div1?errDiv1:errDiv0;
    }
    ed.$html(txt);
    ed.$show();
    openB.$hide();
    if (yesNo) {
      noBut.$show();
      yesBut.$show();
    } else   {
      noBut.$hide();
      yesBut.$hide();
    }
    if (temporary) {
      setTimeout(function (){ ed.__element.$hide(500);},1500);
    }
    layout();
  }
  
  yesBut.$click(function () {afterYes();}); // after yes is set later
  noBut.$click(clearError);

  
  function openSelectedItem(pth) {
    var nm = om.pathLast(pth);
    if (om.endsIn(nm,".jpg")) {
      showImage(pth);
    } else if (om.endsIn(nm,".json")) {
      showJson(pth);
    } else {
      ui.sendTopMsg(JSON.stringify({opId:"openItem",value:pth}));
    }
  }
  
  
  /*
  function insertSelectedItem(nm) {
    insertIsImport = selectedFolder[nm] === "import";
    var insertPrototypeToo =(selectedItemKind === "codebuilt" || selectedItemKind === "import");

    var pth = selectedFolder._pj_pathAsString() + "/" + nm;
    if (insertIsImport) {
      insertUrl = pth;
    } else {
      insertUrl = "http://s3.prototypejungle.org/"+pth;
    }
    openB.$hide();
    if (insertPrototypeToo) {
      insertPrototype.$show();
      insertPrototypePath.$prop("value",nm+"P");
      insertInstanceTitle.$html("Insert instance:");
    } else {
      insertPrototype.$hide();
    }
    insertInstancePath.$prop("value",om.firstLetterToLowerCase(nm));

    itemsPanel.$hide();
    insertPanel.$show();
  }
  */
  
  //insertCancelB.click = function () {
  //  insertPanel.$hide();
  //  itemsPanel.$show();
  //  openB.$show();
  //}
  /*
  insertOkB.click = function () {
    om.error("OBSOLETE");
    if (selectedItemKind === "codebuilt" || selectedItemKind === "import") {
      var ppth = insertPrototypePath.$prop("value");
      if (!om.checkName(ppth)) {
        return;
      }
    } else {
      ppth = null;
    }
    var ipth = insertInstancePath.$prop("value");
    if (!om.checkName(ipth)) {
      return;
    }
    var there = parentPage.alreadyThere(ipth);
    if (there) {
      insertError.$html("There is already an item at ");
      insertErrorPath.$html(ipth);
      return;
    }
    parentPage.insertItem(insertUrl,ppth,ipth,function (rs) {
      parentPage.dismissChooser();
    });
  }
  */
    
  var pathAsString = function (nd,rt) {
    return om.pathToString(nd.__pathOf(rt));
  }


  var actOnSelectedItem = function () {
    var tloc = window.top.location;
    if (!selectedFolder) {
      folderError = true;
      setError({text:"No folder selected",div1:true});
      return;
    }
    if (aboveRepo(selectedFolder)) {
      folderError = true;
      setError({text:"You must save this item within an existing repo",div1:true});
      return;
    }
    var fpth = pathAsString(selectedFolder);
    if (itemsMode === "new" ||   itemsMode === "saveAsVariant" || itemsMode == "saveAsBuild") { // the modes which create a new item or file
      var nm = fileName.$prop("value");
      var pth = "/"+fpth +"/"+nm;
      var fEx = fileExists(nm);
      if (!nm) {
	    setError({text:"No filename.",div1:true});
	    return;
      }
      if ((itemsMode === "saveAsVariant") || (itemsMode === "saveAsBuild") || (itemsMode ==="new")) {
  	    if (itemsMode === "new") {
	      var topId =  "newItemFromChooser";
	    } else {
	      topId = itemsMode;
	    }
	    if (fEx === "file") {
	      setError({text:"This file exists. Do you wish to overwrite it?",yesNo:1,div1:true});
	      afterYes = function() {
	        ui.sendTopMsg(JSON.stringify({opId:topId,value:{path:pth,force:1}}));
	      }
	      return;
	    }
	    if (fEx === "folder") {
	      setError({text:"This is a folder. You cannot overwrite a folder with a file",div1:true});
	      return;
	    }
	    ui.sendTopMsg(JSON.stringify({opId:topId,value:{path:pth}}));
	    return;
      }
      if (itemsMode === "new") {
	    ui.sendTopMsg(JSON.stringify({opId:"newItemFromChooser",value:pth}));
        return;
      }
    }
    // ok now the options where one is dealing with an existing item
    if (!selectedItemName) {
      noItemSelectedError = true;
      setError({text:"No item selected",div1:true});
      return
    }
    var pth = "/"+fpth +"/"+selectedItemName;
    if (itemsMode === "open") {
      openSelectedItem(pth);
      return;
    }
    if (itemsMode === "insert") {
      if (selectedItemName) {
	    if (selectedItemKind === "image" || selectedItemKind === "data") {
	      setError("Internal error; insert mode should not allow selection of image or data"); // this cannot happen
	    } else {
	    insertSelectedItem(selectedItemName);
	    }
      } else {
        setError({text:"No item selected",div1:true});
      }
      return;
    }
    if (itemsMode === "addComponent") {
      var pth = pathAsString(selectedFolder) + "/" + selectedItemName;
      ui.sendTopMsg(JSON.stringify({opId:"addComponent",value:pth}));
    }
  }
  
  openB.$click(actOnSelectedItem);

  function pathsToTree (fls) {
    var sfls = fls.map(function (fl) {return fl.split("/")});
    var rs = {};
    sfls.forEach(function (sfl) {
      var  cnd = rs;
      var ln = sfl.length;
      for (var i=0;i<ln;i++) {
        var nm = sfl[i];
        var nnd = cnd[nm];
        if (!nnd) {
          if (i === (ln-1)) {
            cnd[nm] = "leaf";
          } else {
            cnd[nm] = nnd = {};
          }
        }
        cnd = nnd;
      }
    });
    return rs;
  }
  
  function findKind(tr) {
    for (var k in tr) {
      if (om.beginsWith(k,"kind ")) {
	    return k.substr(5);
      }
    }
    if (tr.view) {
      return "leaf";// no kind specified/ shouldn't happen when everything is rebuilt
    }
  }
  
  //pick out the items 
  function itemize(tr,includeVariants,publicOnly) {
    var rs = {};
    var  hasch = 0;
    var knd;
    for (var k in tr) {
      var st = tr[k];
      if (typeof st === "object") {
	    var knd = findKind(st);
        if (knd) {
          var aknd = (knd.indexOf("variant")>0)?"variant":"codebuilt";
          if (publicOnly) {
            if (knd.indexOf("public")>0) {
              hasch = 1;
              rs[k] = aknd;
            }
          } else {
	        if (includeVariants || (aknd === "codebuilt")) {
              hasch = 1;
              rs[k] = aknd;
            }
	      }
        } else {
          var ist = itemize(st,includeVariants,publicOnly);
          if (ist) {
            rs[k] =  ist;
            hasch = 1;
          }               
        }
      } 
    }
    if (hasch) {
      return rs;
    }
  }
  
  function noRepos() {
    return !handle || !fileTree[handle];
  }
  
  function populateEmptyTree() {
    var rp = om.DNode.mk();
    rp.set("repo0",om.DNode.mk());
    return rp;
    //fileTree.set(handle,rp);
    //return true;
  }
  
  
  
  function suggestedFolder(path,forImage) {
    var sp = om.stripInitialSlash(path).split("/");
     var ln = sp.length;
    var phandle = sp[0];
    var owner = phandle === handle;
    var nm = sp[ln-1];

    if (owner) {
      if (codeBuilt) {
	    sp.pop(); //pop off name
	    if (itemsMode === "saveAsVariant") {
	      sp.push("variants");
	      sp.push(nm);
	    }
	    return sp.join("/");
      } else {
	    sp.pop();
	    return sp.join("/");
      }
    } else {
      sp.pop();
      sp[0] = handle;
      var pth = sp.join("/");
      if ((itemsMode === "saveAsVariant") && codeBuilt) {
        return pth + "/variants"
      } else {
        return pth;
      }
    }
  }
  
  
  function suggestedName(srcpath,destFolder) {
    if (itemsMode === "saveAsVariant") {
      var nm = "v0";
    } else {
      var nm = om.pathLast(srcpath);
    }
    var nmidx = maxIndex(nm,Object.getOwnPropertyNames(destFolder),forImage) + 1;
    if (nmidx === 0) {
      return nm;
    } else {
      return stripDigits(nm) + nmidx;
     
    }
  }
  
   
  // if the current item is a non-variant, we need to add the appropriate variants branch into the tree, if not there already
  // this is a lifted (ie DNode tree)
  // the variants branch is at repo/variants/<same path as item>
  function addVariantsBranch(tr,path) {
    var rs=om.DNode.mk();
    var nm = om.pathLast(path);
    var pth = handle+"/variants/"+nm;
    tr.set(pth,rs);
    return rs;
   
  }
  var reservedFolderNames = {"om":1,"geom":1,"dom":1,"ws":1,"tree":1,"page":1};
  
  function addNewFolder(nm) {
    var ck = om.checkName(nm);
    if (!ck) {
      setError('Names may contain only letters, numerals, and the underbar or dash, and may not start with a numeral');
      return;
    }
    var sf = selectedFolder;
    var apth = sf.__pathOf();
    if (apth.length === 2) { // we are at the level just below the repo, where conflicts would arise
      if (reservedFolderNames[nm]) {
	setError(nm+" is a reserved name at this level of the hierarchy");
        return;
      }
    }
    if (sf[nm]) {
      setError('There is already a folder by that name');
      return;
    }
    var nnd  = om.DNode.mk();
    sf.set(nm,nnd);
    setSelectedFolder(sf);
  }
  
  var nff = function () {
    var nm = newFolderInput.$prop("value");
    if (nm) {
      addNewFolder(nm);
    }
    newFolderInput.$hide();
    newFolderOk.$hide();
    
  };
  newFolderOk.$click(nff);
  newFolderInput.$enter(nff);
  // finds the max int N among nms where nm has the form vN
  function digitsStart(v) {
    var ln = v.length;
    var rs = ln-1;
    while (rs >= 0) {
      var cc = v.charCodeAt(rs);
      if ((47 < cc) && (cc < 58)) { // a digit
        rs = rs -1;
      } else {
        return rs+1;
      }
    }
    return 0;
  }

  function stripDigits(v) {
    var ds = digitsStart(v);
    return v.substr(0,ds);
  }
// if v is abc23, find the max digitwise extension abc in nms (eg 234 for ["oo","abc12","aa","abc234"]
// this is for autonaming
  function maxIndex(v,nms,hasExtension) {
    var rs = -1;
    var ds = digitsStart(v);
    var nds = v.substr(0,ds); // the part before digits at end
    nms.forEach(function (inm) {
      if (fc === "") return;
      var fc = inm[0];
      if (hasExtension) {
	    var nm = om.beforeChar(inm,".");
      } else {
	    nm = inm;
      }
      var snm = stripDigits(nm);
      if (snm === nds) {
	    if (snm === nm) {
	      var idx = 0;
	    } else {
          var idxs = nm.substr(ds);
          var idx = parseInt(idxs);
	    }
        if (!isNaN(idx)) {
          rs = Math.max(idx,rs);
        }
      }
    });
    return rs;
  }
  
 
  
  function listHandle(hnd,cb) {// __get the static list for the sys tree
    var url = "http://prototypejungle.org.s3.amazonaws.com/"+hnd+" list.js";
    function ajaxcb(rsp) {
      if (rsp.status === 200) {
	    var rs = rsp.responseText;
	    if (rs === "") {
	      rs = hnd+"/repo0\n";
	    }
	    cb(undefined,hnd,rs)
      } else {
	    cb(rsp.status);
      }
    }
    var opts = {crossDomain: true,dataType:"json",url: url,success:ajaxcb,error:ajaxcb};
    $.ajax(opts);
  }
  
  function listHandles(hnds,cb) {
    var ln = hnds.length;
    var n = 0;
    var rs = [];
    var hCb = function (err,h,dts) {
      if (err) {
	    cb(err);
	    return;
      }
      rs = rs.concat(dts.split("\n"));
      n++;
	  cb(undefined,h,dts.split("\n"),n==ln);
      if (n<ln) listHandle(hnds[n],hCb);
    }
    listHandle(hnds[0],hCb);
  }
  
  var stripDomainFromUrl = function (url) {
    var r = /^http\:\/\/[^\/]*\/(.*)$/
    var m = url.match(r);
    if (m) {
      return m[1];
    }
  }
  // autonaming variant.
  function initialVariantName(forImage) {
    if (isVariant) {
      // then overwrite is the default
      return {resave:true,name:om.pathLast(currentItemPath)};
    }
    var nmidx = maxIndex(forImage?"i":"v",selectedFolder.ownProperties(),forImage) + 1;
    return {name:forImage?"i"+nmidx+".jpg":"v"+nmidx,resave:false}
    var ownr = om.beforeChar(currentItemPath,"/"); // the handle of the user that created the current item
    var nm = om.pathLast(currentItemPath);
    var wsName = om.root.__name; //will be the same as name for the directly-built
    if (handle === ownr) {
      //store the variant nearby in the directory structure, or resave it is a variant already
      var crpath = om.pathExceptFirst(currentItemPath);// relative to handle
      var crdir = om.pathExceptLast(crpath);
      var dir = crdir+"/variants/"+nm+"/"; 
    } else {
      dir = "variants/"+ownr+"/"+wsName+"/";
    }
    var cvrs = om.evalPath(itr,h+"/"+dir);
    if (cvrs) {
      var nmidx = maxIndex(forImage?"i":"v",Object.getOwnPropertyNames(cvrs))+1;
      // var nmidx = maxIndex(forImage?"i":"v",cvrs.ownProperties())+1;
   } else {
      nmidx = 0;
    }
    return {resave:false,path:dir+"v"+nmidx};
  }
  
  var firstPop = true;
  var modeNames = {"new":"Build New item","open":"Inspect an Item",
                   "saveAsBuild":"Fork","saveAsVariant":"Save Current Item as Variant","addComponent":"Add Component"};
  function popItems(item,mode,icodeBuilt) {
    debugger;
    codeBuilt = !!icodeBuilt; // a global
    insertPanel.$hide();
    //deleteB.$hide(); for later implementation
    itemsMode = mode;
    fileNameExt.$html((itemsMode === "newData")?".json":(itemsMode === "saveImage")?".jpg":"");
    if ((mode === "open") ||  (mode==="insert") || (mode=="addComponent")) {
      newFolderLine.$hide();
      fileNameSpan.$hide();
      fileName.$hide();
   } else {
      newFolderLine.$show();
      fileNameSpan.$show();
      fileName.$show();
    }
    modeLine.$html(modeNames[itemsMode]);
    handle = localStorage.handle;
    if (!handle) {
      if ((mode !== "open")&&(mode !== "addComponent")) {
        fullPageError("You need to be signed in to build or save items");
        layout();
        return;
      }
    }
    layout();
    initVars();
    var btext = buttonText[itemsMode];
    openB.$html(btext);
    clearError();
    if (firstPop) {
      fileName.addEventListener("keyup",function () {
        var fs = fileName.$prop("value");
        if (om.checkPath(fs,itemsMode==="saveImage")) {
          clearError();
        } else {
          setError({text:"The path may not contain characters other than / (slash) ,- (dash),_ (underbar) and the digits and letters",div1:true});  
        }
      });
    }
    var includeSys = (mode === "open")  || (mode==="addComponent");
    var prefixes = (handle==="sys" || !handle)?["sys"]: includeSys?[handle,"sys"]:[handle];
    var whenFileTreeIsReady = function () {
      if ((itemsMode==="saveAsVariant") || (itemsMode === "saveAsBuild")) {
     	if (item) {
          currentItemPath = stripDomainFromUrl(item);
	      var folderPath = suggestedFolder(currentItemPath,(itemsMode === "saveImage"));
	    } else {
	      newItem = true;
	      folderPath = handle+"/repo0/assemblies"; //todo make this the last repo
	    }
	debugger;
        var folder = om.createPath(fileTree,folderPath.split("/"));
        setSelectedFolder(folder);
	    var ivr = suggestedName(currentItemPath,folder,itemsMode === "saveImage");
        setFilename(ivr);
      } else {
	    var lp = (itemsMode==="insert")?localStorage.lastInsertFolder:localStorage.lastFolder;
	    if (lp && ((itemsMode==="open") || (handle === "sys") || (!om.beginsWith(lp,'sys')) )) { // can't write into non-owned folders
	      var lfld = om.evalPath(fileTree,lp);
	      if (lfld) {
	        setSelectedFolder(lfld);
	        return;
	      }
	    }
	    if ((itemsMode==="open") && noRepos()) {
	      var folderPath = newUserInitialPath;
	      setSelectedFolder(folderPath);
	      return;
	    } 
        if (handle === "sys") {
	      var hnd = fileTree[handle];
          if (!hnd) {
            hnd = fileTree.set(handle,om.DNode.mk());
          }
          setSelectedFolder(hnd);
	    } else {
	      if (itemsMode === "insert") {
	        setSelectedFolder(om.evalPath(fileTree,"sys/repo0/geom"));
	      } else {
            setSelectedFolder(fileTree);
	      }
        }
      }
    }
    function genHandleTree(h,itemPaths) {
      var tr  = pathsToTree(itemPaths);
      //var includeImages = (itemsMode === "open") || (itemsMode === "saveImage");
      //var includeData = (itemsMode === "open")  || (itemsMode === "newData");
      var includeVariants = (itemsMode !== "insert");
      var restrictToPublic = h !== handle;
      //var itr = itemize(tr,includeVariants,restrictToPublic);//includeData,includeVariants); // this variant restricts to public; putback
      var itr = itemize(tr,includeVariants,false);//includeData,includeVariants); // this variant restricts to public; putback
     
      if (itr) {
        return om.lift(itr[h]);
        
      } else {
        return undefined;
      }
    }
    
    function installTree(h,itemPaths) {
      var ht  = genHandleTree(h,itemPaths);
      if ((h === handle) && (itemsMode!=="open") && (itemsMode!=="addComponent") && (!ht)) {
        ht = populateEmptyTree();
      }
      fileTree.set(h,ht);
    }
    //var itemPaths = [];
    fileTree = om.DNode.mk();
    //var lastp = prefixes[prefixes.length-1];
    listHandles(prefixes,function (e,h,fls,done) {
      var pb = handle !== h;
      installTree(h,fls);
      if (done) {
        whenFileTreeIsReady();
      }
    });
  }

  
  function selectedItemPath() {
    var fpth = pathAsString(selectedFolder);
    return fpth + "/" + selectedItemName;
  }


  
  function selectItemLine(iel) {
    if (iel === selectedItemLine) return;
    om.log('chooser','selecting item line');
    if (typeof iel === "string") {
      var el = itemLinesByName[iel];
    } else {
      el = iel;
    }
    if (selectedItemLine) {
      selectedItemLine.$css({'background-color':'white'});
    }
    el.$css({'background-color':highlightColor});
    selectedItemLine = el; 
  }

  setPathLine = function (nd) {
    var pth = nd.__pathOf();
    var pel = pathLine.__element;   
    pathLine.$empty();
    first = 0;
    if (1 || itemsMode === "open") {
      pth.unshift(om.itemHost);
      var first = 1;
    } 
    var cnd = fileTree;
    pth.forEach(function (nm) {
      if (first) {
        first = false;
      } else {
        var slel = html.Element.mk('<span>/</span>');
        pathLine.push(slel);
        cnd = cnd[nm];
      } 
      var lcnd = cnd; // so it gets closed over
      var el = html.Element.mk('<span class="pathLineElement">'+nm+'</span>');
      el.$click(function () {
        setSelectedFolder(lcnd,1);
      });

      pathLine.push(el);
    });
  }
  
  function shiftClickTimes() {
    lastClickTime0 = lastClickTime1;
    lastClickTime1 = lastClickTime2;
    lastClickTime2 = Date.now();
   
  }
  
  // the clicking is too fast from the point of view of a double click, if the earlier click interval is too short
  function checkQuickClick (fromDbl) {
    var tm = Date.now();
     
    if (lastClickTime2) {
      var itv = tm - lastClickTime2;
      om.log('chooser',tm-baseTime,"click interval",itv,"dbl",fromDbl,"lct0",lastClickTime0-baseTime,"lct1",
		  lastClickTime1-baseTime,"lct2",lastClickTime2-baseTime);
      if (itv < minClickInterval) {
        if (fromDbl) { // we care how long it was since the click prior to the double click 
	      if (lastClickTime0) {
	        var interval = tm - lastClickTime0;
	        om.log('chooser',"double click interval",interval);
	        if (interval < minClickInterval) {
	          om.log('chooser',"double click too quick");
	          return true;
	        }
	      }
	    } else {
	      om.log('chooser',"click too quick");
	      shiftClickTimes(); 
	      return true;
	    }
      }
    }
    if (!fromDbl) shiftClickTimes();    
  }
  
  setSelectedItem = function(nm) {
    selectedItemName = nm;
    if (noItemSelectedError) {
      clearError();
      noItemSelectedError = false;
      openB.$show();
    }
    if (!nm) {
      //deleteB.$hide(); for later implementation
      selectedItemKind =  undefined;
      return;
    }
    selectedItemKind = selectedFolder[nm];
    om.log('chooser',"Selected Kind",selectedItemKind);
    //for later implementation
    /*
    if (itemsMode === "open") {
      if (fhandle ===  handle) {
        deleteB.$show();
      } else {
	    deleteB.$hide();
      }
    } */
    
  }
  aboveRepo = function (nd) {
    return ((nd === fileTree) || (nd.__parent === fileTree));
  }
  
  setSelectedFolder = function (ind,fromPathClick) {
    if (typeof ind === "string") {
      var nd = om.evalPath(fileTree,ind);
    } else {
      nd = ind;
    }
    if (itemsMode === "new"  && !fromPathClick) {
      if (aboveRepo(ind)) {
        nd = fileTree[handle].repo0;
      }
    }
    var apth = nd.__pathOf();
    var pth = om.pathToString(apth);
    fhandle = apth[0];

    if (!((itemsMode === "open" ) || (itemsMode==="rebuild"))) {
      var atTop = nd === fileTree;
      if (atTop) {
        newFolderB.$hide();
        newFolderInput.$hide();
        newFolderOk.$hide();
      } else {
        newFolderInput.$hide();
        newFolderOk.$hide();
        var atHandle = nd === fileTree[handle];
        if (atHandle) {
          newFolderB.$html("New Repo");
        } else {
          newFolderB.$html("New Folder");
        }
	    newFolderB.$show();
      }
    }
    selectedItemName = undefined;
    selectedItemLine = undefined;
    selectedFolder = nd;
    if (itemsMode === "insert") {
      localStorage.lastInsertFolder = pth;
    } else {
      localStorage.lastFolder = pth;
    }
    setPathLine(nd);
    if (folderError) {
      clearError();
      folderError = false;
    }
    //var items = om.ownProperties(nd);
    var items = om.treeProperties(nd,true);
    om.log('chooser',"selected ",nd.__name,items);
    var ln = items.length;
    var numels = itemLines.length;
    for (var i=0;i<ln;i++) {
      var nm = items[i];
      var ch = nd[nm];
      var isFolder =  typeof ch === "object";
      var imfile = isFolder?"folder.ico":"file.ico"
      var el = itemLines[i];
      if (el) {
        //var sp = html.Element.mk('span',el);
        el.nm.$html(nm);
        el.im.$attr('src','/images/'+imfile);
	el.removeEventListener('click');
	el.removeEventListener('dblclick');
        //el.off('click dblclick');
        el.$show();
       // el.item.$css({'background-color':'white'});
        el.$css({'background-color':'white'});
      } else {
	var imel = html.Element.mk('<img style="cursor:pointer;background-color:white" width="16" height="16" src="/images/'+imfile+'"/>');
	var nmel =  html.Element.mk('<span id="item" class="chooserItem">'+nm+'</span>');
        var el = html.Element.mk('<div/>');
	el.set("im",imel);
	el.set("nm",nmel);
	itemLines.push(el);
        itemsDiv.push(el);
      }
      itemLinesByName[nm] = el;

      // need to close over some variables
      var clf = (function (el,nm,isFolder) {
        return function () {
	      if (checkQuickClick()) {
	        return;
	      }
          if (isFolder) {
            var ch = selectedFolder[nm];
            setSelectedFolder(ch);
            selectedItemName = undefined;
          } else {
	        setSelectedItem(nm);
            selectItemLine(el);
          }
        }
      })(el,nm,isFolder);
      el.$click(clf);
      if (!isFolder  && (itemsMode==="open")) {
        var dclf = (function (nm,pth) {
          return function () {
	        if (!checkQuickClick(1)) {
	          actOnSelectedItem();
	        }
          }
        })(nm,pth); 
        el.$dblclick(dclf);
      }
    }
    for (var i=ln;i<numels;i++) {
      itemLines[i].$hide();
    }
    setFilename("");
  }
  
  // for later implementation
  /*
  deleteB.click = function () {
    var nm = selectedItemName;
    var fpth = selectedFolder.__pathAsString();
    var pth = fpth + "/" + nm;
    afterYes = function() {
      delete selectedFolder[nm];
      setSelectedFolder(selectedFolder);
      page.sendTopMsg(JSON.stringify({opId:"deleteItem",value:{path:pth}}));
       
    };
    setError({text:"Are you sure you wish to delete "+nm+"? There is no undo",yesNo:1,div1:true});
  }
  */
  function checkNamesInInput (ifld,erre) {
    ifld.__element.keyup(function () {
      var fs = ifld.$prop("value");
      if (!fs ||  om.checkName(fs)) {
        erre.$html("");
      } else {
        erre.$html("The name may not contain characters other than digits, letters, and the underbar");  
      }
    })
  }
  
  

  ui.genMainPage = function (options) {
    debugger;
    ui.addMessageListener();
    if (__pj__.mainPage) return;
    __pj__.set("mainPage",mpg);
    mpg.draw(document.body);
    mpg.$css({width:"100%"});
    //itemsBrowser.$css({width:"100%","height":"9-%"});
    var clearFolderInput = function () {
      if (noNewFolderTextEntered) {
	newFolderInput.$prop("value","");
	noNewFolderTextEntered = 0;
      }
    }
    newFolderInput.addEventListener("keydown",clearFolderInput);
    newFolderInput.addEventListener("mousedown",clearFolderInput);
    newFolderInput.addEventListener("keyup",function () {
      var fs = newFolderInput.$prop("value");
      if (!fs ||  om.checkName(fs)) {
        clearError();
      } else {
        setError({text:"The name may not contain characters other than / (slash) ,- (dash),_ (underbar) and the digits and letters",div1:false});  
      }
    });

    popItems(options.item,options.mode,options.codeBuilt);
  }
})(prototypeJungle);
