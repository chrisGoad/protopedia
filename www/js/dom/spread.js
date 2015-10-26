

(function (pj) {
  
// This is one of the code files assembled into pjdom.js. //start extract and //end extract indicate the part used in the assembly
//start extract

/* There are two ways of treating categories. In the simpler model, a single prototype is used.
 * when the marks are generated, they are placed in a byCategory multi-map, which maps categories to
 * sets of indicices. Then the application can, eg, set the colors of these marks by category.
 * In the fancier version, a separate prototype is produced for each category; this multiprototye version will be used
 * if marks.multiPrototype is true.


 * For a Marks object m, m.marks and m.modified hold the individual marks. m.modified is a group with elements m[i] defined in the cases
 * where marks[i] === '__modified'.!

 * Currently, 3/8/15, multiPrototype is dormant, and the modified case is not yet treated in the code for multiPrototype
 */

pj.defineSpread = function (groupConstructor) {
  pj.set('Spread',groupConstructor()).__namedType(); 

/* a utility. Given an array of categories, and a master prototype
 * it fills in missing categories with instances of the master prototype, and also initializes colors
 */

 pj.Spread.fixupCategories = function (icategories) {
    var categories = icategories?icategories:[];
    var mc = this.categorizedPrototypes;
    if (!mc) {
      mc = this.set('categorizedPrototypes',pj.Object.mk());
      //pj.declareComputed(mc);
    }
    var mp = this.masterPrototype;
    var thisHere = this;
    var fe = function (c,idx) {
      if (!mc[c]) {
        var cp = mp.instantiate();
        cp.__markProto = 1;
        mc.set(c,cp);
        if (1  || thisHere.randomizeColors && cp.setColor) {
          console.log("IDX",idx);
          cp.setColor(pj.svg.stdColor(idx+1));
        }
      }
    }
    categories.forEach(fe);
    fe('defaultPrototype',0);
  }
  

  function categoryCounts(dt,startIndex) {
    var dln = dt.length;
    var rs = {};
    var perEl = function (el) {
      var dcat = el.category;
      var cat = (dcat===undefined)?'__default':dcat;
      var sf = rs[cat];
      rs[cat] = (sf===undefined)?1:sf+1;
    }
    if (pj.Array.isPrototypeOf(dt)) {
      dt.forEach(perEl);
    } else {
      pj.forEachTreeProperty(dt,perEl);
    }
    return rs;
    for (var i=startIndex;i<dln;i++) {
      var dcat = dt[i].category;
      var cat = (dcat===undefined)?'__default':dcat;
      var sf = rs[cat];
      rs[cat] = (sf===undefined)?1:sf+1;
    }
    return rs;
  }
  
 /* 
   * It is more efficient to instantiate a single object multiple times
   * So, we prebuild the supply of marks we will need, building them in batches by category
  */
 
  function buildInstanceSupply(marks,ip,dt,byCategory) {
    var i,n,irs,rs,irs,instances,proto,cat,ccnts,dataln,modln,mods,modcnt,mdi,sz;
    pj.tlog('Start Instance supply; byCategory',byCategory);
    if (byCategory) {
      ccnts = categoryCounts(dt,0);
      rs = {};
      for (cat in ccnts) {
        if (cat === '__default') {
          p = ip.defaultPrototype;
        } else {
          var p = ip[cat];
          if (!p) {
            p = ip.defaultPrototype;
          }
        }
        n = ccnts[cat];
        if (n===1) {
          instances= [p.instantiate()];
        } else {
          instances= p.instantiate(n);
        }
        rs[cat] = instances;
        instances.forEach(function (i) {i.__mark = 1;});//;i.__category = cat;});
      }
    } else {
      sz = dt.__size();
      irs = ip.instantiate(sz);
      rs = (sz === 1)?[irs]:irs;
      rs.forEach(function (i) {i.__mark = 1});
    }
    pj.tlog('finish instance supply'); 
     return rs;
  }

/*
 *  This is for building the mark set for new data, or after restoring from an external file.
 *  It grabs the mark from modifications if available, and otherwise uses the instance supply. 
 */

 pj.Spread.generateMark = function (instanceSupply,element,n,byCategory) {
  
    var dst = this.marks;
    var modifications = this.modifications;
    var categories = this.categories;
    var useArray = 0;
    if (typeof n === 'number') {
      useArray = 1;
      var nm = 'm'+n;
      if (modifications[nm]) {
        dst.push('__modified');
        return;
      }
    } else {
      if (modifications[n]){
        dst[n] = '__modified';
        return;
      }
    }
    if (byCategory) {
      var dcat =  element.category;
      var cat = (dcat===undefined)?'__default':dcat;
      this.categories.push(cat);
      var insts = instanceSupply[cat];
    } else {
      insts = instanceSupply;   
    }
      if (!insts) {
        debugger;
      }
    var rs = insts.pop();
    if (useArray) {
      dst.push(rs);
    } else {
      dst.set(n,rs);
    }
    if (typeof rs === 'object') rs.show();//ie not '__modified'
    return rs; 
  }
  /*
   * This syncs the set of marks to the data.  If there are already marks in the set, 
   * it reuses them, and builds new ones as required. For now,  if the data is categorized
   * sync always starts from scratch
  
   * a reset is needed if the set of categories has changed
   */
  /*
   * Checks that the categories of marks and data line up, and that each is of the same length
   */
  
 pj.Spread.inSync = function () {
    var data = this.data;
    var elements = data.elements?data.elements:data;
    var isArray =  pj.Array.isPrototypeOf(elements);
    var ln = this.numElements;
    if (ln !== elements.__size()) {
      return 0;
    }
    if (!data.categories  && isArray) {
      return 1;
    }
    var categories = this.categories;
    if (isArray) {
      for (var i=0;i<ln;i++) {
        if (categories[i]  !== elements[i].category) {
          return 0;
        }
      }
      return 1;
    } else {
      pj.forEachTreeProperty(this,function (mark,nm) {
        var el = elements[nm];
        if (!el) return 0;
        if (categories) {
          if (!Object.isProtototypeOf(this.categorizedPrototypes[categories[nm]],mark)) {
            return 0;
          }
        }
      });
      return 1;
    }
   }
  
 pj.Spread.sync = function () {
    var data = this.data;
    var p,shps,sln,dt,dln,i,isup;
    if (!data) return this;//not ready
    var elements = data.elements?data.elements:data;
    var isArray = pj.Array.isPrototypeOf(elements);
    if (this.inSync()) {
      if (this.__get('marks')) {
        return this;
      } else {
        this.set('marks',mkTheMarks(isArray));
      }
    } else {
      this.reset();
    }
    var categories = data.categories;
    if (categories) {
      p = this.categorizedPrototypes;
      if (!p) {
        this.fixupCategories(data.categories);
        p = this.categorizedPrototypes;
      }
    } else {
      p = this.masterPrototype; 
    }
    var shps = this.__get('marks');
    if (!shps) {
      shps = this.set('marks',mkTheMarks(isArray));
    }
  
    pj.declareComputed(shps);
    var eln = elements.__size();
    // set data for existing marks
    var byCategory = !!categories;
    p = byCategory?this.categorizedPrototypes:this.masterPrototype;
    // make new marks
    isup = buildInstanceSupply(this,p,elements,byCategory);
    if (isArray) {
      for (var i=0;i<eln;i++) {
        this.generateMark(isup,elements[i],i,byCategory);
      }
    } else {
      var thisHere = this;
      pj.forEachTreeProperty(elements,function (element,nm) {
        thisHere.generateMark(isup,elements[nm],nm,byCategory);
      },1);
    }
    this.numElements = eln;
    return this;
  }
  
  
  /*
   * a spread may have a 'binder' function, which given a mark, its datum, index, and the lenght of the series
   *  adjusts the mark as appropriate. Binders are optional.
   */
  
 pj.Spread.bind = function () {
    if (!this.binder) return;
    var d = this.data;
    var els = d.elements?d.elements:d;
    var isArray = pj.Array.isPrototypeOf(els);
    if (isArray) {
      var ln = els.length;
      var i,mark;
      for (i=0;i<ln;i++) {
        mark = this.selectMark(i); 
        this.binder(mark,els[i],i,ln);
      }
    } else {
      var thisHere = this;
      pj.forEachTreeProperty(els,function (el,nm) {
        mark = thisHere.selectMark(nm);
        thisHere.binder(mark,el,nm);
      });
    }
  }
  
 pj.Spread.update = function () { 
    pj.tlog('updating marks');
    if (this.data) {
      this.sync(); 
      this.bind();
    }
    pj.tlog('done updating marks');
  }
  
  // a reset is needed when the shape of data changes in length, or in assignment of categories
  pj.Spread.reset = function () {
    var shps = this.__get('marks');
    if (shps) {
      shps.remove();
      this.categories.length = 0;
    }
    
    if (this.modifications){
      this.modifications.remove();
    }
    this.initialize();
  }

  /*
   * if cns is a function, it is assumed to take a datum as input and produce the value; ow it is treated as a prototype
   * A MarkSet mignt be unary (with just one prototype), or multiPrototype, with a prototype per category.
   */

 pj.Spread.mk = function (mp) { // multiPrototype is the default
    var rs = Object.create(pj.Spread);
    rs.initialize();
    //rs.multiPrototype = 1;
    pj.setIfExternal(rs,'masterPrototype',mp);
    return rs;
  }
  
pj.Spread.forEachMark = function (fn) {
  var ln = this.marks.length;
  var i;
  for (i=0;i<ln;i++) {
    fn(this.selectMark(i),i);
  }
}

 pj.Spread.setFromData = function (p,fn) {
    this.forEachMark(function (m) {
      var d = m.data;
      var v = fn(d,i);
      m.set(p,v);
    });
  }
 
  
  pj.nodeMethod('__spreadAncestor',function () {
    if (pj.Spread.isPrototypeOf(this)) {
      return this;
    }
    var pr = this.__parent;
    if (pr) {
      return pr.__spreadAncestor();
    }
  });
  
  
 pj.Spread.show = function () {
    this.mapOverShapes(function (s) {
      s.show();
    });
    return this;
  }
  
  
  pj.Spread.colorOfCategory = function (category) {
      var rs;
      var protoForCategory = this.categorizedPrototypes[category];
      if (protoForCategory.getColor) {
        rs = protoForCategory.getColor();
      } else {
        rs = protoForCategory.fill;
      }
      return rs;
  }
  
  pj.Spread.setColorOfCategory = function (category,color) {
      var protoForCategory = this.categorizedPrototypes[category];
      if (protoForCategory.setColor) {
        protoForCategory.setColor(color);
      } else {
        protoForCategory.fill = color;
      }
  }
  
 
/*
  // a common operation
 pj.Spread.setColors = function (cls) {
    pj.twoArraysForEach(this.marks,cls,function (s,c) {
      var sc = s.setColor;
      if (sc) {
        s.setColor(c);
      }
    });
  }
  
 pj.Spread.setColor = function (cl) {
    this.marks.forEach(function (s) {
      var sc = s.setColor;
      if (sc) {
        s.setColor(cl);
      }
    });
  }
      
  pj.Spread.setNthColor = function (n,cl) {
    var s = this.selectMark(n);//this.marks[n];
    var sc = s.setColor;
    if (sc) {
      s.setColor(cl);
    }
  }
  */
var mkTheMarks = function (arrayData) {
  var rs;
  if (arrayData) {
    rs = pj.Array.mk();
  } else {
    rs = groupConstructor();
  }
  pj.declareComputed(rs);
  return rs;
}
 
 pj.Spread.initialize = function (arrayData) {
 /* debugger;
  if (arrayData) {
    this.set('marks',pj.Array.mk());
  } else {
    this.set('marks'
  }*/
  this.set('categories',pj.Array.mk());
  this.set('modifications',groupConstructor());
  //pj.declareComputed(this.marks);
  this.modifications.__unselectable = true;
 }
  // move mark number n to the modified node from the array.  
  
  pj.Spread.assertModified = function (mark) {
    var md = this.modifications;
    var nm;
    if (mark.__parent === md) {
      return; // already modified 
    }
    var n = parseInt(mark.__name); 
    nm = 'm'+n;
    debugger;
    mark.__reparent(md,nm);
//    mark.remove(); 
//    md.set(nm,mark);
    this.marks[n] = '__modified';
    this.draw();
  }

var modificationName = function (n) {
  return (typeof n === 'number')?'m'+n:n;
}

// mark might be in __modified 
pj.Spread.selectMark = function (n) {
  var rs = this.marks[n];
  return (rs === '__modified')?this.modifications[modificationName(n)]:rs;
}

}

//end extract

})(prototypeJungle);
