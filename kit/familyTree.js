core.require('/arrow/multiIn.js','/connector/line.js','/container/rectangle.js',function (multiInPP,linePP,personPP) {
  
let item = svg.Element.mk('<g/>');

item.partnerSeparation = 20;
item.siblingSeparation = 20;

item.familySep = 20;

item.descendantSeparation = 60;
item.numLevels = 2;
item.height = 140;
item.width = 200;
item.bracketWidth = 50;
item.textUp = 4;
item.textPad = 5;
item['font-size'] = 8;
item.editMode = true;
item.resizable = false;
item.isKit = true;
item.partnerCount = 0;

item.personWidth = function (person) {
  return person.dimension?person.dimension:person.width;
}


item.personHeight = function (person) {
  return person.dimension?person.dimension:person.height;
}

item.partnerSep = function () {
  let wd = this.personWidth(this.personP);
  return wd + this.partnerSeparation;
}


item.siblingSep = function () {
  let wd = this.personWidth(this.personP);
  return wd + this.siblingSeparation;
}


item.descendantSep = function () {
  let ht = this.personHeight(this.personP);
  return ht + this.descendantSeparation;
}



// knd = the kind of the initial child (L or R)
item.newFamily = function () {
  let rs = svg.Element.mk('<g/>');
  this.families.push(rs);

  rs.set('multi',this.multiInP.instantiate().show());
  rs.multi.vertical = true;  
 // let child = this.newNode();
  rs.set('children',core.ArrayNode.mk());
 // rs.children.plainPush(child);
  rs.set('position',Point.mk(0,0));
  return rs;
}

// max num partners = 4.Add child to 
item.addChild = function (person,ichild) {
  let node = person.nodeOf;
  let partners = node.partners;
  let families = node.families;
  let ln = partners.length;
  if (ln == 1) {
    editor.popInfo('Add a partner before adding a child');
    return;
  }
  let famIdx = 0;
  let multi;
  if (ln > 2) {  // add to family to the left of the person
    let pidx = partners.findIndex((x)=>(x===person));
    famIdx = Math.max(0,pidx-1);
  }
  let family = families[famIdx];
  if (family) {
    multi = family.multi;
    multi.ends.push(Point.mk(0,0)); // a new branch on the multi
    multi.update();
  } else {
    family = this.newFamily();
    families[famIdx] = family;
    family.parents = node;
    multi = family.multi;
  }
  let child,childNode;
  if (ichild) {
    child = ichild;
    childNode = ichild.nodeOf;
  } else {
    childNode = this.newNode();
    child = childNode.partners[0];
  }
  child.inFamily = family;
  if (!ichild) {
    child.text = 'c'+ (this.partnerCount++);
  }

   debugger;
  graph.connectMultiVertex(multi,family.children.length,child);
  family.children.plainPush(childNode);
  return childNode;
}
    
    
  
  
// a node might involve four people
// leftPartner leftSpouse rightSpouse rightPartner; heteronormative family: leftSpouse = wife, rightSpouse = husband

// a node is a principle [0], and set of partners, horizontally posisionted
// node first added is always the right spouse, if a family should develop
item.newNode  = function () {
  let nodes = this.nodes;
  let newNode = svg.Element.mk('<g/>');
  nodes.push(newNode);
  let person = this.personP.instantiate().show();
  person.nodeOf = newNode;
  let partners =  core.ArrayNode.mk();
  newNode.set('partners',partners);
  partners.push(person);
  newNode.set('families',core.ArrayNode.mk());

  newNode.set('lines',core.ArrayNode.mk());
  newNode.set('position',Point.mk(0,0));
  return newNode;
  // later add texts
};

item.nameCount = 0;
item.addPartner = function (node) {
  debugger;
  let line = this.lineP.instantiate().show();
  node.lines.push(line);
  node.families.push(null);
  let right =  this.personP.instantiate().show();
  right.text = 'p'+ (this.partnerCount++);
  right.nodeOf = node;
  let partners = node.partners;
  let ln = partners.length;
  if (ln === 1) {
    let handle = this.handleP.instantiate().show();
    node.set('handle',handle);
  }
  partners.push(right);
  right.update();
  let left  = partners[ln-1];
  graph.connectVertices(line,left,right);
  let family = node.inFamily;
  if (family) {
    let pr = family.parents;
    this.layoutTree(pr);
  } else {
    this.layoutTree(node);
  }
};

item.addParents = function (person) {
  if (person.inFamily) {
    editor.popInfo('This person already has parents');
    return;
  }
  let parentsNode = this.newNode();
  this.addPartner(parentsNode);
  let parents = parentsNode.partners;
  this.addChild(parents[0],person);
  let pos = person.getTranslation();
  let partnerSep = this.partnerSep();
  let descendantSep = this.descendantSep();
  parentsNode.position.copyto(pos.plus(Point.mk(0,-descendantSep)));
  parents[0].moveto(pos.plus(Point.mk(-0.5*partnerSep,-descendantSep)));
  parents[1].moveto(pos.plus(Point.mk(0.5*partnerSep,-descendantSep)));
  return parentsNode;
}
  
  
  
  
item.initialize = function () {
  this.set('nodes',core.ArrayNode.mk());
  this.set('families',core.ArrayNode.mk());
  this.multiInP = core.installPrototype('multiInP',multiInPP);
  this.multiInP.vertical = true;
  this.lineP = core.installPrototype('lineP',linePP);
  this.personP = core.installPrototype('personP',personPP);
  this.personP.width = 40;
  this.personP.height = 20;
  this.personP.textProperties['font-size'] = 8;
  this.handleP = core.installPrototype('handleP',personPP);
  this.handleP.width = 10;
  this.handleP.height = 5;
  this.handleP.isHandle = true;
  this.handleP.fill = "red";
  this.personP.draggableInKit = true;
  this.handleP.draggableInKit = true;
};

item.relLayoutFamily = function (family) {
  let children = family.children;
  let cx = 0;
  let siblingSep = this.siblingSep();
  let cwd;
  children.forEach( (child) => {
    this.relLayoutNode(child);
    let wd = child.width;
    child.relX = cx + 0.5*wd;
    cwd = cx + wd;
    cx = cx +  wd + siblingSep;
  });
  family.width = cwd;
}


item.absLayoutFamily = function (family,pos) {
  debugger;
  family.position.copyto(pos);
  let children = family.children;
  let wd = family.width;
  let mhwd = -0.5*wd;
  let descendantSep = this.descendantSep();
  children.forEach((child) => {
    let cpos = pos.plus(Point.mk(mhwd+child.relX,descendantSep));
    this.absLayoutNode(child,cpos);
  });
}

  
  

item.relLayoutNode = function(node) { // computes relative positions (in x) to left end
  let partners = node.partners;
  let families = node.families;
  let partnerSep = this.partnerSep();
  let cx = 0;
  let ln = partners.length;
  partners[0].relX = 0;
  let familyCount =  0;
  families.forEach( (family) => {
    if (family) {
      familyCount++;
    }
  });
    
  for (let i=1;i<ln;i++) {
    let partner = partners[i];
    let family = families[i-1];
    let famwd = 0;
    // todo put familes to right option
    if (family) {
      this.relLayoutFamily(family);
      famwd = family.width;
    }
    //let wd = ln>2?Math.max(famwd,partnerSep):partnerSep;
    
    let wd = familyCount>1?famwd+partnerSep:partnerSep;
    cx = cx + wd;
    partner.relX = cx;
  }
  node.width = cx;
}

item.absLayoutNode = function (node,pos) { // computes absolute positions given relative ones, and moves people
  debugger;
  node.position.copyto(pos)
  let partners = node.partners;
  let families = node.families;
  let handle = node.handle;
  let mhwd = -0.5*(node.width);
  let ln = partners.length;
  let lastPartner = partners[0];
  lastPartner.moveto(pos.plus(Point.mk(mhwd,0)));
  for (let i=1;i<ln;i++) {
    let partner = partners[i];
    partner.moveto(pos.plus(Point.mk(mhwd + partner.relX,0)));
    let family = families[i-1];
    if (family) {
      let fpos = pos.plus(Point.mk(mhwd + 0.5*(lastPartner.relX + partner.relX),0));
      this.absLayoutFamily(family,fpos);
    }
    lastPartner = partner;
  }
}


  

item.layoutTree = function(inode) {
  debugger;
  let node = inode?inode:this.root;
  let pos = node&&node.position?node.position:Point.mk(0,0);
  this.relLayoutNode(node,pos);
  this.absLayoutNode(node,pos);
  // two updates needed to get arms pointing right direction (to do with armDirections)
  graph.graphUpdate();
  graph.graphUpdate();
  ui.updateControlBoxes();
  this.layout();
  this.draw();
}

item.moveNode = function (node,pos) {
  let partners = node.partners;
  let cpos = node.position;
  let rpos = pos.difference(cpos);
  partners.forEach( (partner) => {
    let ppos = partner.getTranslation();
    partner.moveto(ppos.plus(rpos));
  });
  let families = node.families;
  families.forEach((family) => {
    if (family) {
      let fpos = family.position;
      this.moveFamily(family,fpos.plus(rpos));
    }
  });
  node.position.copyto(pos);
}


item.moveFamily = function (family,pos) {
  let children = family.children;
  let fpos = family.position;
  let rpos = pos.difference(fpos);
  children.forEach( (child) => {
    let cpos = child.position;
    this.moveNode(child,cpos.plus(rpos));
  });
}



item.midPoint = function (line) { // kind = L C R
  let e0 = line.end0;
  let e1 = line.end1;
  return e0.plus(e1).times(0.5);
};
 
item.positionMultis = function (node) {
  let partners = node.partners;
  let families = node.families;
  let lines = node.lines;
  let ln = partners.length;
  for (let i=1;i<ln;i++) {
    if (i === 1) {
      let handle = node.handle;
      let line = node.lines[0];
      let mp = this.midPoint(line);
      handle.moveto(mp);
    }
    let family = families[i-1];
    if (family) {
      let line = lines[i-1];
      let mp = this.midPoint(line);
      let multi = family.multi;
      multi.singleEnd.copyto(mp);
      multi.update();
      multi.draw();
    }
  }
}

 item.layout = function () {
  debugger;
  let nodes = this.nodes;
  nodes.forEach( (nd) => {
    this.positionMultis(nd);
  });
 } 
 
item.firstUpdate = true;

item.update = function () {
  debugger;
  if (this.firstUpdate) {
    this.root = this.newNode('R');
    this.addPartner(this.root);
    let p0 = this.root.partners[0];
    p0.text = 'parent';
    this.root.partners[1].text = 'parent';
   // let child =  this.addChild(p0);
   // child.partners[0].text = 'child'
    this.firstUpdate = false;
    this.layoutTree();
  }
  
  //let nodes = this.nodes();
  //nodes.forEach((node) =>
  this.layout();
}

item.startOfDrag = Point.mk(0,0);
item.nodePosAtStartDrag = Point.mk(0,0);


item.dragStart = function (x,pos) {
  //console.log('drag start',pos.x,pos.y);
  let localPos = this.toLocalCoords(pos,true);
  this.startOfDrag.copyto(localPos);
  if (x.isHandle) {
    let node = x.__parent
    this.nodePosAtStartDrag.copyto(node.position);
  }
}

item.dragStep = function (x,pos) {
  //console.log(pos.x,pos.y);
  let localPos = this.toLocalCoords(pos,true);

  if (Math.abs(localPos.y) > 0.1) {
    debugger;
  }
  let node = x.nodeOf;
  if (node) {
    x.moveto(localPos);
    this.positionMultis(node);
  } else if (x.isHandle)  {
    let opos = this.nodePosAtStartDrag;
    let rpos = localPos.difference(this.startOfDrag);
    node = x.__parent;
    x.moveto(localPos);
    this.moveNode(node, opos.plus(rpos));
    graph.graphUpdate();
    this.layout();
  }
}

item.addPartnerAction = function (person) {
  debugger;
  let node = person.nodeOf;
  this.addPartner(node,'L');
  ui.updateControlBoxes();
  this.layoutTree();
  
}


item.addChildAction = function (person) {
  debugger;
  this.addChild(person);
  this.layoutTree(person.nodeOf);
  dom.svgMain.fitContentsIfNeeded();

}

item.addParentsAction = function (person) {
  debugger;
  
  let parents = this.addParents(person);
  core.updateParts(parents);
   // two graph updates needed to get arms pointing right direction (to do with armDirections)
   this.layout();
  graph.graphUpdate();
  graph.graphUpdate();
  ui.updateControlBoxes();
  this.update();
  this.draw();
  dom.svgMain.fitContentsIfNeeded();

 // parents.draw();
}

item.layoutTreeAction = function (person) {
  this.layoutTree(person.nodeOf);
}

item.actions = function (node) {
  let rs = [];
  if (!node) return;
  if (node.role === 'vertex') {
     rs.push({title:'Select Kit Root',action:'selectTree'});
     rs.push({title:'Add Child',action:'addChildAction'});
     rs.push({title:'Add Partner',action:'addPartnerAction'});
     rs.push({title:'Add Parents',action:'addParentsAction'});
     rs.push({title:'Layout Family',action:'layoutTreeAction'});
              
  }
  return rs;
  if (node === this) {
    rs.push({title:'Reposition Tree',action:'layoutTree'});
  }
  return rs;
}


item.selectTree = function () {
  this.__select('svg');
}

return item;

});
     
