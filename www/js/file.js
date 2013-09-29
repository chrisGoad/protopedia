(function (__pj__) {
  var om = __pj__.om;
  var dom = __pj__.dom;
  var draw = __pj__.draw;
  var page = __pj__.page;
  var tree =__pj__.tree;
  // file tree handling
  
  
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
          if (i == (ln-1)) {
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
  
  /*
  tt = pathsToTree(['pj/abc/def','pj','pj/def','pj/abc/z0/z1','pj2/a/b'])
  */
  
  // ground level operators
  
  var jqp = __pj__.jqPrototypes;
  var mpg = __pj__.mainPage;
  
  tree.set("WidgetLine",Object.create(dom.JQ)).namedType();
 // tree.installType("WidgetLine",Object.create(dom.JQ)).namedType();
  tree.set("valueProto",dom.newJQ({tag:"span"}));//,style:{"font-weight":"bold"}});
  
  tree.WidgetLine.mk = function (o) {
    return dom.newJQ(o,tree.WidgetLine);
  }

  var wline = tree.WidgetLine.mk({tag:"div",style:{"font-size":"10pt",color:"black",width:"100%"}});
  jqp.set("widgetLine", wline);
  var mline =  wline.addChild("main",dom.newJQ({tag:"div",style:{}}));
  mline.addChild("toggle",dom.newJQ({tag:"span",html:"&#x25BA;",cursor:"pointer",style:{color:"black"}}));
        
  mline.addChild("theName",dom.newJQ({tag:"span",style:{color:"black"}}));
  om.mline = mline; // for debugging
  tree.wline = wline;
  
  var dpySelected = dom.newJQ({tag:"div",style:{color:"black"}})

  var protoBut = jqp.set("protoButton", tree.WidgetLine.mk({tag:"span",html:"proto",style:{color:"black",width:"100px"}}));

  
  
  om.DNode.mkWidgetLine = function (ownp,clickFun,textFun,forProto,top) {
    if (tree.onlyShowEditable && this.__mfrozen__) return;

    var ww = wline; // for debugging
    var rs = wline.instantiate();
    var m = rs.selectChild("main");
    if (forProto) {
      var tg = m.selectChild("toggle");
      tg.hide();
    }
     
  
    if (top) {
      var pth = this.pathOf(__pj__);
      var txt = pth?pth.join("."):"";
    } else {
      txt = textFun(this);
    }
    
    var thisHere = this;
    var cl = function () {
      rs.toggle();
     
    };
    if (clickFun) {
      var cl2 = function () {
        clickFun (rs);
      }
    }
    if (!forProto) {
      var tspan = m.selectChild("toggle");
      tspan.set("click",cl);
      if (this.__leaf__) tspan.html = " ";
    }
    var nspan = m.selectChild("theName");
    nspan.html = txt;
    var hp = this.hasTreeProto();
    
    var clr = "black";
    nspan.style.color = clr;
    if (cl2) nspan.click = cl2;
 
    if (!forProto) this.widgetDiv = rs;
    rs.forNode = this;
    return rs;
  }
  
  
  
  
  tree.WidgetLine.treeChild = function (id) {
    var fc = this.selectChild("forChildren");
    if (fc) return fc.selectChild(id);
    return undefined;
  }
  
  
  tree.WidgetLine.treeChildren = function (i) {
    var fc = this.selectChild("forChildren");
    if (fc) return fc.theChildren;
    return undefined;
  }
  
  tree.WidgetLine.treeParent = function() {
    var pr = this.parent();
    if (pr) {
      return pr.parent();
    }
    return undefined;
  }
  
  tree.WidgetLine.selectTreePath = function (pth) {
    var cv = this;
    var ln = pth.length;
    for (var i=0;i<ln;i++) {
      var cv = cv[pth[i]]
      if (!cv) return undefined;
    }
    return cv;
  }

  
  
  tree.WidgetLine.treeTop = function () {
    if (this.__treeTop__) return this;
    var pr = this.treeParent(); // the forChildren node intervenes in the ancestry chain
    return pr.treeTop();
  }
  
  tree.WidgetLine.treeChildren = function () {
    if (this.__prim__) return [];
    var fc = this.selectChild("forChildren");
    if (fc) {
      return fc.theChildren;
    }
    return [];
  }
  tree.WidgetLine.childrenNames = function () {
    var rs = [];
    var tc = this.treeChildren();;
    tc.forEach(function (c) {
      var id = c.id;
      if (id !== undefined) {
        rs.push(id);
      }
    });
    return rs;
  }
  
  // selectChild is at the JQ level. this is at the tree level
  tree.WidgetLine.treeSelect = function (nm) {
    if (this.__prim__) return undefined;
    var fc = this.selectChild("forChildren");
    if (fc) {
      var tc = fc.theChildren;
      var ln = tc.length;
      for (var i=0;i<ln;i++) {
        var c = tc[i];
        var id = c.id;
        if (id == nm) {
          return c;
        }
      };
    }
    return undefined;
  }

  
  tree.WidgetLine.selectedLine = function () {
    var tp = this.treeTop();
    return tp.__selectedLine__;
  }
  
  
  tree.WidgetLine.highlightedPart = function () {

    if (this.__prim__) {
      return this.cssSelect("#title");
    } else if (this.__ref__) {
      return this;
    } else {
      return this.selectChild("main");// this.cssSelect("#main>#theName");
    }
  }
  tree.WidgetLine.unselectThisLine = function () {
    this.__selected__ = 0;
    var nm = this.highlightedPart();
    var el = nm.__element__;
    el.css({"background-color":"white"});
  }
  
  tree.WidgetLine.selectThisLine = function (src,knd) { // src = "canvas" or "tree"
    var nd = this.forNode;
    var prnd = this.forParentNode;
    var prp = this.forProp;
    var vse = []; //visible effects
    tree.selectedLine = this;
 
    if (this.__selected__) return;
    tree.selectedNode = nd;

    var tp = this.treeTop();
    var isProto = tp.protoTree; // is this the prototype panel?
    var isFileTree = tp.fileTree; // is this the file tree
    var isShapeTree = tp.s
    var isShapeTree = !(isProto || isFileTree || );
    var drawIt = ((!isFileTree) && (src == "tree"));
    if (isShapeTree) tree.clearProtoTree();
    var ds = tp.dpySelected;
 
    if (isProto) {
      if (nd) {
        var p = om.pathOf(nd,__pj__)
        var ps = p.join(".");
        if (drawIt) vse = nd.visibleProtoEffects();
      } 
    } else if (isShapeTree) { // for right now
      if (nd) {
        var relnd = nd;
      } else {
        relnd = prnd;
      }
      if (nd) {

        var dan = relnd.drawnAncestor();
        if (dan) {
          vse = [dan];
        } else {
          vse = relnd.drawnDescendants();
        }
        }
    }
    var sl = tp.__selectedLine__;
    var cntr = tp.__element__.parent().parent();
    this.__selected__ = 1;
    if (sl) sl.unselectThisLine();
    var el = this.highlightedPart().__element__;
    el.css({"background-color":"rgb(100,140,255)"});
    tp.__selectedLine__ = this;
      
    // take  care of scrolling
    var cht = cntr.height();
    var coffy = cntr.offset().top;
    om.log("tree","SELECTION STAGE 0 offset ",el.offset());
    // now scroll the fellow into view if needed
    var ely = el.offset().top;
    var soff = cntr.scrollTop();
    var hiddenBy = ely - (coffy+cht); // how far is this element below the visible area?
    if (hiddenBy > -40) {
      cntr.scrollTop(soff + hiddenBy+40);
    } else {
      hiddenBy = coffy -ely;
      if (hiddenBy > -40) {
        cntr.scrollTop(soff-hiddenBy-40);
      }
    }
    om.log("tree","SELECTION STAGE 1");

    if (isShapeTree) { // show the prototype in its panel
      if (this.__prim__) {
        tree.showProtoChain(this.forParentNode,this.forProp)
      } else if (this.__ref__) {
        tree.showRef(this.forNode);
      } else {
        tree.showProtoChain(this.forNode);
        if (this.expanded) {
          this.expandProtoChain();
        }
      }
    }
    if (drawIt) draw.mSelect(vse);
    
        om.log("tree","SELECTION DONE");

  }
  
  tree.WidgetLine.ancestorIsSelected = function () {
    if (this.__selected__) return 1;
    var pr = this.treeParent();
    if (!pr) return 0;
    return pr.ancestorIsSelected();
  }

  
  function showFunction(f,pth)  {
    var s = f.toString();
    var lb = __pj__.mainPage.lightbox;
    lb.pop();
    lb.setTopline(pth + " = ");
    var ssp = s.split("\n");
    var ht = "";
    // add html escaping
    ssp.forEach(function (ln) {
      var spln = ln.replace(/ /g,"&nbsp;")
      ht += "<div>"+spln+"</div>";
    })
    var ht = "<pre>"+om.escapeHtml(s)+"</pre>";
    lb.setContent(ht);   
  }
 
  // showProto shows the values of children, as inherited
  
  
  tree.showRef = function (nd,dpysel) {
    var wl = tree.showProtoTop(nd,0);
    tree.setProtoTitle("Reference");
    tree.protoPanelShowsRef = 1;
    wl.expand();
    return wl;
  }
  
  // cause the tree below here to be expanded in the same places as src, when possible. For keeping the main and prototrees in synch NOT IN USE
  
  tree.WidgetLine.expandLike = function (src) {
    var nms = src.childrenNames();
    var ln = nms.length;
    if (ln) {
      this.expand();
    } else {
      return;
    }
    var thisHere = this;
    nms.forEach(function (nm) {
      var ch = src.treeSelect(nm);
      var mych = thisHere.treeSelect(nm);
      if (mych) {
        ch.__protoLine__ = mych;
        if (ch.expanded) {
          mych.expandLike(ch);
        }
      }
    });
  }
  
  
  
  tree.WidgetLine.applyToProtoChain = function (fn) {
    var cnd = this.forNode;
    while (true) {
      var cnd = Object.getPrototypeOf(cnd);
      var pline = cnd.__protoLine__;
      if (pline) {
        fn(pline);
      } else  {
        return;  
      }
      //code
    }
  }
  
  tree.WidgetLine.expandProtoChain = function () {
    this.applyToProtoChain(function (wl) {
      wl.expand();
    });
  }
  
  tree.WidgetLine.contractProtoChain = function () {
    this.applyToProtoChain(function (wl) {wl.contract()});
  }
    
  om.LNode.mkWidgetLine = om.DNode.mkWidgetLine;
  
  var hiddenProperties = {__record__:1,__isType__:1,__record_:1,__externalReferences__:1,__selected__:1,__selectedPart__:1,
                          __notes__:1,__computed__:1,__descendantSelected__:1,__fieldStatus__:1,__source__:1,__about__:1,
                          __overrides__:1,__mfrozen__:1,__inputFunctions__:1,__outputFunctions__:1,__current__:1,__canvasDimensions__:1,
                          __beenModified__:1,__autonamed__:1,__origin__:1,__from__:1,__changedThisSession__:1,__topNote__:1,
                          __saveCount__:1,__saveCountForNote__:1};
  
  
  tree.hasEditableField = function (nd,overriden) { // hereditary
    for (var k in nd) {
      if ((!om.internal(k))&&(!hiddenProperties[k])) {
        var ch = nd[k];
        if (typeof ch == "function") continue;
        var chovr = undefined;
        if (overriden) {
          var chovr = overriden[k];
        }
        var isn = om.isNode(ch);
        if (isn) {
          var che = tree.hasEditableField(ch,chovr);
          if (che) return true;
        } else if ((!chovr) && (!nd.fieldIsFrozen(k))) {
          return true;
        }
      }
    }
    return false;
  }
  
  tree.applyOutputF = function(nd,k,v) {
    var outf = nd.getOutputF(k);
    if (outf) {
      return outf(v,nd);
    } else {
      return v;
    }
  }
  
  
  tree.WidgetLine.popNote= function () { // src = "canvas" or "tree"
    var nd = this.forNode;
    var prnd = this.forParentNode;
    var prp = this.forProp;
    var vse = []; //visible effects
    var nt = "";
    if (prnd) {
      var nt = prnd.getNote(prp);
      var nprp = prp;
    } else {
      var ndp = nd.__parent__;
      nprp = nd.__name__;
      nt = ndp.getNote(nprp);
    }
    if (nt) tree.setNote(nprp,nt);
  }
  
  tree.mkPrimWidgetLine = function (options) { // for constants (strings, nums etc).  nd is the node whose property this line displays
    var nd = options.node;
    var k = options.property;
    var clickFun = options.clickFun;
    var isProto = options.isProto;
    var overriden = options.overridden;
    var noEdit = options.noEdit;
    var atFrontier = options.atFrontier;
    var ownp = nd.hasOwnProperty(k);
    var prnd = nd;
    var isDataSource = om.DataSource.isPrototypeOf(nd) && (k=="data"); //gets special treatment
      // if this is outside the tree, then don't display this
    if ((!prnd.__parent__)||om.inStdLib(prnd)) return;
    // functions are never displayed except with the node that owns them
    var frozen = nd.fieldIsFrozen(k);
  
    var computed = nd.isComputed();
    var v = tree.applyOutputF(nd,k,nd[k]);
  
    if (((typeof v == "function")) && (!ownp)) {
      return;
    }
    var cl = "black";
    var rs = tree.WidgetLine.mk({tag:"div",style:{color:cl}});
    rs.__prim__ = 1;
    rs.forParentNode = nd;
    rs.forProp = k;
    var isFun = typeof v == "function";
    var txt = k;
    var notePop;
    if (nd.getNote(k)) {
      var qm =  dom.newJQ({tag:"span",html:"? ",style:{"cursor":"pointer","font-weight":"bold"}});
      rs.addChild("qm",qm);
      var notePop = function () {rs.popNote()};
      qm.click = notePop;
      var sp =  dom.newJQ({tag:"span",html:txt,style:{cursor:"pointer",color:cl}});
      sp.click = notePop;
    } else {
      var sp =  dom.newJQ({tag:"span",html:txt,style:{color:cl}});

    }
  
    rs.addChild("title",sp);
    if (clickFun) {
      var cl2 = function () {
        clickFun (rs);
      }
      rs.click = cl2;
    }
    var editable = !(frozen || overriden || noEdit);
    if (isFun) {
      if (!tree.showFunctions) return;
      var funBut =  jqp.button.instantiate();
      funBut.html = " Function ";
      rs.addChild("funb",funBut);
      var pth = om.pathToString(nd.pathOf(__pj__).concat(k),".");
      funBut.click = function () {showFunction(v,pth)};
    } else {
      if ((!ownp) && (!atFrontier) && (!noEdit)) { // all properties at the frontier don't count as overriden; that's the last place they can be edited
        var inherited = 1;
      }
      if (tree.onlyShowEditable && !editable ) {
        return undefined;
      }
      if (overriden) {
        vts = "<b>overridden</b>";
      } else  if (inherited) {
        var vts = "inherited";
      } else {
        vts = om.nDigits(v,4);
      } 
      if (!vts) vts = "";
      if (!editable) {
        var inp = tree.valueProto.instantiate();
        inp.html = " "+vts;
      } else {
        
        function measure(txt) {
          var sp = dom.measureSpan;
          if (!sp){
            var sp = $('<span></span>');
            sp.css('font','8pt arial');
            $('body').append(sp);
            sp.hide();
          }
          sp.html(txt)
          var rs = sp.width();
          sp.remove();
          return rs;
        }
        var computeWd = function (s) {
          var wm = measure(s);
          return Math.max(50,wm+20)
        }
        var inpwd = computeWd(vts);
        var inp = dom.newJQ({tag:"input",type:"input",attributes:{value:vts},style:{font:"8pt arial","background-color":"#e7e7ee",width:inpwd+"px","margin-left":"10px"}});
          var blurH = function () {
            var pv = tree.applyOutputF(nd,k,nd[k]);  // previous value

            var vl = inp.__element__.prop("value");
            if (vl == "") {
              delete nd[k];
            } else {
              if (vl == "inherited") return;
              var inf = nd.getInputF(k);
              if (inf) {
                var nv = inf(vl,nd);
                if (om.isObject(nv)) {
                  page.alert(nv.message);
                  inp.__element__.prop("value",pv);// put previous value back in
                  return;
                }
              } else {
                var nv = parseFloat(vl);
                if (isNaN(nv)) {
                  nv = $.trim(vl);
                }
              }
              if (pv == nv) {
                om.log("tree",k+" UNCHANGED ",pv,nv);
                return;
              } else {
                om.log("tree",k+" CHANGED",pv,nv);
              }
              nd[k] =  nv;
              nd.transferToOverride(draw.overrides,draw.wsRoot,[k]);
              var nwd = computeWd(String(nv));
              inp.css({'width':nwd+"px"});
              draw.wsRoot.__changedThisSession__ = 1;
              if (nd.isComputed()){
                nd.addOverride(draw.overrides,k,draw.wsRoot);
              }
            }
            if (tree.autoUpdate) {
              tree.updateAndShow("tree");
            } else {
              draw.refresh();
            }
        }
        inp.blur = blurH;
        var focusH = function () {
          rs.selectThisLine("tree","input");
        };
        inp.enter = blurH;
      }
      rs.addChild("val",inp);
    }
    return rs;
  }
  
  
  tree.mkRangeWidgetLine = function (nd,lb,ub,increment) {
    // usually increment = (ub+1-lb) but not always for the last range
    var cl = "black";
    var rs = wline.instantiate();
    rs.__range__ = 1;
    rs.forNode = nd;
    rs.lowerBound = lb;
    rs.upperBound = ub;
    rs.increment = increment;
    var txt = "["+lb+"..."+ub+"]";
    var m = rs.selectChild("main");
    var nspan = m.selectChild("theName");
    nspan.html = txt;
    rs.id = txt;
    var tspan = m.selectChild("toggle");
    var cl = function () {
      rs.toggle();
    };
    tspan.click = cl;
   
    return rs;
  }
  
    
  tree.mkRefWidgetLine = function (top,k,v) { // for constants (strings, nums etc).  nd is the node whose property this line displays
    var rf = om.refPath(v,top);
    if (!rf) return undefined;
    var cl = "black";
    var rs = tree.WidgetLine.mk({tag:"div",style:{color:cl}});
    rs.forNode = v;
    var sp =  dom.newJQ({tag:"span",html:k + " REF "+rf,style:{color:cl}});
    rs.addChild("ttl",sp);
    rs.click = function () {
      rs.selectThisLine("tree");
    }
    rs.__ref__ =1;
    return rs;
  }
  
  
  tree.WidgetLine.visible = function () {
    if (this.__treeTop__) return true;
    var pr = this.treeParent();
    return pr.visible() && pr.expanded;
  }
  
  // the workspace tree might have been recomputed or otherwise modified, breaking the two-way links between widgetlines
  // and nodes. This fixes them up, removing subtrees where there are mismatches. It also installs new values into primwidgetlines.
  
  // returns true if this line does not have a match in the workspace, that is, if the parent needs reexpansion
  
  tree.WidgetLine.nonRangeParent = function () {
    var rs = this.treeParent();
    if ( !rs) return undefined;
    if (rs.__range__) {
      return rs.nonRangeParent();
    } else {
      return rs;
    }
  }
  
  // if "this" is a range parent
  // check that its ranges are still consistent with the population of nodes
  
  
  tree.WidgetLine.checkRanges = function () {
    var fsz = this.rangesForSize;
    if (fsz == undefined) return true;
    var nd = this.forNode;
    var rs  = fsz == nd.length;
    om.log("tree","checked range for",this.id," result=",rs);
    return rs;
  }
  
  tree.WidgetLine.adjust = function () {
    var mismatch = 0; // do we have a match?
    var nm = this.id;
    om.log("checking adjustment of",nm);
    var isRange = this.__range__;
    var tpr = this.nonRangeParent();
    var nd = this.forNode;
    var isPrim =  this.__prim__;
    if (isPrim) {
      var prnd = this.forParentNode;
      var k = this.forProp;
      var vl =  tree.applyOutputF(prnd,k,prnd[k]); // value in the workspace
      var inp = this.selectChild("val");
      inp.prop("value",vl);
      om.log("tree","checked adjustment of ",nm,"ok");

      return;
    }
    if (tpr) {
      if (isRange) { // ranges don't correspond to any particular node. We pass them by, but checkthat the range label corresponds to a real set of nodes
        if (!tpr.checkRanges()) {
          om.log("tree","checked adjustment of ",nm,"ADJUSTMENT NEEDED");
          return true;
        }
      } else {
      
        var pnd = tpr.forNode;
        var nd = pnd[nm];
        if (!nd || (typeof nd != "object")) {
          om.log("tree","checked adjustment of ",nm,"ADJUSTMENT NEEDED");
          return true;
        }
        if (nd != this.forNode) {
          om.log("tree","adjusted "+nm);
        }
        this.forNode = nd;
        nd.widgetDiv = this;
      }
    } else {
      nd  = this.forNode;
    }
    var ch = this.treeChildren();
    if (ch) {
      ch.forEach(function (c) {
        if (c.__prim__) {
          c.forParentNode = nd;
        }
        if (c.adjust()) {
          om.log("tree",c.id,"needed adjustment");
          mismatch = 1;
        }
      });
    }
    // now check if each child of nd has a widget; that is if reexpansion is needed to bring new nodes in
    if (!isRange && (this.expanded) && !mismatch) {
      nd.iterTreeItems(function (ch) {
        if (!hiddenProperties[ch.__name__] && !ch.widgetDiv) {
          om.log("tree","child without widgetDiv found:",ch.__name__);
          mismatch = 1;
        }
      },true);
    }
    if (mismatch) {
      om.log("tree","reExapanding ",nd.__name__);

      this.reExpand();
    }
    om.log("tree","checked adjustment of ",nm,"ok");
    return false;  
  }
  //  only works and needed on the workspace side, not on protos, hence no ovr
  
  tree.WidgetLine.reExpand = function () {
    var ch = this.selectChild("forChildren")
    if (!ch) return; //wasn't expanded
    ch.removeChildren();
    ch.__reExpanding__ = 1;
    this.expanded = 0;
    this.expand();
    ch.__reExpanding = 0;
  }
  // assure that the children are visible; unless there are more than tree.WidgetLine.maxChildren. In this case, display only the target
//  tree.WidgetLine.expand = function (targetName,showTargetOnly) {
  tree.WidgetLine.expand = function (ovr,noEdit,atFrontier) {
    var nd = this.forNode;
    if (!nd) return false;  
    if (tree.onlyShowEditable && !tree.hasEditableField(nd,ovr)) return false;
    var tp = this.treeTop();
    var isProto = tp.protoTree && (!tree.protoPanelShowsRef);
    var fileTree = tp.fileTree;
    if (isProto) {
      var plineOf = nd.__protoLine__;
    }
    var isLNode = om.LNode.isPrototypeOf(nd);
    if (this.expanded) return; 
    var ch = this.selectChild("forChildren");
    if (!ch) {
      ch  = dom.newJQ({tag:"div",style:{"margin-left":"20px"}});
      this.addChild("forChildren",ch);
      var newCh = true;
    } else {
      newCh = ch.__reExpanding__;
      ch.show();
    }
    
    
    
    function addLine(ch,nd,k,tc) { // ch = jq element to add to nd = the parent, k = prop, tc = child
      if (hiddenProperties[k]) return;
      if (ch.selectChild(k)) return; //already there
      var isnd = om.isNode(tc);
      if (isnd && !nd.treeProperty(k)) {
        if (!nd.hasOwnProperty(k)) return;
        var ln = tree.mkRefWidgetLine(tp.forNode,k,tc);
      } else if (isnd) {
        if (tree.onlyShowEditable && (!tree.hasEditableField(nd[k],ovr?ovr[k]:undefined))) return;
        var ln = tc.mkWidgetLine(true,tp.__clickFun__,tp.__textFun__,isProto);
      } else {
        var overriden = ovr && ovr[k];
        var options = {node:nd,property:k,clickFun:tp.__clickFun__,isProto:isProto,overridden:overriden,noEdit:noEdit,atFrontier:atFrontier}
        ln = tree.mkPrimWidgetLine(options);
      }
      if (ln) ch.addChild(k,ln);
      return ln;
    }
    
    function addRangeLine(nd,lb,ub,increment) { // nd = the parent, k = prop, tc = child
      var  ln = tree.mkRangeWidgetLine(nd,lb,ub,increment);
      ch.addChild(k,ln);
      return ln;
    }
      
      
    
    function addRanges(nd,lb,ub,incr) {
      if (incr < 10) {

        for (var rk=lb;rk<=ub;rk++) {
          var rv = nd[rk];
          addLine(ch,nd,rk,rv);
        }
        return;
      }
      var nln = ub+1-lb;
      var ci = lb;
      var cub = lb;
      while (cub  < ub) {
        var cub = Math.min(ub,ci+incr-1);
        if ((cub + 1) >= ub) {
          cub = ub;
        }
        addRangeLine(nd,ci,cub,incr);
        ci = ci + incr;
      }
    }
    if (this.__range__ && newCh) {
      var lb = this.lowerBound;
      var ub = this.upperBound;
      var incr = this.increment;
      var incr = incr/10;
      addRanges(nd,lb,ub,incr);
      finishOff(this);
      return;
    }
    rs = undefined;
    if (newCh) { //new children
      if (this.__multiRoot__) {
        for (var k in nd) {
          if (nd.hasOwnProperty(k) && (k!="widgetDiv") && (!om.internal(k))) {
            var tc = nd[k];
            ln = addLine(ch,nd,k,tc);
          }
        }
      } else {
        var toIter =   function (tc,k) {
          addLine(ch,nd,k,tc);
        }   
        if (isLNode) {
          var nln = nd.length;
          var lg10 = Math.floor(Math.log(nln)/Math.log(10));
          //var pw10 = Math.pow(10,lg10);
          var incr = Math.pow(10,lg10);
          if (incr*2 > nln) {
            incr = incr/10;
            //code
          }
          addRanges(nd,0,nln-1,incr);
          this.rangesForSize = nln;
        } else {
           nd.iterInheritedItems(toIter,tree.showFunctions,true); // true = alphabetical
        }
      }
      // want prototype in there, though it is not enumerable
    } else {
      ch.show();
    }
    function finishOff(w){
      if (w.__element__) {
        w.install();
      }
      w.expanded = 1;
      w.hasBeenExpanded = 1;
    }
    finishOff(this);
    if (!isProto) this.expandProtoChain();
    return rs;
  }
  
  tree.WidgetLine.fullyExpand = function (ovr,noEdit,atFrontier) {
    this.expand(ovr,noEdit,atFrontier);
    var ch = this.treeChildren();
    if (ch) {
      ch.forEach(function (c) {
        if (!c.__prim__) {
          var cnd = c.forNode;
          var nm = cnd.__name__;
          var covr = ovr?ovr[nm]:undefined;
          c.fullyExpand(covr,noEdit,atFrontier);
        }
      });
    }
  }

  

  // follow the path down as far as it is reflelib.WidgetLine.expandcted in the widget tree (ie the widgetDivs). return a pair [exit,remainingPath]
  // exit is the node just before the path leaves the tree (if it does, or where the path leads)
  // remaining path is what is left
  // returns a pair: the nearest ancestor with a widget line, and the path leading from there
  
  om.DNode.ancestorWithWidgetLine = function () {
     var pth = [];
     var cnd = this;
     while (true) {
      if (cnd.widgetDiv) return {node:cnd,path:pth};
      pth.unshift(cnd.__name__);
      cnd = om.getval(cnd,"__parent__");
      if (!cnd) return undefined;
      
     }
  }
  
  om.DNode.ancestorBelow = function (nd) {
    var pr = om.getval(this,"__parent__")
    if (!pr) return undefined;
    if (pr == nd) return this;
    return pr.ancestorBelow(nd);
  }
  // this adds a DNode into the widget tree structure. There are two cases
  // If this's parent is in the tree, then whichTree is not needed
  // ow, the node is being added to a multiRoot, given by whichTree.
  // this is for the protos, which are rooted at i.
  
  
  om.DNode.addWidgetLine = function (whichTree) {
    if (this.widgetDiv) return ; //already done
    var pth = om.pathOf(this,__pj__);
    var aww = this.ancestorWithWidgetLine();
    if (whichTree) {
      var top = whichTree;
    } 
    if (whichTree && !aww) { // no ancestor is yet added to the widget tree; add an ancestor to the top level
        var nd = whichTree.forNode;
        var ab = this.ancestorBelow(__pj__);
        nd[ab.__name__] = ab;
        var ch = whichTree.selectChild("forChildren");
    
    } else {
      var pth = aww.path;
      var nd = aww.node;
      var wd = nd.widgetDiv;
      top = wd.treeTop();
      var p0 = pth[0];
      ch = wd.selectChild("forChildren");
    }
    if (!ch) return; // never been expanded;
    var ln = this.mkWidgetLine(true,top.__clickFun__,top.__textFun__);
    ch.addChild(this.__name__,ln);
    ln.install(); 
  }

  // find the range child, if any which contains n
  tree.WidgetLine.findRangeChild = function (n) {
    var tc = this.treeChildren();
    if  (tc && (tc.length)) {
      var c0 = tc[0]; // if any children are ranges, the first will be
      var rng = c0.__range__;
      if (rng) {
        var ln = tc.length;
        for (var i=0;i<ln;i++) {
          var c = tc[i];
          var lb = c.lowerBound;
          var ub = c.upperBound;
          if ((lb <= n) && (n <= ub)) {
            return c;
          }
        }
      }
    }
    return undefined;
  }
  // this assures that the parent is expanded, and this node is visible
  om.DNode.expandToHere = function () {
    var wd = om.getval(this,"widgetDiv");
    if (wd && wd.visible()) {
      return;
    }
    var pr = this.__parent__;
    pr.expandToHere();
    // pr might have range kids if pr is an LNode
    var pwd = om.getval(pr,"widgetDiv");
    pwd.expand();
    var isLNode = om.LNode.isPrototypeOf(pr);
    if (isLNode) {
      var n = this.__name__;
      var cw = pwd;
      while (cw) {
        var cw = cw.findRangeChild(n);
        if (cw) {
          cw.expand();
        }
      }

    }
  }
  
  om.LNode.expandToHere = om.DNode.expandToHere;
 
  
  tree.WidgetLine.contract = function () {
    // generates widget lines for the childern
    if (!this.expanded) return;
    var ch = this.selectChild("forChildren");
    ch.hide();
    this.expanded = false;
    this.contractProtoChain();
  }
  
  
  
  tree.WidgetLine.toggle = function () {
   
    var tg = this.cssSelect('#main>#toggle');
    if (this.expanded) {
      this.contract();
      tg.__element__.html('&#x25BA;');
    } else {
      this.expand();
      var nd = this.forNode;
      tg.__element__.html('&#x25BC;');
    }
  }
  om.LNode.expandWidgetLine = om.DNode.expandWidgetLine;
  om.LNode.contractWidgetLine = om.DNode.contractWidgetLine;
  om.LNode.toggleWidgetLine =  om.DNode.toggleWidgetLine;
  
  
  tree.attachTreeWidgets = function (div,roots,clickFun,textFun,multiRoot,forProto) {
     var lnr = roots.length;
    if (multiRoot) {
      // make a fake DNode (one which is not the parent of its children)
      var rnd = om.DNode.mk();
      roots.forEach(function (v) {
        rnd[v.__name__] = v;
      });
    } else {
      rnd = roots[0];
    }
    var ds = dpySelected.instantiate();
    var wline = rnd.mkWidgetLine(true,clickFun,textFun,forProto,true);
    wline.__treeTop__ = 1;
    wline.__multiRoot__ = multiRoot;
    ds.install(div); // interupt the JQ tree here
    wline.install(div);
    wline.__clickFun__ = clickFun;
    wline.__textFun__ = textFun;
    wline.dpySelected = ds;
    return wline;
    
 
  }
  
  tree.attachTreeWidget = function (div,root,clickFun,textFun,multiRoot,forProto) {
    var ds = dpySelected.instantiate();
    var wline = root.mkWidgetLine(true,clickFun,textFun,forProto,true);
    wline.__treeTop__ = 1;
    //wline.__multiRoot__ = multiRoot;
    ds.install(div); // interupt the JQ tree here
    wline.install(div);
    wline.__clickFun__ = clickFun;
    wline.__textFun__ = textFun;
    wline.dpySelected = ds;
    return wline;
 
  }
  /*
  tree.attachTreeWidget = function (div,root,clickFun,textFun,forProto) {
     return tree.attachTreeWidgets(div,[root],clickFun,textFun,false,forProto);
  }
  */
  om.DNode.atProtoFrontier = function () { // the next fellow in the prototype chain is outside the ws
    prnd = Object.getPrototypeOf(this);
    return (!prnd.__parent__)||(!prnd.inWs());
  }
  
  
  //n = nth in  proto chain.
  // ovr is an object with properties k:1 where k is overriden further up the chain, or k:covr , where covr is the ovr tree for prop k
  tree.showProto = function (prnd,k,n,ovr) {
    var inWs = prnd.inWs();
    if (inWs) {
      var atF =  !(Object.getPrototypeOf(prnd).inWs());
    } else {
      atF = false;
    }
    var wl = tree.showProtoTop(prnd,n);
    prnd.__protoLine__ = wl; // gives the correspondence between main tree, and proto tree
    wl.fullyExpand(ovr,!inWs,atF);
    return;
  }
  
  tree.showProtoChain = function (nd,k) {
    tree.protoPanelShowsRef = 0;
    tree.protoState = {nd:nd,k:k}
    tree.setProtoTitle("Prototype Chain");
    tree.protoDivRest.empty();
    var cnd = nd;
    var n = 0;
    var ovr = {};
    // ovr is a tree structure which contains, hereditarily, the properties set in the node nd,, rather than the prototype prnd
    // in other words, ovr shows what is overriden
    
    function addToOvr(nd,prnd,ov) {
      var op = Object.getOwnPropertyNames(nd);
      op.forEach(function (p) {
        var v = nd[p];
        var pv = prnd[p];
        
        if (om.isAtomic(v)||(typeof v == "function")) {
          ov[p] = 1;
        } else if (nd.treeProperty(p)) {
          if (!pv) { // this branch did not come from a prototype
            return;
          }
          var covr = ovr[p];
          if (!covr) {
            ovr[p] = covr = {};
          }
          addToOvr(v,pv,covr);
        }
      });
    }
    addToOvr(nd,Object.getPrototypeOf(nd),ovr);
    var inWs = true;
    while (true) {
      var prnd = Object.getPrototypeOf(cnd);
      if ((!prnd.__parent__)||(prnd == cnd)) {
       return;
      }
      var atF = inWs && (!prnd.inWs());
      if (atF) {
        tree.protoDivRest.__element__.append("<div style='margin-top:10pt;margin-bottom:10pt;width:100%;height:2px;color:white;background-color:red'>_</div>");
        tree.protoDivRest.__element__.append("<div style='font-size:8pt'>The prototypes below are outside the workspace and cannot be edited</div>");
        inWs = false;
      }
      tree.showProto(prnd,k,n++,ovr);
      cnd = prnd;
      addToOvr(cnd,Object.getPrototypeOf(cnd),ovr);
    }
  }
  
  tree.refreshProtoChain = function () {
    var s= tree.protoState;
    if (s) {
      tree.showProtoChain(s.nd,s.k);
    }
  }

  tree.shapeTextFun = function (nd) {
  
    var tnm = nd.__name__;
    var nm = (typeof tnm == "undefined")?"root":tnm;
    var  tpn=nd.protoName();
    if (tpn == "DNode") {
      return nm;
    } else {
      return nm + " : " + tpn;
    }
  }
    
    
// n  is the index of this tree in the prototype chain

  tree.setProtoTitle = function (txt) {
    tree.protoDivTitle.__element__.html(txt);
  }
  
    tree.showProtoTop = function (o,n) {
      var subdiv = tree.protoSubDiv.instantiate();    
      tree.protoDivRest.addChild(subdiv);
      subdiv.install();
      var clickFun = function (wl) {
         om.log("tree","CLICKKK ",wl);
        wl.selectThisLine("tree");
      }
      var rs = tree.attachTreeWidget(subdiv.__element__,o,clickFun,tree.shapeTextFun,true);
      rs.protoTree = 1;
      return rs;

    }
    
    
    

    tree.clearProtoTree = function (o) {
      tree.protoDivRest.__element__.empty();
    }
    
    
  tree.attachShapeTree= function (root) {
    var clickFun = function (wl) {
      om.log("tree","CLICKKK ",wl);
      wl.selectThisLine("tree");
    }
    tree.obDivRest.empty();
    var tr = tree.attachTreeWidgets(tree.obDivRest.__element__,[root],clickFun,tree.shapeTextFun);
    tr.isShapeTree = true;
    if (om.shapeTree) {
      tr.expandLike(om.shapeTree);
    }
    om.shapeTree = tr;

  }
  
   om.attachProtoTrees= function (roots) {
    var clickFun = function (wl) {
      om.log("tree","CLICKKK ",wl);
      wl.selectThisLine("tree");
    }
    tree.protoTree = tree.attachTreeWidgets($('#obDiv'),roots,clickFun,tree.shapeTextFun,true);// multiRoot
  }
  
  
  tree.excludeFromProtos = {om:1,fileTree:1,jqPrototypes:1,lightbox:1,geom:1,mainPage:1,top:1,trees:1,draw:1};
  
  tree.initProtoTreeWidget = function () {
    var kys = Object.keys(__pj__);
    var rts = [];
    kys.forEach(function (ky) {
      if (!tree.excludeFromProtos[ky]) rts.push(__pj__[ky]);
    });
    tree.attachProtoTrees(rts);    
  }
  
  tree.initShapeTreeWidget = function () {
    draw.wsRoot.deepSetProp("widgetDiv",undefined);
    tree.attachShapeTree(draw.wsRoot);    
  }

  
  tree.adjust = function () {
    om.shapeTree.adjust();
  }
  
  
  tree.openTop = function () {
    om.shapeTree.expand();
  }
  
  
  
  
})(__pj__);
