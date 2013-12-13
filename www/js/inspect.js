// at some point, this code will be reworked based on a structured description of the desired DOM rather than construction by code
// in any case, a rewrite is needed - not a clean body of code
(function (__pj__) {
  var actionHt;
  var om = __pj__.om;
  var dom = __pj__.dom;
  var geom = __pj__.geom;
  var draw = __pj__.draw;
  var tree = __pj__.tree;
  var lightbox = __pj__.lightbox;
  var page = __pj__.page;
  var dataOps = __pj__.dataOps;
  var treePadding = 10;
  var bkColor = "white";
  var docDiv;
  var minWidth = 1000;
  var plusbut,minusbut;
  var isTopNote;
  var flatMode;
  var flatInputFont = "8pt arial";
  // flatMode: no trees in the workspace or proto windows.  Here's code for that
  var itemName,fileBut,viewSourceBut,customBut,viewDataBut,aboutBut,shareBut,noteDiv,helpBut,stickyBut,vbut;
  var topbarDiv,cols,canvasDiv,topNoteDiv,uiDiv,actionDiv,obDivTop,obDivTitle,ctopDiv,shareBut,upBut,cfBut;
  var inspectDom = 0;
  var testDom =  dom.El('<div style="background-color:white;border:solid thin black;display:inline-block">TEST DOM');
  om.inspectMode = 1; // if this code is being loaded, inspection is happening
  
  
  
   var jqp = __pj__.jqPrototypes;
   // the page structure
  var mainTitleDiv = dom.wrapJQ('#mainTitle');
  // note that in a few cases, the new slightly more compact method of making a dom.El from a parsed string is employed. 
  var mpg = dom.wrapJQ("#main",{style:{position:"absolute","margin":"0px",padding:"0px"}}).addChildren([
    topbarDiv = dom.wrapJQ('#topbar',{style:'position:absolute;left:0px;background-color:bkColor;margin:0px;padding:0px'}).addChildren([
      topNoteDiv = dom.El({tag:"div",id:"topNote",style:{position:"absolute","top":"50px",left:"215px",font:"11pt arial italic","cursor":"pointer"}}),
      actionDiv = dom.El('<div id="action" style="position:absolute;margin:0px;overflow:none;padding:5px;height:20px"/>').addChildren([
        itemName = dom.El({tag:"span",html:"Name",style:{overflow:"none",padding:"5px",height:"20px"}}),
        fileBut = jqp.ubutton.instantiate().set({html:"File"}),
        customBut = jqp.ulink.instantiate().set({html:"Arrange"}),
        viewSourceBut = jqp.ulink.instantiate().set({html:"Source"}),
        viewDataBut = jqp.ulink.instantiate().set({html:"Data"}),
        aboutBut = jqp.ubutton.instantiate().set({html:"About"}),
        shareBut = jqp.ubutton.instantiate().set({html:"Share"}),
        helpBut = jqp.ubutton.instantiate().set({html:"Help"}),
        stickyBut = jqp.ubutton.instantiate().set({html:"Sticky Hovers"}),
      ]),
      ctopDiv = dom.wrapJQ('#topbarInner',{style:{float:"right"}})
    ]),
    
    cols =  dom.El({tag:"div",id:"columns",style:{left:"0px",position:"relative"}}).addChildren([
      
      canvasDiv =  dom.El('<div style="postion:absolute;background-color:white;border:solid thin black;display:inline-block"/>').addChildren([
        vbut = jqp.button.instantiate().set({html:"Viewer",style:{position:"absolute",top:"0px",left:"10px"}}),
        tree.noteDiv = noteDiv = dom.El({tag:"div",html:"Click on things to inspect them",style:{"font":"10pt arial","background-color":"white",position:"absolute",top:"0px",
                         left:"90px","padding-left":"4px","border":"solid thin black"}})
       // plusbut = jqp.button.instantiate().set({html:"+",style:{position:"absolute",top:"0px"}}),
       // minusbut = jqp.button.instantiate().set({html:"&#8722;",style:{position:"absolute",top:"0px"}})
        
     ]),
      
      uiDiv = dom.El({tag:"div",id:"uiDiv",style:{position:"absolute","background-color":"white",margin:"0px",padding:"0px"}}).addChildren([
        tree.obDiv = dom.El({tag:"div",style:{position:"absolute","background-color":"white",border:"solid thin black",
                                overflow:"auto","vertical-align":"top",margin:"0px",padding:treePadding+"px"}}).addChildren([
          obDivTop = dom.El({tag:"div",style:{"margin-bottom":"10px","border-bottom":"solid thin black"}}).addChildren([
            obDivTitle = dom.El({tag:"span",html:"Workspace",style:{"margin-bottom":"10px","border-bottom":"solid thin black"}}),
            viewTreeBut = jqp.smallButton.instantiate().set({html:"View Workspace",style:{"margin-left":"40px",hidden:1}}),
            page.upBut = upBut = jqp.smallButton.instantiate().set({html:"Up",style:{"margin-left":"40px",hidden:1}})
          ]),
          tree.obDivRest = dom.El({tag:"div",style:{overflow:"auto"}}),
        ]),
        tree.protoDiv = dom.El({tag:"div",style:{position:"absolute","background-color":"white",margin:"0px","border":"solid thin black",
                               overflow:"auto",padding:treePadding+"px"}}).addChildren([
          dom.El({tag:"div",style:{"width":"100%","border-bottom":"solid thin black"}}).addChildren([
            tree.protoDivTitle = dom.El({tag:"span",html:"Prototype Chain"})
            // cf (computedField) buttons will come back in future
            //tree.cfBut = jqp.smallButton.instantiate().set({html:"Compute this field",style:{"background-color":"#dddddd","color":"red","float":"right","margin-left":"4px","top":"0px"}})
          ]),
          tree.protoDivRest = dom.El({tag:"div",style:{"border-top":"thin black",overflow:"auto"}})
        ])
      ])
    ])
  ]);

 // tree.cfBut.click = tree.cfButClick;
  
   var cnvht = draw.hitCanvasDebug?"50%":"100%"
  var theCanvas;
  // when inspecting dom, the canvas is a div, not really a canvas
 /* function addCanvas(canvasDiv,contents) {
    var theCanvas;
    var inspectDom = false;
    if (inspectDom) { // this code is not in use, but may come back
      var cnv = dom.El({tag:"div",attributes:{border:"solid thin green",width:"200",height:"220"}});  //TAKEOUT replace by above line
      canvasDiv.addChild("canvas", cnv);
      draw.enabled = false;
    } else {
      var cnv = dom.El({tag:"canvas",attributes:{border:"solid thin green",width:"200",height:"220"}});  //TAKEOUT replace by above line
      canvasDiv.addChild("canvas", cnv);
      var hitcnv = dom.El({tag:"canvas",attributes:{border:"solid thin blue",width:200,height:200}});
      //mpg.addChild("hitcanvas", hitcnv);
      canvasDiv.addChild("hitcanvas", hitcnv);
      //var htmlDiv = canvasDiv; //dom.El({tag:"div",style:{position:"absolute",border:"solid red",width:"10px",height:"10px",top:"0px",left:"0px"}});
      //canvasDiv.addChild("html",htmlDiv);
      theCanvas = draw.Canvas.mk(cnv,hitcnv,canvasDiv);
      theCanvas.isMain = 1;
      theCanvas.dragEnabled = 1;
      theCanvas.panEnabled = 1;
      theCanvas.contents = contents;
      //draw.addCanvas(theCanvas);
      return theCanvas;
    }
    
  }
  */
  
  viewTreeBut.hide();

  draw.canvasWidth = 600;
  draw.canvasHeight = 600;;
  tree.codeToSave = "top";
  
  
   // there is some mis-measurement the first time around, so this runs itself twice at fist
  var firstLayout = 1;
  function layout(noDraw) { // in the initialization phase, it is not yet time to draw, and adjust the transform
    // aspect ratio of the UI
    var ar = 0.5;
    var pdw = 30; // minimum padding on sides
    var vpad = 40; //minimum sum of padding on top and bottom
    var cdims = geom.Point.mk(draw.canvasWidth,draw.canvasHeight);
    var awinwid = $(window).width();
    var awinht = $(window).height();
    if (awinwid < minWidth) {
      var ppageWidth = minWidth; // min size page
      var lrs = pdw;
    } else if (awinht < ar * minWidth) {
      var ppageWidth = minWidth; // min size page
      var lrs = 0.5 * (awinwid - minWidth) +  pdw;
    } else { // enough room
      var twd =  awinht/ar; 
      if (twd < awinwid) { // extra space in width
        var lrs = 0.5 * (awinwid-twd) + pdw;
        var ppageWidth = twd;
      } else {
        var lrs = pdw;
        var ppageWidth = awinwid;
      }
    }
    var ppageHeight = ar * ppageWidth;
    var pageWidth = ppageWidth - 2 * pdw;
    var pageHeight = ppageHeight - vpad;
    
    if (page.includeDoc) {
      var docTop = pageHeight * 0.8 - 20;
      pageHeight = pageHeight * 0.8;
      var docHeight = awinht - pageHeight - 30;
    }
    var canvasWidth = pageWidth/2;
    var uiWidth = pageWidth/2;
    var treeOuterWidth = uiWidth/2;
    
    var treeInnerWidth = treeOuterWidth - 2*treePadding;
    mpg.css({left:lrs+"px",width:pageWidth+"px",height:(pageHeight-22)+"px"});
    var topHt = topbarDiv.height();
    
    cols.css({left:"0px",width:pageWidth+"px",top:topHt+"px"});
    uiDiv.css({top:"0px",left:canvasWidth+"px",width:(canvasWidth + "px")})
    ctopDiv.css({"padding-top":"10px","padding-bottom":"20px","padding-right":"10px",left:canvasWidth+"px",top:"0px"});

    actionDiv.css({width:(uiWidth + "px"),"padding-top":"10px","padding-bottom":"20px",left:"200px",top:"0px"});

    var actionHt = actionDiv.__element__.outerHeight()+(isTopNote?25:0);
    topbarDiv.css({height:actionHt,width:pageWidth+"px",left:"0px"});
    var canvasHeight = pageHeight - actionHt -30;
    if (draw.enabled) {
      draw.mainCanvas.div.attr({width:canvasWidth,height:canvasHeight}); 
      draw.mainCanvas.hitDiv.attr({width:canvasWidth,height:canvasHeight});
      //draw.mainCanvas.htmlDiv.css({width:canvasWidth,height:canvasHeight});

    } else {
      canvasDiv.css({width:canvasWidth+"px",height:canvasHeight+"px"});
    }
    var treeHt = 5+ canvasHeight - 2*treePadding;
    tree.myWidth = treeInnerWidth;
    tree.obDiv.css({width:(treeInnerWidth   + "px"),height:(treeHt+"px"),top:"0px",left:"0px"});
    tree.protoDiv.css({width:(treeInnerWidth + "px"),height:(treeHt+"px"),top:"0px",left:(treeOuterWidth+"px")});
    draw.canvasWidth = canvasWidth;
    draw.canvasHeight = canvasHeight;
    if (docDiv) docDiv.css({left:"0px",width:pageWidth+"px",top:docTop+"px",overflow:"auto",height:docHeight + "px"});
    theCanvas.positionButtons(canvasWidth);
   // plusbut.css({"left":(canvasWidth - 50)+"px"});
   // minusbut.css({"left":(canvasWidth - 30)+"px"});
    noteDiv.css({"width":(canvasWidth - 140)+"px"});
  
    if (firstLayout) {
      firstLayout = 0;
      layout();
      return;
    }
    if (draw.mainCanvas) {
      var rtt = draw.mainCanvas.transform();
      if (rtt  &&  !draw.autoFit && !noDraw) {
        draw.mainCanvas.adjustTransform(rtt,cdims);
        draw.refresh();
      }
    }

}

  
  // now this is an occaison to go into flat mode
  function setInstance(itm) {
    if (!itm) {
      return;
    }
    if (!flatMode) {
      setFlatMode(true);
      viewTreeBut.show();
      upBut.show();
    }
    tree.showItem(itm,itm.selectable?"expand":"fullyExpand");
    tree.showProtoChain(itm);
    upBut.show();
    return;
  }
  
  draw.selectCallbacks.push(setInstance);

  
  page.elementsToHideOnError = [];
 
 
  
 

  // a prototype for the divs that hold elements of the prototype chain
  
 tree.protoSubDiv = dom.El({tag:"div",style:{"background-color":"white","margin-top":"20px",border:"solid thin green",
                               padding:"10px"}});

  var errorDiv =  dom.wrapJQ($('#error'));
  
  
  page.elementsToHideOnError.push(cols);
  
 
  
  vbut.click = function () {
    var viewPage = om.useMinified?"/view":"viewd";
    var url = viewPage + "?item="+page.itemUrl;
    if (om.root.dataSource) {
      url = url + "#data="+om.root.dataSource;
    }
    location.href = url;
  }
    page.elementsToHideOnError.push(actionDiv);

 
  docDiv =  dom.El({tag:"iframe",attributes:{src:"chartdoc.html"},style:{border:"solid thin black",position:"absolute"}});
  page.elementsToHideOnError.push(docDiv);
  tree.obDiv.click = function () {
    dom.unpop();
  };
  
 
  tree.protoDiv.click = function () {
    dom.unpop();
  };
  
  function setFlatMode(vl) {
    flatMode = vl;
    tree.enabled = !vl;
    obDivTitle.__element__.html(flatMode?"Selected Item":"Workspace");
    if (!vl) {
      tree.initShapeTreeWidget();
      tree.adjust();
      //tree.selectPathInTree(om.selectedNodePath);
    }
  }
  
  
  tree.setNote = function(k,note) {
    var h = '<b>'+k+':</b> '+note
    mpg.lightbox.pop();
    mpg.lightbox.setHtml(h)
    return;
  }
  
  function mkLink(url) {
     return '<a href="'+url+'">'+url+'</a>';
   } 

   

  var annLink = dom.El({'tag':'div'});
  annLink.addChild('caption',dom.El({'tag':'div'}));
  annLink.addChild('link',dom.El({'tag':'div'}));
// notes are set for a save, and only displayed when showing that saved item, not further saves down the line

  function showTopNote() {
    var note = om.root.__topNote__;
    if (note) {
      isTopNote = true;
      var svc = om.root.get("__saveCountForNote__");
      if (svc ===om.saveCount()) {
         topNoteDiv.setHtml(note);
      }
    }
  }
  
  page.setTopNote = function (txt) {
    om.root.__topNote__ = txt;
    om.root.__saveCountForNote__ = page.saveCount()+1;
    //code
  }
  
  
  function inspectItem(pth) {
    var loc = "/inspect?item=http://s3.prototypejungle.org/"+pth;
    location.href = loc;
  }
 
  // called from the chooser
  
  function popItems(mode) {
    if (mpg.lightbox) {
      mpg.lightbox.dismiss();
    }
    var lb = mpg.chooser_lightbox;
    lb.pop(undefined,undefined,true);//without topline
    var fsrc = om.useMinified?"chooser2.html":"chooser2d.html"; // go to dev version from dev version
    lb.setHtml('<iframe width="100%" height="100%" scrolling="no" id="chooser" src="'+fsrc+'?mode='+mode+'"/>');
  }
  var functionToEdit;
  function editorWindow() {
    var ifrm = page.editorIframe;
    return ifrm[0].contentWindow;
  }
  window.fromEditor = function (msg,value) {
    if (msg == "ready") {
      var w = editorWindow();
      w.initializeEditor(page.editorRect,functionToEdit);
    } else if (msg === "newCode") {
      var pth = functionToEdit[1];
      var toe = "prototypeJungle."+pth +" = "+value;
      try {
        eval(toe);
      } catch(e) {
        var w = editorWindow();
        w.setPjError("Error: "+e.message);
        var wasError = 1;
      }
      if (!wasError) {
        mpg.editor_lightbox.dismiss();
        updateAndShow();
      }
    } else if (msg === "cancel") {
      mpg.editor_lightbox.dismiss();

    }
  }
  
  page.popEditor = function(f,path) {
    debugger;
    var pf = om.beforeChar(path,".");
    if (pf ==="wsfdsfs") {
      var af = om.afterChar(path,".");
      functionToEdit = [f,"prototypeJungle.om.root."+af]
    } else {
      functionToEdit = [f,path];
    }
    var lb = __pj__.mainPage.lightbox;
    lb.pop();
    if (mpg.lightbox) {
      mpg.lightbox.dismiss();
    }
    var lb = mpg.editor_lightbox;
    lb.pop();

    var awinwd = $(window).width();
    var awinht = $(window).height();
    var padding = 40;
    var vpadding = 60;
    var lbwd = Math.min(650,awinwd-padding);
    var lbht = awinht-2*vpadding;
    var lft = 0.5 * (awinwd - lbwd);
    var top  = 20;
    var rct = geom.Rectangle.mk({corner:[lft,top],extent:[lbwd,lbht]});
    lb.setRect(rct);
    page.editorRect = rct;
    var fsrc = om.useMinified?"edit.html":"editd.html"; // go to dev version from dev version
    lb.setHtml('<iframe frameborder="0" id="editorIframe" width="100%" height="100%" scrolling="no" id="chooser" src="'+fsrc+'"/>');
    lb.setTopline(path + " = ");
     page.editorIframe = $('#editorIframe');
   
                 
  }
  
  // hmmm bundled not supported
  //path will be supplied for saveAs
  // called from the chooser
  page.saveItem = function (path,bundled) {
    bundled = false;
    if (!path) {
      if (page.newItem) {
        var url = "http://s3.prototypejungle.org"+page.newItem;
      } else {
        url = page.itemUrl;
      }
    } else {
      var url = "http://s3.prototypejungle.org/"+path;
    }
    var upk = om.unpackUrl(url);
    // make sure the item is at the right place
    __pj__.set(upk.path,om.root);
    om.root.__beenModified__ = 1;
    if (bundled) {
      om.root.__bundled__ = 1;
    }
    var svcnt = page.saveCount();
    om.root.__saveCount__ = svcnt+1;
    if (!inspectDom) om.root.set("__canvasDimensions__",geom.Point.mk(draw.canvasWidth,draw.canvasHeight));
    var upk = om.unpackUrl(url,true);
    om.s3Save(om.root,upk,function (srs) {
      om.root.__saveCount__ = svcnt;
      var asv = afterSave(srs);
      if (asv === "ok") {
        var inspectD = om.useMinified?"/inspect":"inspectd";
        page.setSaved(true);
        if (page.newItem) {
          var loc = inspectD+"?item="+url;
          location.href = loc;
        } else if (path) { //  go there for a saveAs
          //page.itemSaved = true; // so no confirmation of leaving page
          var loc = inspectD+"?item="+url;
          location.href = loc;
        } else {
          //page.setSaved(true);
          if (!bundled) {
            om.root.deepUpdate(null,om.overrides);
            draw.refresh();
          }
        }
      }
    },bundled);  // true = remove computed
  }
        

// returns "ok", or an error message
function afterSave(rs) {
  if (rs.status==='fail') {
    if (rs.msg === 'collision') {
      var ht = 'An unlikely name collision took place. Please try your save again.'
    } else if (rs.msg === 'busy') {
      var ht = 'The site is too busy to do the save. Please try again later';
    } else if ((rs.msg==="noSession")||(rs.msg === "timedOut")) {
      var ht = 'Your session has timed out. Please sign in again.'
      page.logout();
    } else {
      var ht = "Error: "+rs.msg;
    }
    return ht;
  } else {
    return "ok"
  }
}
  page.saveCount = function () {
    var svcnt = om.root.__saveCount__;
    return (typeof svcnt === "number")?svcnt:0;
  }
  
  // OBSOLETE
  page.insertData = function (url,whr,cb) {
    om.getData(url,function (rs) {
      var dt = JSON.parse(rs);
      var ldt = om.lift(dt);
      om.root.set(whr,ldt);
      updateAndShow();
      cb("ok");     
    });
  }
  
  function prototypeSource(x) {
    var p = Object.getPrototypeOf(x);
    return om.pathExceptLast(p.__source__);// without the /source.js
  }
    
    // now somewhat specialized for adding captions and buttons,
    // but only via the last two arguments
  function finishInsert(x,pwhr,whr,cb,funToAdd,computableText) {
    // if pwhr is null, just instantiate x
    if (pwhr) {
      var prt = om.root.set("prototypes/"+pwhr,x.instantiate().hide());
      prt.namedType();
      om.root.prototypes.__doNotUpdate__ = 1;
    } else {
      prt = x;
    }
    var inst = om.root.set(whr,prt.instantiate().show());
    if (funToAdd) {
      var nm = funToAdd[0];
      inst[nm] = funToAdd[1];
      inst.setvis(nm,1);
      
    }
    if (1 || computableText) {
      inst.convertToComputedField("text");
    }
    inst.draggable = 1;
    if (!om.overrides) {
      om.overrides = {};
    }
    // deal with data sources

  }
  // returns true, false, or "conflict"
  page.prototypeAlreadyThere = function (url,pwhr) {
    var exp = om.evalPath(om.root,"prototypes/"+pwhr); // is the prototype already there?
    if (!exp) return false;
    var src = prototypeSource(exp);
    if (src===url) {
      return true;
    } else {
      return "conflict";
    }
  }
  
   page.alreadyThere = function (whr) {
    var exp = om.evalPath(om.root,whr); // is the prototype already there?
    return !!exp;
  }
  
  function lookupPrim(path) {
    //the last two elements of the path identify the primitive
    var sp = path.split("/");
    var ln = sp.length;
    var dir = sp[ln-2];
    var nm = sp[ln-1];
    return prototypeJungle[dir][nm];
  }

    
  page.insertItem = function(url,pwhr,whr,cb) {
    //pwhr is the internal path at which to  the prototype, and whr is the internal path at which to  the instance
    if (pwhr) {
      var exp = om.evalPath(om.root,"prototypes/"+pwhr); // is the prototype already there?
    }
    if (om.beginsWith(url,"http://")) {
      if (exp) {
        var src = prototypeSource(exp);
        if (url === src) {
          finishInsert(exp,null,whr,cb);
          return;
        }
      }
      om.install([url],function (ars) {
        finishInsert(ars[0],pwhr,whr,cb);
      });
    } else {
      // otherwise this is a primitive
      var prim = lookupPrim(url);
      if (exp) {
        if (Object.getPrototypeOf(exp)===prim) {
          finishInsert(exp,null,whr,cb);
          return;
        }
      }
      var funToAdd = ["update",function () {}];
      finishInsert(prim,pwhr,whr,cb,funToAdd);
    }
  }
  
  page.insertText = function (whr,txt) {
    var url = "sys/repo0/geom/Text";
    var pwhr = "CaptionP";
    var cb = function (inst) {
      inst.text = txt;
      var bnds = om.root.deepBounds();
      var crn = bnds.corner;
      var xt = bnds.extent;
      var fc = 0.1;
      // move the new text out of the way
      var pos = crn.plus(geom.Point.mk(2*fc*xt.x,-fc*xt.y));
      inst.moveto(pos);
      draw.refresh();// to measure text
      draw.mainCanvas.fitContents();
      tree.adjust();
    }
    page.insertItem(url,pwhr,whr,cb);
    
  }
  // which is "Button" or "Caption"
  function insertPanelJQ(which) {
    
 
    function checkNamesInInput (ifld,erre) {
      ifld.keyup(function () {
        var fs = ifld.prop("value");
        if (!fs ||  om.checkName(fs)) {
          erre.html("");
        } else {
          erre.html("The name may not contain characters other than digits, letters, and the underbar");  
        }
      })
    }
    var txti,whri,okBut,cancelBut,errmsg;
  
    var rs = $('<div><p style="text-align:center;font-weight:bold">Insert '+which+'</p></div>').append(
      $('<div/>').append(
        $('<span>Name for  caption: </span>').append(
        whri= $('<input type="text" style="width:100px"/>'))
        )
    ).append($('<div/>').append(
       $('<span>Caption text: </span>').append(
        txti= $('<input type="text" style="width:300px"/>'))
        )
    ).append(
        errmsg = $('<div class="error" style="padding-top:20px"></div>')
    ).append($('<div style="padding-top:20px"/>').append(
      okBut = $('<div class="button">Ok</div>')).append(
      cancelBut = $('<div class="button">Cancel</div>'))
    );
    var txterr = 0; // no null text error has yet occured
    okBut.click(function () {
      var whr = whri.prop("value");
      var txt = txti.prop("value");
      if ($.trim(whr)==="" ){
        errmsg.html("Name for the caption not specified");
        return;
      }
      if (om.root[whr]) {
        errmsg.html("There is already an  object by that name;  please choose another");
        return;
      }
      if ($.trim(txt)==="" ){
        errmsg.html("No text specified");
        txterr = 1;
        return;
      }
      page.insertText(whr,txt);
      mpg.lightbox.dismiss();
    });
    cancelBut.click(function () {mpg.lightbox.dismiss();});
    checkNamesInInput(whri,errmsg);
    txti.keyup(function () {
      if (!txterr) {
        return;
      }
      if (errmsg.html()=="") {
        return;
      }
      var txt = txti.prop("value");
      if ($.trim(txt) != "") {
        errmsg.html("");
      }
    })
    return rs;
  }

  page.popInsertPanel = function (which) {
    mpg.lightbox.pop();
     mpg.lightbox.setContent(insertPanelJQ(which));
  }
  
 
  page.rebuildItem = function () {
    var buildPage = om.useMinified?"/build":"/buildd";
    location.href =buildPage+"?item=/"+page.itemPath;
  }

  page.saveImage = function (path,cb) {
    var url = "http://s3.prototypejungle.org/"+path;
    var upk = om.unpackUrl(url);
    var img = upk.image;
    draw.mainCanvas.postCanvas(path,function (rs) {
      cb(rs);
    });     
  }
  
  
  actionDiv.addChild("itemName",itemName);
 
 
  // Note: the file options are simplified for a while. No more "new item", and the fancy general purpose
  // insert supported by the chooser is replaced by insert caption. The underlying code support for these
  // temporarily-absent options remains, just not in use.
  
  var fsel = dom.Select.mk();
  
  fsel.containerP = jqp.pulldown;
  fsel.optionP = jqp.pulldownEntry;
  var fselJQ;
    var insertReady = true;

  function setFselDisabled() {
    if (localStorage.sessionId) {
      var newItem = page.newItem;
      // if there is no saveCount, this an item from a build, and should not be overwritten
      var handle = localStorage.handle;
      if (newItem) {
        var myItem = true;
      } else {
        var fhandle = om.pathFirst(page.itemPath);
        var myItem = handle === fhandle;
      }
      var saveDisabled = newItem || (!om.root.__saveCount__);
      var rebuildDisabled = newItem || om.root.__saveCount__ || !myItem;
      if (newItem) {
        var deleteDisabled = true;
      } else {
         deleteDisabled = !myItem;
        
      }
      // new option gone
      fsel.disabled = insertReady?[0,0,0,0,0,rebuildDisabled,saveDisabled,0,0,deleteDisabled]:
                                  [0,0,0,rebuildDisabled,saveDisabled,0,0,deleteDisabled]
    } else {
      fsel.disabled = insertReady?[1,1,0,1,1,1,1,1,1,1]:[1,1,0,1,1,1,1,1];
    }
  }
      
  function setFselOptions() {
    //fsel.options = ["New Item...","New Build...","New Data File...","Open...","Insert Caption...","Edit Source/Rebuild","Save","Save As...","Save Image...","Delete"];
    //fsel.optionIds = ["newItem","new","newData","open","insert","rebuild","save","saveAs","saveImage","delete"];
    if (insertReady){
      fsel.options = ["New Build...","New Data File...","Open...","Insert Caption...","Insert Button...","Edit Source/Rebuild","Save","Save As...","Save Image...","Delete"];
      fsel.optionIds = ["new","newData","open","insertCaption","insertButton","rebuild","save","saveAs","saveImage","delete"];
    } else {
      fsel.options = ["New Build...","New Data File...","Open...","Edit Source/Rebuild","Save","Save As...","Save Image...","Delete"];
      fsel.optionIds = ["new","newData","open","rebuild","save","saveAs","saveImage","delete"];
    }
    setFselDisabled();
    fselJQ = fsel.toJQ();
    mpg.addChild(fselJQ); 
    fselJQ.hide();
  }
  
  var fselSaveIndex = insertReady?6:4; // a little dumb, but harmless
  
  fsel.onSelect = function (n) {
    var opt = fsel.optionIds[n];
    if (opt === "newItem") { // check if an item save is wanted
      var inspectD = om.useMinified?"/inspect":"/inspectd";
      location.href = inspectD + "?newItem=1"
      return;
 
    }
 
    if (opt === "insertCaption") {
      page.popInsertPanel("Caption");
      return;
    }
    if (opt === "insertButton") {
      page.popInsertPanel("Button");
      return;
    }  
    if (opt === "delete") {
      confirmDelete();
      return;
    }
    if (opt === "save") {
      itemName.setHtml("Saving ...");
      dom.unpop();
      page.saveItem();
    } else if (opt === "rebuild") {
      page.rebuildItem();
    } else {

      popItems(opt);
    }
  }
 
 

  fileBut.click = function () {
    setFselDisabled();
    dom.popFromButton("file",fileBut,fselJQ);
  }

 
 
 
  
  var viewBut = jqp.ubutton.instantiate();
  viewBut.html = "View";

  var vsel = dom.Select.mk();
  
  vsel.isOptionSelector = 1;
  vsel.containerP = jqp.pulldown;
  vsel.optionP = jqp.pulldownEntry;
  vsel.options = ["Only editable fields",
                  "All fields except functions",
                  "All fields, including functions"];
  vsel.optionIds = ["editable","notFunctions","all"];
  vsel.onSelect = function (n) {
    if (n===0) {
      tree.onlyShowEditable = true;
      tree.showFunctions = false;
    } else if (n===1) {
      tree.onlyShowEditable = false;
      tree.showFunctions = false;
    } else {
      tree.onlyShowEditable = false;
      tree.showFunctions = true;
    }
    tree.initShapeTreeWidget();
    tree.refreshProtoChain();
  }
  
      
  vsel.selected = 1;
  tree.onlyShowEditable= false;
  tree.showFunctions = true;
  
  var vselJQ = vsel.toJQ();
  page.vv = vselJQ;
  mpg.addChild(vselJQ); 
  vselJQ.hide();

  
  page.popViews = function () {
    if (page.viewsPopped) {
      vselJQ.hide();
      page.viewsPopped = 0;
      return;
    }
    var mof = mpg.offset();
    var ht = viewBut.height();
    var ofs = viewBut.offset();
    var rofL = ofs.left-mof.left;
    var rofT = ofs.top-mof.top;
    vselJQ.css({"display":"block","left":rofL+"px","top":(rofT+ht)+"px"});
    page.viewsPopped = 1;
  }
  
  page.hideViewsSel = function () {
    vselJQ.hide();
  }
  
  viewBut.click = function () {dom.popFromButton("views",viewBut,vselJQ);}

 
  
  tree.onlyShowEditable= false;
  tree.showFunctions = false;
  
  
 
  tree.autoUpdate = 1;
  
  page.alert = function (msg) {
    mpg.lightbox.pop();
    mpg.lightbox.setHtml(msg);
  }
 
  //src is who invoked the op; "tree" or "draw" (default is draw)
  function updateAndShow(src,forceFit) {
    om.root.removeComputed();
    om.root.deepUpdate(null,null,om.overrides);
    if (forceFit) draw.mainCanvas.fitContents(true);
    draw.refresh();
    if (src!="tree") tree.initShapeTreeWidget();
  }
 
  tree.updateAndShow = updateAndShow; // make this available in the tree module

  
  
  viewTreeBut.click = function (){
    setFlatMode(false);
    viewTreeBut.hide();
   // viewFlatBut.__element__.html(flatMode?"View Tree":"View Flat");
   
  }
  
  upBut.click = function () {
    tree.showParent();
  }
 
  
  function aboutText() {
    var rt = om.root;
    var tab = rt.__about__;
    ht = "";
    var src = rt.__source__;
    if (rt.__saveCount__  && src) {
      var nsrc = om.pathExceptLast(src);
      var psrc = "http://prototypejungle.org/" +om.stripDomainFromUrl(nsrc); 
      ht += "<p>This is a variant of <a href='http://prototypejungle.org/inspect?item="+nsrc+"'>"+psrc+"</a></p>";
    }
    if (tab) ht += "<div>"+tab+"</div>";
    return ht;
  }
    
    
    
  aboutBut.click = function () {
    dom.unpop();
    var rt = om.root;
    mpg.lightbox.pop();
    var ht = '<p>The general <i>about</i> page for Prototype Jungle is <a href="http://prototypejungle.org/about.html">here</a>. This note concerns the current item.</p>';
    ht += aboutText();
    mpg.lightbox.setHtml(ht);
  }
 



 function getHelpHtml()  {
  if (page.helpHtml) return page.helpHtml;
  if (page.includeDoc) {
  var helpHtml0 = '<div class="paddedIframeContents"><p> Please see the explanations at the bottom of this  intro page (after dismissing this lightbox).</p></div>'
 } else {
  var helpHtml0 = '<p>Two panels, labeled "Workspace" and "Prototype Chain", appear on the right-hand side of the screen. The workspace panel displays the hierarchical structure of the JavaScript objects which represent the item. You can select a part of the item either by clicking on it in the graphical display, or in the workspace panel. The <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain">prototype chain</a> of the selected object will be shown in rightmost panel. </p>';
 }

page.helpHtml = helpHtml0;

return page.helpHtml;
 }
 
 
 
 
 function genTweeter(txt,url) {
  var rs = 
'<a href="https://twitter.com/share" class="twitter-share-button"  data-count="none" data-text="'+txt+'">Tweet</a>'+
"<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>";
  return rs;
 }
 

 function shareJq() {
  var rs = $("<div />");
  var url = page.itemUrl + "/view";
  rs.append("<p>The URI of this item is </p>");
  rs.append("<p style='padding-left:20px'>"+page.itemUrl+"</p>");
  rs.append("<p>To inspect it (ie, the current page): </p>");
  rs.append("<p style='padding-left:20px'>"+om.mkLink("http://sprototypeJungle.org?item="+page.itemUrl)+"</p>");
 rs.append("<p>To view it: </p>");
  rs.append("<p style='padding-left:20px'>"+om.mkLink(page.itemUrl+"/view")+"</p>");
 rs.append("<p>Embed (adjust width and height to taste):</p>");
  var emb = om.mkEmbed(url);
  var dv = $("<input class='embed'/>");
  dv.attr("value",emb);
  dv.click(function () {
    dv.focus();dv.select();
  });
  rs.append(dv);
  rs.append("<p>Tweet this  item:</p>");
  var tw = genTweeter(page.itemName + ' at PrototypeJungle',url);
  rs.append(tw);
  return rs;
 }


   shareBut.click = function () {
      dom.unpop();
      mpg.lightbox.pop();
      mpg.lightbox.setContent(shareJq());
   };
   
   
   helpBut.click = function () {
      dom.unpop();
      mpg.lightbox.pop();
      mpg.lightbox.setHtml(getHelpHtml());
   };
   
  stickyBut.click = function () {
    if (theCanvas.stickyHover) {
      theCanvas.stopStickyHovers();
      stickyBut.setHtml('Sticky Hovers');
    } else {
      theCanvas.stickyHover = 1;
      stickyBut.setHtml('Unstick Hovers');
    }
  }
   
   
   
   
  mainTitleDiv.click = function () {
    location.href = "/";
  }
  
  page.itemSaved = true; // need this back there
  
  page.setSaved = function(saved) {
    // those not logged in can't save anyway
    if (!localStorage.sessionId) {
      return;
    }
    if (saved == page.itemSaved) return;
    page.itemSaved = saved;
    var nm =  page.newItem?"New Item*":(saved?page.itemName:page.itemName+"*");
    itemName.setHtml(nm);
    if (!page.newItem) fsel.setDisabled(fselSaveIndex,saved); // never allow Save (as opposed to save as) for newItems
    if (saved) {
      window.removeEventListener("beforeunload",page.onLeave);
    } else {
      window.addEventListener("beforeunload",page.onLeave);
    }
  }
  
  
  
  var dialogEl =$('<div class="Dialog">\
                        <div  id="dialogTitle" class="dialogLine"></div>\
                        <div  class="Line">\
                          <div class="button" id="dialogOk">Ok</div>\
                          <div class="button" id="dialogCancel">Cancel</div>\
                        </div>\
                      </div>');
                      
  
 var dialogOkButton = $('#dialogOk',dialogEl);
  var dialogCancelButton = $('#dialogCancel',dialogEl);
var dialogTitle = $('#dialogTitle',dialogEl);
 
  function activateDeleteButtons() {
    dialogTitle.html("Are you sure you wish to delete this item? There is no undo.");
    dialogOkButton.off("click");
    dialogOkButton.click(function () {
      var pth = page.itemPath;
      om.deleteItem(pth,function (rs) {
        page.nowDeleting = true;
        location.href = "/";
      });
    });
    dialogCancelButton.click(function (){
      mpg.lightbox.dismiss();
    });
  }
  
  function confirmDelete() {   
    var lb = mpg.lightbox;
    lb.pop();
    lb.setContent(dialogEl);
    activateDeleteButtons();
    return false;
  }
    
  var leavingFor;
 
  // see https://developer.mozilla.org/en-US/docs/Web/Reference/Events/beforeunload
  page.onLeave = function (e) {
    var msg = (page.nowDeleting || page.itemSaved)?null:"The current item has unsaved modifications.";
     (e || window.event).returnValue = msg;     //Gecko + IE
     return msg; //webkit
  }
  
  
  
  
  draw.stateChangeCallbacks.push(function () {
    page.setSaved(false);
  });
  
  
  /* non-standalone items should not be updated or displayed; no canvas needed; show the about page intead */
  page.genMainPage = function (standalone,cb) {
    if (__pj__.mainPage) return;
    __pj__.set("mainPage",mpg);
    if (page.includeDoc) {
      mpg.addChild("doc",docDiv);
    }
    if (standalone) {
      theCanvas = dom.addCanvas(canvasDiv);
    }
    //om.root.customUIaction = om.showComputed;

    if (om.root.customUIaction) {
      customBut.click = function () {om.root.customUIaction();};
    } else {
      customBut.hide();
    }
      var dUrl = om.root.dataSource;
    if (dUrl) {
      viewDataBut.click = viewData;
    } else {
      viewDataBut.hide();
    }
    
    function viewData() {
      var durl = om.root.dataSource;
      location.href = durl;
      return;
      if (om.beginsWith(durl,"http://s3.prototypejungle.org")) {
        var upk = om.unpackUrl(durl);
        debugger;
        if (upk.handle === localStorage.handle) {
          var dest = "http://prototypejungle.org:8000/view_data?data="+(upk.repo)+(upk.path);
          location.href = dest;
        }
      }
    }
    mpg.install($("body"));
    if (standalone) theCanvas.initButtons();
    setFlatMode(false);
    $('.mainTitle').click(function () {
      location.href = "/";
    });
    
    if (om.root.__source__) {
      viewSourceBut.attr("href", om.root.__source__);
    } else {
      viewSourceBut.hide();
    }
  /*
    plusbut.__element__.mousedown(draw.startZooming);
    plusbut.__element__.mouseup(draw.stopZooming);
    plusbut.__element__.mouseleave(draw.stopZooming);
    minusbut.__element__.mousedown(draw.startUnZooming);
    minusbut.__element__.mouseup(draw.stopZooming);
    minusbut.__element__.mouseleave(draw.stopZooming);
*/
    page.genButtons(ctopDiv.__element__,{toExclude:{'about':1,'file':1}});
    fsel.jq.__element__.mouseleave(function () {dom.unpop();});

    
   
    if (standalone && !inspectDom) {
      //theCanvas.contents = om.root;
      //draw.addCanvas(theCanvas);
      theCanvas.contents = om.root;
      theCanvas.init();
    } else if (!inspectDom) {
      aboutBut.hide();
      var nstxt = "<div class='notStandaloneText'><p>This item includes no visible content, at least in this standalone context.</p>";
      nstxt += aboutText() + "</div>";
      canvasDiv.setHtml(nstxt);
    }
    $('body').css({"background-color":"#eeeeee"});
    if (!om.root.hasHovers) {
      stickyBut.hide();
    }

    layout(true); //nodraw
    var r = geom.Rectangle.mk({corner:[0,0],extent:[500,200]});
    var rc = geom.Rectangle.mk({corner:[0,0],extent:[600,200]});
    var lbt = __pj__.lightbox.template.instantiate();
    // the main lightbox wants padding and overflow, but not the chooser
    lbt.selectChild("content").setN("style",{"padding-left":"30px","padding-right":"30px","overflow":"auto"});
    var lb = lightbox.newLightbox($('body'),r,lbt);
    mpg.set("lightbox",lb);
    var clb = lightbox.newLightbox($('body'),rc,__pj__.lightbox.template.instantiate());
    mpg.set("chooser_lightbox",clb);
    var elb = lightbox.newLightbox($('body'),rc,__pj__.lightbox.template.instantiate());
    mpg.set("editor_lightbox",elb);
    itemName.setHtml(page.itemName);
    cb();   
  }
    

    
    // note about code built items
    // they are loaded, then instantiated, and assigned the path prototypeJungle.ws
    // but before saving, they are moved to the right place in the tree for where they will be saved.
    
  
      
  
      
  
  page.initPage = function (o) {
    var q = om.parseQuerystring();
    draw.bkColor = "white";
    var wssrc = q.item;
   // var idataSource = q.data;
    //var idataSource = page.getDataSourceFromHref();
    page.newItem = q.newItem;
    var itm = q.item;
    page.includeDoc = q.intro;
  
  
     
    page.itemUrl =  wssrc;
    if (wssrc) {
      page.itemName = om.pathLast(wssrc);
      page.itemPath = om.stripDomainFromUrl(wssrc);
    }
    function installOverrides(itm) {
                  var ovr = itm.__overrides__;
              if (!ovr) {
                ovr = {};
              }
              if (ovr) {
                delete itm.__overrides__;
              }
              return ovr;
            }
            
     $('document').ready(
        function () {
          om.tlog("document ready");
          $('body').css({"background-color":"white",color:"black"});
          om.disableBackspace(); // it is extremely annoying to lose edits to an item because of doing a page-back inadvertantly

            function afterInstall(ars) {
              om.tlog("install done");
              var ln  = ars?ars.length:0;
              if (ln>0) {
                var rs = ars[ln-1];
                if (rs) { // rs will be undefined if there was an error in installation 
                  var inst  = !(rs.__beenModified__);// &&  !noInst; // instantiate directly built fellows, so as to share their code
                  var ovr = installOverrides(rs);
                  
                 // ws = __pj__.set("ws",om.DNode.mk());
                  if (inst) {
                    var frs = rs.instantiate();
                    __pj__.set("ws",frs);
                  } else {
                     frs = rs;
                  }
                  
                 // ws[rs.__name__] = frs; // @todo rename if necessary
                  om.root = draw.wsRoot = frs;
                  page.codeBuilt = !(frs.__saveCount__);
                  draw.enabled = !inspectDom &&!frs.notStandalone;
                  var standalone = draw.enabled;
                  showTopNote();
                  if (standalone) {
                    om.overrides = ovr;
                   // frs.deepUpdate(null,null,ovr); wait until data is loaded
                   
                    var bkc = frs.backgroundColor;
                    if (!bkc) {
                      frs.backgroundColor="white";
                    }
                  }
                } else {
                  om.root = draw.wsRoot = {__installFailure__:1};
                }
              } else {
                // newItem
                om.root = draw.wsRoot = __pj__.set("ws",geom.Shape.mk());
                om.root.backgroundColor="white";
                standalone = true;
                page.codeBuilt = false;
              }
              setFselOptions(); 
               
            
                page.genMainPage(standalone,function () {
                            om.tlog("starting build of page");

                  if (!wssrc) {
                    page.setSaved(false);
                  }
                  if  (!om.root.__about__) {
                    aboutBut.hide();
                  }
                  var ue = om.updateErrors && (om.updateErrors.length > 0);
                  if (ue) {
                    var lb = mpg.lightbox;
                    lb.pop();
                    lb.setHtml("<div id='updateMessage'><p>An error was encountered in running the update function for this item: </p><i>"+om.updateErrors[0]+"</i></p></div>");
                  }
                  function afterAfterLoadData() {
                    tree.initShapeTreeWidget();
                    var isVariant = !!(om.root.__saveCount__);
                    if (inspectDom) { // not in use, but might come back
                      var doc = om.root.document;
                      if (doc) {
                        var dmf = doc.domify();
                        canvasDiv.addChild(dmf);
                        dmf.install();
                      }
                    } else if (standalone) {
                      theCanvas.initialView();
                    }
                  }
                  var ds = om.initializeDataSource();//om.root.dataSource;
                  if (ds) {
                   // page.setDataSourceInHref(om.root.dataSource);
                    om.loadData(ds,function (err,dt) {
                      om.afterLoadData(err,dt);
                      afterAfterLoadData();
                    });
                  } else {
                    om.afterLoadData(null,null);
                    afterAfterLoadData();
                  }
                
                });
            
            }
            if (!wssrc) {
              afterInstall();
            } else {
                var lst = om.pathLast(wssrc);
                om.tlog("Starting install");
                om.install(wssrc,afterInstall)
            }
            
            $(window).resize(function() {
                layout();
                draw.mainCanvas.fitContents();

              });   
          });
  }
})(prototypeJungle);

