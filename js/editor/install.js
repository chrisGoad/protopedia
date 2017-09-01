
var loadingItem = undefined;

ui.installMainItem = function (source,dataUrl,settings,cb)  {
  ui.mainUrl = source;
  ui.dataUrl = dataUrl;
  if (settings) {
    ui.settings = settings;
  }
  if (source) {
    pj.root = svg.Element.mk('<g/>');
    pj.install(source,ui.afterMainInstall); 
  } else  {
    ui.finishMainInstall();
  }
}

ui.afterMainInstall = function (e,rs) {
  if (e) {
    ui.installError = e;
    ui.finishMainInstall();;
  } else if (rs) {
    delete rs.__sourceUrl;
    ui.main = rs;
  } 
  ui.finishMainInstall();
}

var setBackgroundColor = function (item) {
      if (!item.backgroundColor) {
        item.backgroundColor="white";
      }
   if (!item.__nonRevertable) {
     pj.root.set('__nonRevertable',pj.lift({backgroundColor:1}));
   }
}

ui.installAsSvgContents= function (itm) {
  ui.initControlProto();
  var mn = svg.main;
  if (mn.contents) {
    dom.removeElement(mn.contents);
  }
  mn.contents=itm;
  svg.draw();
}

ui.svgInstall = function () {
  var atTopLevel = ui.mainUrl && pj.endsIn(ui.mainUrl,'.item');
  if (ui.main && atTopLevel) {
    pj.root = ui.main;
  } else if (!pj.root) {
    pj.root = svg.Element.mk('<g/>');
  }

  setBackgroundColor(pj.root);
  var itm = ui.main?ui.main:pj.root;//pj.root;
  svg.main.addBackground(pj.root.backgroundColor);
  ui.installAsSvgContents(pj.root);
  if (ui.main && !atTopLevel) {
    pj.root.set('main',ui.main);
  }
  if (ui.dataUrl) {
    var erm = ui.setDataFromExternalSource(itm,ui.data,ui.dataUrl);
  } else {
    pj.updateRoot(function (node) {
      return !node.__hidden()
    });
  }
  if (pj.root.__draw) {
    pj.root.__draw(svg.main.__element); // update might need things to be in svg
  }
  if (itm.soloInit) { 
    itm.soloInit(); 
  }
  if (!pj.throwOnError) {
    ui.refresh(ui.fitMode);
  } else {
    try {
      ui.refresh(ui.fitMode);
  } catch (e) {
    ui.handleError(e);
  }
}
}

var enableButtons; //defined differently for different pages
ui.fitFactor = 0.8;
ui.findInstance = function (url) {
  var proto = pj.installedItems[url]; //'/diagram/graph2.js'];
  if (!proto) {
    return undefined;
  }
  var rs =  pj.findDescendant(pj.root,function (node) {
    var rs = proto.isPrototypeOf(node);
    return rs;
  });
  if (rs) {
    return rs;
  }
}

var hideInstalledItems = function () {
  return;
  debugger;
  for (var path in pj.installedItems) {
    if (path !== ui.mainUrl) {
      var item = pj.installedItems[path];
      if (svg.Element.isPrototypeOf(item)) {
        item.__hide();
      }
    }
  }
}
ui.finishMainInstall = function () {
  var ue = ui.updateErrors && (ui.updateErrors.length > 0);
  var e = ui.installError;
  if (ue || (e  && (e !== "noUrl"))) {
    if (ue) {
      var emsg = '<p>An error was encountered in running the update function for this item: </p><i>'+pj.updateErrors[0]+'</i></p>';
     } else if (e) {
      var emsg = '<p style="font-weight:bold">'+e+'</p>';
    }
    ui.svgDiv.$html('<div style="padding:150px;background-color:white;text-align:center">'+emsg+'</div>');                  
  }
  if (!ui.installError) {
    pj.ui.itemSource = loadingItem;
  }

  ui.svgInstall();
  ui.layout();
  if (ui.fitMode) svg.main.fitContents(ui.fitFactor);
  if (ui.whichPage === 'code_editor') {
    ui.viewSource();
  } else if (ui.whichPage === 'structure_editor') {
      tree.showItemAndChain(pj.root,'auto',true);// true -> noSelect
  }
  hideInstalledItems();
  enableButtons();
  $(window).resize(function() {
    ui.layout();
   if (ui.fitMode) svg.main.fitContents();
  });
 
}

ui.displayMessageInSvg = function (msg) {
  pj.root.__hide();
  ui.svgMessageDiv.$show();
  ui.svgMessageDiv.$html(msg);
}

function displayDone(el,afterMsg) {
 ui.displayMessage(el,"Done");
 setTimeout(function () {
   ui.displayMessage(el,afterMsg?afterMsg:"");
 },500);
}

 ui.clearError = function () {
   pj.root.__show();
   ui.svgMessageDiv.$hide();
 }

ui.handleError = function (e) {
  debugger;
  if (pj.throwOnError) {
    ui.displayMessageInSvg(e);
  } else {
    pj.error(e.message);
  }
}



ui.installPrototype = function (id,proto) {
  var protos = pj.root.prototypes;
  if (!protos) {
    pj.root.set('prototypes',svg.Element.mk('<g/>'));
  }
  var anm = pj.autoname(pj.root.prototypes,id);
  if (pj.getval(proto,'__parent')) { // already present
    pj.root.prototypes[anm] = proto;
    return proto;
  }
  console.log('install','Adding prototype',anm);
  var iproto = (proto.__get('__sourceUrl'))?proto.instantiate():proto;
  iproto.__hide();
  pj.root.prototypes.set(anm,iproto);
  return iproto;

}

  