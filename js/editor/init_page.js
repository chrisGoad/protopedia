


ui.genButtons = function (container,options,cb) {
  ui.addButton(container,'tutorial','Intro ','/edit.html?source=/repo1/startchart/column.js&intro=1');
  if (ui.whichPage === 'structure_editor') {
    ui.addButton(container,'codeEditor','Code Editor','/code.html');
  } else {
    ui.addButton(container,'editor','Structure Editor','/edit.html');
  }
  ui.genStdButtons(container,cb);
}

ui.genMainPage = function (cb) {
  if (pj.mainPage) return;
  pj.mainPage = mpg;
  if (ui.includeDoc) {
    mpg.addChild("doc",ui.docDiv);
  }
  ui.mpg.__addToDom(); 
  svg.main = svg.Root.mk(ui.svgDiv.__element);
  svg.main.activateInspectorListeners();
  svg.main.addButtons("View");
  pj.root = svg.Element.mk('<g/>'); // to be replaced by incoming item, usually
  svg.main.contents=pj.root;
  pj.root.__sourceUrl = ui.source;
  $('.mainTitle').click(function () {
    location.href = "http://prototypejungle.org";
  });
  if (ui.upBut) {
    enableButton(ui.upBut,false);
    enableButton(ui.topBut,false);
    enableButton(ui.downBut,false);
  }
  ui.genButtons(ui.ctopDiv.__element,{});
    $('body').css({"background-color":"#eeeeee"});
    var r = geom.Rectangle.mk({corner:[0,0],extent:[500,200]});
    var insertR = geom.Rectangle.mk({corner:[0,0],extent:[700,500]});
     var lb = lightbox.newLightbox(r);
    lb.box.$css({"padding-left":"20px"}); 
    mpg.set("lightbox",lb);
    mpg.set("insert_lightbox",lightbox.newLightbox(insertR));
    mpg.set("chooser_lightbox",lightbox.newLightbox(insertR));
    mpg.set("textedit_lightbox",lightbox.newLightbox(r));
 
    ui.layout();
    if (ui.whichPage === 'code_editor') {
      pj.returnValue = function () {};
      if (ui.source) {
        pj.httpGet(ui.source,function (erm,rs) {
          cb();
       });
      } else {
        cb();
      }
    } else {
      cb();
    }
   
}

var mainGetVars = {'source':true,'catalog':true,'intro':true,'data':true};

function processQuery(iq) {
  var q = ui.parseQuerystring();
  var intro = q.intro;
  ui.source = q.source;
  ui.dataUrl = q.data;
  var catalog = q.catalog;
  ui.catalogUrl = catalog?catalog:'[twitter:14822695]/forCatalog/default.catalog';//'/catalog/default.catalog';
  if (intro) {
    ui.intro = true;
    ui.docDiv.src = "/doc/intro.html"; 
  } else {
    ui.docDiv.$hide();
  }
  var settings = {};
  for (var s in q) {
    if (!mainGetVars[s]) {
      var qs = q[s];
      var nqs = Number(qs);
      settings[s] = isNaN(nqs)?qs:nqs;
    }
  }
  ui.settings = settings;
}  

var initFsel; // defined differently per page

ui.initPage = function (o) {
  fb.setCurrentUser(function () {
    ui.inInspector = true;
    var q = ui.parseQuerystring();
    if (!processQuery(q)) {
      var noUrl = true;
    }
    initFsel();
    ui.genMainPage(ui.afterPageGenerated);
  });
}

ui.afterPageGenerated = function () {
  ui.installMainItem(ui.source,ui.dataUrl);//,undefined,ui.afterTheInstall);  
}


  
    