
  
// This is one of the code files assembled into pjui.js.

var treePadding = 0;
var bkColor = "white";
var docDiv;
var minWidth = 1000;
var plusbut,minusbut;
var flatInputFont = "8pt arial";
var uiDiv,dataDiv,topbarDiv,obDivTitle;
var msgPadding = "5pt";
var inspectDom = false;
var uiWidth;
var insertKind;
ui.fitMode = false;
ui.panelMode = 'chain'; // mode of the right panel view; one of 'chain' (view the prototype chains);'insert','data','code','replace'
var unpackedUrl,unbuiltMsg;
//ui.docMode = 1;
ui.saveDisabled = false; // true if a build no save has been executed.
ui.entryInputs = {};

var mkEntryField = function (title,id,browseId) {
  var children = [
      html.Element.mk('<span style="padding-left:5px;float:left;width:30px">'+title+'</span>'),
      ui.entryInputs[id] = html.Element.mk('<input type="input" style="font:8pt arial;width:60%;margin-top:0px;margin-left:10px"/>')
  ];
  if (browseId) {
      ui[browseId] =  html.Element.mk('<div class="roundButton">Browse...</div>');
      children.push(ui[browseId]);
  }
  return html.Element.mk('<div style="margin-top:10px"/>').__addChildren(children);
}
var buttonSpacing = "10px";
var buttonSpacingStyle = "margin-left:10px";
 var jqp = pj.jqPrototypes;
 // the page structure
var mainTitleDiv = html.wrap('mainTitle','div');
// note that in a few cases, the new slightly more compact method of making a dom.El from a parsed string is employed. 

var actionDiv,cols;

var mpg = ui.mpg =  html.wrap("main",'div',{style:{position:"absolute","margin":"0px",padding:"0px"}}).__addChildren([
  topbarDiv = html.wrap('topbar','div',{style:{position:"absolute",height:"10px",left:"0px","background-color":"bkColor",margin:"0px",padding:"0px"}}).__addChildren([
    
  actionDiv =  html.Element.mk('<div id="action" style="position:absolute;margin:0px;overflow:none;padding:5px;height:20px"/>').__addChildren([
      ui.fileBut = html.Element.mk('<div class="ubutton">File</div>'),
      ui.newEntryBut= html.Element.mk('<div class="ubutton">New Entry</div>'),
    // ui.viewDataBut = html.Element.mk('<div class="ubutton">View/Change Data</div>'),
      ui.messageElement = html.Element.mk('<span id="messageElement" style="overflow:none;padding:5px;height:20px"></span>')
    ]),
    ui.ctopDiv = html.wrap('topbarInner','div',{style:{float:"right"}})
  ]),

  cols = html.Element.mk('<div id="columns" style="left:0px;position:relative"/>').__addChildren([
    
    ui.docDiv = docDiv = html.Element.mk('<iframe id="docDiv" style="position:absolute;height:400px;width:600px;background-color:white;border:solid thin green;display:inline-block"/>'),
    /*
    ui.catalogDiv = html.Element.mk('<div id="insertDiv" style="overflow:auto;position:absolute;top:60px;height:400px;width:600px;background-color:white;bborder:solid thin black;"/>').__addChildren([
        ui.tabContainer = html.Element.mk('<div id="tabContainer" style="vertical-align:top;border-bottom:thin solid black;height:30px;"></div>').__addChildren([
            ui.insertTab = html.Element.mk('<div id="tab" style="width:80%;vertical-align:bottom;borderr:thin solid green;display:inline-block;height:30px;"></div>'),
            ui.closeInsertBut = html.Element.mk('<div style="background-color:red;display:inline-block;vertical-align:top;float:right;cursor:pointer;margin-left:0px;margin-right:1px">X</div>')
        ]),                                                                                                                                                 
        ui.insertDivCol1 = html.Element.mk('<div id="col1" style="display:inline-block;bborder:thin solid black;width:49%;"></div>'),
        ui.insertDivCol2 = html.Element.mk('<div id="col2" style="vertical-align:top;display:inline-block;bborder:thin solid black;width:49%;"></div>'),
      //   ui.catalogCol2 = html.Element.mk('<div id="col2" style="cursor:pointer;margin-right:20px;border:thin solid green;float:right;margin-top:40px"></div>')
    ]),
    //protoj
    */
    ui.catalogDiv = html.Element.mk('<div id="svgDiv" style="overflow:auto;position:absolute;height:400px;width:600px;background-color:white;border:solid thin black;display:inline-block"/>').__addChildren([
       ui.catalogTab = html.Element.mk('<div id="tab" style="width:100%;vertical-align:bottom;border:thin solid black;display:inline-block;height:30px;"></div>'),
       //ui.catalogTab = html.Element.mk('<div id="tab" style="vertical-align:bottom;border-bottom:thin solid black;height:30px;">Tab</div>'),
       ui.catalogCol1 = html.Element.mk('<div id="col1" style="display:inline-block;bborder:thin solid black;width:49%;"></div>'),
       ui.catalogCol2 = html.Element.mk('<div id="col2" style="vertical-align:top;display:inline-block;bborder:thin solid black;width:49%;"></div>')
      // ui.catalogCol1 = html.Element.mk('<div id="col1" style="display:inline-block;border:thin solid black;width:49%;"></div>'),
      //  ui.catalogCol2 = html.Element.mk('<div id="col2" style="vertical-align:top;display:inline-block;border:thin solid black;width:49%;"></div>'),
      //   ui.catalogCol2 = html.Element.mk('<div id="col2" style="cursor:pointer;margin-right:20px;border:thin solid green;float:right;margin-top:40px"></div>')
    ]),
    
    ui.editEntryContainer =  html.Element.mk('<div id="editEntryContainer" style="background-color:white;border:solid thin green;position:absolute;margin:0px;padding:0px"></div>').__addChildren([
     /* html.Element.mk('<div style="margin-bottom:5px"></div>').__addChildren([
        ui.closeCodeBut = html.Element.mk('<span style="background-color:red;float:right;cursor:pointer;margin-left:10px;margin-right:0px">X</span>'),
        ui.codeTitle = html.Element.mk('<span style="font-size:8pt;margin-left:10px;margin-right:10px">Data source:</span>'),
        ui.codeMsg =html.Element.mk('<span style="font-size:10pt">a/b/c</span>'), 
     ]),*/
     ui.entryError =html.Element.mk('<div style="margin-left:10px;margin-bottom:5px;colorr:red;ffont-size:10pt">Current Entry:</div>'),
      ui.entryTopButtons = html.Element.mk('<div id="entryTopButtons" style="bborder:solid thin red;"></div>').__addChildren([
         ui.goStructureBut =html.Element.mk('<div style = "ffloat:right" class="roundButton">Open (Structure)</div>'),
         ui.goCodeBut =html.Element.mk('<div style = "ffloat:right" class="roundButton">Open (Code)</div>'),
         ui.upBut =html.Element.mk('<div style = "ffloat:right" class="roundButton">Up</div>'),
          ui.downBut =html.Element.mk('<div style = "ffloat:right" class="roundButton">Down</div>'),
          ui.deleteBut =html.Element.mk('<div style = "ffloat:right" class="roundButton">Delete</div>')
     ]),
      ui.entryDiv = html.Element.mk('<div id="entryDiv" style="border:solid thin green;position:absolute;"></div>').__addChildren([
         mkEntryField('tab','tab'),
         mkEntryField('title','title'),
         mkEntryField('svg','svg','browseSvg'),
         mkEntryField('url','url','browseUrl'),
         mkEntryField('data','data','browseData'),
         ui.entryButtons = html.Element.mk('<div id="entryTopButtons" style="margin-top:20px;bborder:solid thin red;"></div>').__addChildren([
             ui.entryDoneBut =html.Element.mk('<div  class="roundButton">Done</div>'),
             ui.entryCancelBut =html.Element.mk('<div  class="roundButton">Cancel</div>'),
        ])
      ])
    ]),
    // insertContainer is used for opening from catalog
   
    
  
 ])
]);
  
 

  
  ui.intro = false;
   
   // there is some mis-measurement the first time around, so this runs itself twice at fist
  var firstLayout = true;
ui.layout = function(noDraw) { // in the initialization phase, it is not yet time to __draw, and adjust the transform
  // aspect ratio of the UI
  var bkg = "white";
  var svgwd = 500;
  var svght = 500;
  var ar = 0.48//0.5;
  var pdw = 0;// minimum padding on sides
  var wpad = 0;
  var vpad = 0;//minimum sum of padding on top and bottom
  var cdims = geom.Point.mk(svgwd,svght);
  var awinwid = $(window).width();
  var awinht = $(window).height();
  var pwinwid = awinwid - 2 * wpad;
  var pwinht = awinht - 2 * vpad;
  if (pwinht < ar * pwinwid) { // the page is bounded by height 
    var pageHeight = pwinht;
    var pageWidth = pageHeight/ar;
    var lrs = (awinwid - pageWidth)/2;  
  } else { // the page is bounded by width
    var pageWidth = pwinwid;
    var pageHeight = ar * pageWidth;
  }
  if (ui.includeDoc) {
    var docTop = pageHeight * 0.8 - 20;
    var docHeight = awinht - pageHeight - 30;
  }
  var  twtp = 2*treePadding;
  var actionWidth  = 0.5 * pageWidth;
  var docwd = 0;
  uiWidth = pageWidth/2;

  //catalogwd = pageWidth/2; 
  //ui.uiWidth  = uiWidth; //debugging
  var treeOuterWidth = uiWidth;///2;
  var treeInnerWidth = treeOuterWidth - twtp;
  mpg.$css({left:lrs+"px",width:pageWidth+"px",height:(pageHeight-0)+"px"});
  var topHt = 20+topbarDiv.__element.offsetHeight;
  cols.$css({left:"0px",width:pageWidth+"px",top:topHt+"px"});
  ui.ctopDiv.$css({"padding-top":"0px","padding-bottom":"20px","padding-right":"10px",left:svgwd+"px",top:"0px"});
  var actionLeft = ui.includeDoc?docwd +10 + "px":"200px";
  actionDiv.$css({width:(actionWidth + "px"),"padding-top":"10px","padding-bottom":"20px",left:actionLeft,top:"0px"});
  var actionHt = actionDiv.__element.offsetHeight;//+(isTopNote?25:0);
  topbarDiv.$css({height:actionHt,width:pageWidth+"px",left:"0px","padding-top":"10px"});
  var cataloght = pageHeight - actionHt -0;
  var panelHeaderHt = 26; // the area above the object/code/data/component panels 
  //var treeHt = svght;
 // tree.myWidth = treeInnerWidth;
  var tabsTop = "20px";
  //tree.obDiv.$css({width:(treeInnerWidth   + "px"),height:(treeHt+"px"),top:"0px",left:"0px"});
  ui.catalogDiv.$css({id:"svgdiv",left:docwd+"px",width:svgwd +"px",height:svght + "px","background-color":bkg});
  ui.catalogHt = cataloght;
  ui.editEntryContainer.$css({top:"0px",left:(docwd + svgwd)+"px",width:(uiWidth-0 + "px"),height:(svght-0)+"px"});
  ui.entryDiv.$css({top:"80px",left:"0px",width:(uiWidth-0 + "px"),height:(svght-80)+"px"});
}
  


/*begin chooser section */
ui.closer = html.Element.mk('<div style="position:absolute;right:0px;padding:3px;cursor:pointer;background-color:red;'+
         'font-weight:bold,border:thin solid black;font-size:12pt;color:black">X</div>');

var chooserClose = ui.closer.instantiate();
ui.chooserIframe = html.Element.mk('<iframe width="99%" height="99%" scrolling="no" id="chooser" />');
var chooserDiv = html.Element.mk('<div style="position:relative;width:100%;height:100%"  id="chooserDiv" />').__addChildren([
  chooserClose,
  ui.chooserIframe
]);
var chooserBeenPopped = false;
    
/*
var addEntry = function (path) {
  debugger;
  var uname = '['+fb.currentUid()+']';
  var ctxt = ui.editorValue();
  var newEntry = ',\n'+
                 '  {"title":"enter title here",\n'+
                 '   "svg":"'+uname+path+'",\n' +
                 '   "url":"enter url here"\n' +
                 '  }';
  var closeBracket = ctxt.lastIndexOf(']');
  var lf = ctxt.lastIndexOf('\n',closeBracket);
  var beforeInsert = ctxt.substring(0,lf-1);
  var afterInsert  = ctxt.substring(lf);
  var newText = beforeInsert+newEntry+afterInsert;
  ui.editor.setValue(newText);//rs

}

  */
ui.popChooser = function(keys,operation) {
  debugger;
  ui.chooserKeys = keys; // this is where the chooser gets its data
  ui.chooserMode = operation;
  //ui.chooserMode = 'open';
  if (mpg.lightbox) {
    mpg.lightbox.dismiss();
  }
  var lb = mpg.chooser_lightbox;
  var src = '/chooser.html';//(pj.devVersion)?"/chooserd.html":"/chooser.html";
  if (!chooserBeenPopped) {
    lb.setContent(chooserDiv);
    chooserBeenPopped = true;

  } else {
    ui.chooserIframe.__element.src = src;
  }
  window.setTimeout(function () {lb.pop(undefined,undefined,1);ui.chooserIframe.__element.src = src},300);
}
  
chooserClose.$click(function () {
  mpg.chooser_lightbox.dismiss();
});

/* end chooser section */

/* file options section */
  
var fsel = ui.fsel = dom.Select.mk();

fsel.containerP = html.Element.mk('<div style="position:absolute;padding-left:5px;padding-right:5px;padding-bottom:15px;border:solid thin black;background-color:white"/>');

fsel.optionP = html.Element.mk('<div class="pulldownEntry"/>');
        
//var fselJQ;
 
ui.initFsel = function () {
 fsel.options = ["New Catalog","Open ...","Save","Save As..."]; 
 fsel.optionIds = ["new","open","save","saveCatalog"];
 var el = fsel.build();
 el.__name = undefined;
  mpg.addChild(el);
  el.$hide();
}

ui.hideFilePulldown = function () {
 if (pj.ui.fsel) { 
    pj.ui.fsel.hide();
  }
}

ui.setFselDisabled = function () {
   // ui.setPermissions();
   debugger;
   if (!fsel.disabled) {
      fsel.disabled = {};
   }
   var disabled = fsel.disabled;
   disabled.new = !ui.source;
   disabled.saveCatalog =  disabled.save = !fb.currentUser;
   if (fb.curentUser && !ui.source) {
     disabled.save = true;
   }
   fsel.updateDisabled();
}


var notSignedIn = function () {
  location.href = "https://prototype-jungle.org/sign_in.html"
}




fsel.onSelect = function (n) {
  var opt = fsel.optionIds[n];
  if (fsel.disabled[opt]) return;
  switch (opt) {
    case "new":
      location.href = "/catalogEdit.html";
      break;
    //case "save":
      
      //ui.resaveItem(pj.root);
     // break;
    case "save":
      debugger;
      ui.resaveItem();
      break;

    case "open":
      fb.getDirectory(function (err,list) {
        debugger;
        var filtered = fb.filterDirectoryByExtension(list,'.catalog');
        ui.popChooser(filtered,opt);
      });
    case "saveCatalog":
       fb.getDirectory(function (err,list) {
        ui.popChooser(list,opt);
      });
      break;
  }
}

ui.fileBut.$click(function () {
  ui.setFselDisabled();
  dom.popFromButton("file",ui.fileBut,fsel.domEl);
});

/* end file options section */
/*
ui.addEntryBut.$click(function () {
    fb.getDirectory(function (err,list) {
        var filtered = fb.filterDirectoryByExtension(list,'.catalog');
        ui.popChooser(filtered,'addEntry');
      });
     
  });
*/

var allButtons = [ui.goStructureBut,ui.goCodeBut,ui.upBut,ui.downBut,ui.deleteBut];

var disableAllButtons = function () {
  allButtons.forEach(disableButton);
}


var enableAllButtons = function () {
  allButtons.forEach(enableButton);
}

disableAllButtons(); 

 
ui.saveItem = function (path,code,cb,aspectRatio) { // aspectRatio is only relevant for svg, cb only for non-svg
  var needRestore = !!cb;
  var savingAs = true;
  var pjUrl = '['+fb.currentUid()+']'+path;
  ui.unselect();
  pj.saveItem(path,code?code:pj.root,function (err,path) {
    debugger;
    if (err) {
      ui.displayTemporaryError(ui.messageElement,'the save failed, for some reason',5000);
      return;
    } else if (cb) {
      if (!ui.mainUrl) {
        //code
      }
      cb(null,path);
      return;
    }
    var loc = '/catalogEdit.html?source='+pjUrl;
    location.href = loc;

  },aspectRatio);
}


ui.resaveItem = function () {
  debugger;
  var doneSaving = function () {
    ui.displayMessage(ui.messageElement,'Done saving...');
    window.setTimeout(function () {ui.messageElement.$hide()},1500);
  }
  ui.displayMessage(ui.messageElement,'Saving...');
  ui.saveItem(ui.itemPath,undefined,doneSaving);
}


/*
ui.popInserts= function (charts) {
  debugger;
  selectedForInsert = undefined;
  ui.hideFilePulldown();
  ui.panelMode = 'insert';
  ui.layout();
  ui.showTheCatalog(ui.insertDivCol1.__element,ui.insertDivCol2.__element,ui.catalogUrl);
}
*/
  
ui.alert = function (msg) {
  mpg.lightbox.pop();
  mpg.lightbox.setHtml(msg);
}


  
ui.itemSaved = true;

//var editor;
  var editorInitialized; 
  ui.initEditor =    function () {
    var editor;
    debugger;
    if (!editorInitialized) {
      ui.editor = editor = ace.edit("codeDiv");
      //editor.setTheme("ace/theme/monokai");
      editor.setTheme("ace/theme/textmate");
      editor.getSession().setMode("ace/mode/javascript");
      editor.renderer.setOption('showLineNumbers',false);
       editor.renderer.setOption('showFoldWidgets',false);
        editor.renderer.setOption('showGutter',false);
       // editor.renderer.setOption('vScrollBarAlwaysVisible',true);
    editorInitialized = 1;
      
    }
  }
  
  ui.editorValue = function () {
    return ui.editor.session.getDocument().getValue()
  }
  
  ui.showInEditor = function (str) {
       debugger;
       ui.initEditor();
       ui.codeUrl = url;
       ui.codeMsg.$html(url);
       pj.httpGet(url,function (error,rs) {
        ui.editor.setValue(rs);//rs
       });
  
  }




var displayEntry = function (selected) {
  var displayEntryField = function (id) {
    var input = ui.entryInputs[id];
    input.$prop('value',selected?(selected[id]?selected[id]:''):'');
  }
  for (var id in  ui.entryInputs) {
    displayEntryField(id);
  }
  if (selected) {
    ui.selectedEntry = selected;
  }
  enableAllButtons();
  ui.hideFilePulldown();
}

ui.entryDoneBut.$click(function () {
  debugger;
  var setEntryField = function (id) {
    debugger;
    var input = ui.entryInputs[id];
    ui.selectedEntry[id] = input.$prop('value');
  }
   for (var id in  ui.entryInputs) {
    setEntryField(id);
  }
  pj.showCatalog(ui.catalogState);
  return;
  ui.selectedEntry.tab = ui.titleInput.$prop('tab');
  ui.selectedEntry.title = ui.titleInput.$prop('value');
  ui.selectedEntry.svg = ui.svgInput.$prop('value');
  ui.selectedEntry.url = ui.urlInput.$prop('value');
  ui.selectedEntry.data = ui.dataInput.$prop('value');
});

ui.browseSvg.$click(function () {
  ui.nowBrowsing = 'svg';
    fb.getDirectory(function (err,list) {
        var filtered = fb.filterDirectoryByExtension(list,'.svg');
        ui.popChooser(filtered,'select');
      });
  });


ui.browseUrl.$click(function () {
  ui.nowBrowsing = 'url';
    fb.getDirectory(function (err,list) {
        var filtered = fb.filterDirectoryByExtension(list,'.js');
        ui.popChooser(filtered,'select');
      });
  });


ui.browseData.$click(function () {
  ui.nowBrowsing = 'data';
    fb.getDirectory(function (err,list) {
        var filtered = fb.filterDirectoryByExtension(list,'.json');
        ui.popChooser(filtered,'select');
      });
  });


ui.showCatalog = function (url) {
     pj.getAndShowCatalog(undefined,ui.catalogTab.__element,[ui.catalogCol1.__element,ui.catalogCol2.__element],url,
       displayEntry,
       function (err,catalogState) {
        ui.catalogState = catalogState;
        return;
        ui.initEditor();
        ui.editor.setValue(catalogState.json);     
     });
}

ui.chooserReturn = function (v) {
  debugger;
  mpg.chooser_lightbox.dismiss();
  var fpath = '['+fb.currentUid()+']'+ v.path;
  ui.selectedEntry[ui.nowBrowsing] = fpath;
  displayEntry(ui.selectedEntry);
  return;
  switch (ui.chooserMode) {
    case "addEntry":
      addEntry(v.path);
      break;
    case 'saveCatalog':
      ui.saveItem(v.path,ui.editorValue());
      break;
    case 'open':
      if (v.deleteRequested) {
        ui.deleteFromDatabase(v.path);
        return;
      }
     var ext = pj.afterLastChar(v.path,'.',true);
     location.href = '/code.html?source='+v.path;
      break;
 
  }
}





var findEntryWithSameTab = function (catalog,index,down) {
  var tab = catalog[index].tab;
  if (down) {
    for (var i = index-1;i>=0;i--) {
      if (catalog[i].tab === tab) {
        return i;
      }
    }
    return -1;
  } else {
    var ln = catalog.length;
    for (var i = index+1;i<ln;i++) {
      if (catalog[i].tab === tab) {
        return i;
      }
    }
    return -1;
  }
}

var getString = function (entry) {
  var rs = '?source='+entry.url;
  var data = entry.data;
  var settings = entry.settings;
  if (data) {
    rs += '&data='+data;
  }
  if (settings) {
    for (var prop in settings) {
      rs += '&'+prop+'='+settings[prop];
    }
  }
  return rs;
}



ui.goStructureBut.$click(function () {
  var dst = '/edit.html'+getString(ui.selectedEntry);
  location.href = dst;
});


ui.goCodeBut.$click(function () {
  var dst = '/code.html'+getString(ui.selectedEntry);
  location.href = dst;
});

ui.goCodeBut.$click(function () {
  var dst = '/code.html?source='+ui.selectedEntry.url+settingsString(ui.selectedEntry.settings);
  location.href = dst;
});


ui.upBut.$click(function () {
  var catalog = ui.catalogState.catalog;
  var idx = catalog.indexOf(ui.selectedEntry);
  var next = findEntryWithSameTab(catalog,idx,true);
  if (next===-1) {
    return;
  }
  debugger;
  console.log('idx',idx);
  catalog.splice(idx,1);
  catalog.splice(next,0,ui.selectedEntry);
  pj.showCatalog(ui.catalogState);
  pj.selectCatalogTab(ui.catalogState,ui.selectedEntry.tab)
  var el = ui.catalogState.elements[next];
  pj.highlightCatalogElement(ui.catalogState,el);
  ui.hideFilePulldown();

});



ui.downBut.$click(function () {
  var catalog = ui.catalogState.catalog;
  var idx = catalog.indexOf(ui.selectedEntry);
  var next = findEntryWithSameTab(catalog,idx,false);
  if (next===-1) {
    return;
  }
  debugger;
  console.log('idx',idx);
  catalog.splice(idx,1);
  catalog.splice(next,0,ui.selectedEntry);
  pj.showCatalog(ui.catalogState);
  pj.selectCatalogTab(ui.catalogState,ui.selectedEntry.tab)
  var el = ui.catalogState.elements[next];
  pj.highlightCatalogElement(ui.catalogState,el);
  ui.hideFilePulldown();

});

ui.deleteBut.$click(function () {
  debugger;
  var catalog = ui.catalogState.catalog;
  var idx = catalog.indexOf(ui.selectedEntry);
  console.log('idx',idx);
  catalog.splice(idx,1);
  pj.showCatalog(ui.catalogState);
  ui.selectedEntry = undefined;
  disableAllButtons();
  displayEntry();// with no argument, this clears the entry table
});

var newEntryTemplate = {title:'New Entry',id:'new',tab:'shape',svg:'[twitter:14822695]/forCatalog/vertical_bar.svg'};

var addNewEntry = function () {
  debugger;
  var newEntry = {};
  for (var p in newEntryTemplate) {
    newEntry[p]=newEntryTemplate[p];
  }
  newEntry.tab = ui.catalogState.selectedTab;
  var catalog = ui.catalogState.catalog;
  var index = catalog.length;
  catalog.push(newEntry);
  ui.selectedEntry = newEntry;
  pj.showCatalog(ui.catalogState);
  displayEntry(newEntry);
  var el = ui.catalogState.elements[index];
  pj.highlightCatalogElement(ui.catalogState,el);
}

ui.newEntryBut.$click(addNewEntry);

pj.tabSelectCallbacks.push(function (tab) {
  debugger;
  var tabWithEntry = false;
  if (ui.selectedEntry) {
    tabWithEntry = ui.selectedEntry.tab  === tab;
  }
  if (tabWithEntry) {
    displayEntry(ui.selectedEntry);
    enableAllButtons();
  } else {
    displayEntry();
    disableAllButtons();
  }
});

/*  
ui.updateBut.$click(function () {
    debugger;
    ui.catalogJSON = ui.editor.getValue();
    try {
      ui.catalogState.catalog = JSON.parse(ui.catalogJSON);
    } catch(e) {
      debugger;
      ui.codeError.$html(e.message);
      return;
    }
    pj.showCatalog(ui.catalogState);
  });
*/
 
  
  
  //stub
  ui.unselect = function () {};
  
