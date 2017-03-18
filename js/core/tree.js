// tree operations


pj.__builtIn = 1;


// constructors for nodes 

pj.Object.mk = function (src) {
  var rs = Object.create(pj.Object);
  if (src) {
    pj.extend(rs,src);
  }
  return rs;
}

pj.Array.mk = function (array) {
  var rs = Object.create(pj.Array);
  var child,ln,i;
  if (array==undefined) return rs;
  ln = array.length;
  for (i=0;i<ln;i++) {
    child = array[i];
    if (child && (typeof(child) === 'object')){
      child.__parent = rs;
      child.__name = ''+i;
    }
    rs.push(child);
  }
  return rs;
}


//  make the same method fn work for Objects, Arrays
pj.nodeMethod = function (name,func) {
  pj.Array[name] = pj.Object[name] = func;
}

// only strings that pass this test may  be used as names of nodes
// numbers can be used as labels
pj.checkName = function (string) {
  //if (typeof string === 'number') {
  //  return true;
 // }
  if ((string === undefined) || (!string.match)) { 
    pj.error('Bad argument');
  }
  if (string==='') return false;
  if (string==='$') return true;
  return !!string.match(/^(?:|_|[a-z]|[A-Z])(?:\w|-)*$/)
}


/* A path is a sequence of names indicating a traversal down a tree. It may be
 * represented as a '/' separated string, or as an array.
 * When string path starts with '/' (or an array with  empty string as 0th element)
 * this means start at pj, regardless of origin (ie the path is absolute rather than relative).
 */

pj.checkPath = function (string,allowFinalSlash) {
  var strSplit = string.split('/');
  var ln = strSplit.length;
  var  i = 0;
  if (ln===0) return false;
  if (allowFinalSlash && (strSplit[ln-1] === '')) {
    ln = ln - 1;
  }
  for (;i<ln;i++) {
    var pathElement = strSplit[i];
    if (((i>0) || (pathElement !== '')) // '' is allowed as the first  element here, corresponding to a path starting with '/'
      &&  !pj.checkName(pathElement)) {
      return false;
    }
  }
  return true;
}


pj.evalPath = function (origin,ipth) {
  var ln,pth,current,startIdx,idx,prop;
  if (!ipth) return origin; // it is convenient to allow this option
  if (typeof ipth === 'string') {
    pth = ipth.split('/');
  } else {
    pth = ipth;
  }
  ln = pth.length;
  if (ln===0) return origin;
  if (pth[0]==='') {
    current = pj;
    startIdx = 1;
  } else {
    current = origin;
    startIdx = 0;
  }
  for (idx=startIdx;idx<ln;idx++) {
    var prop = pth[idx];
    if (current && (typeof(current) === 'object')) {
      current = current[prop];
    } else {
      return undefined;
    }
  }
  return current;
}

/*
 * Return the path from root, or if root is undefined the path up to where parent is undefined. In the special case where
 * root === pj, the path begins with '' (so that its string form will start with '/')
 */

pj.pathOf = function (node,root) {
  var rs = [];
  var current = node;
  var name;
  while (true) {
    if (current === undefined) {
      return root?undefined:rs;
    }
    if (current=== root)  {
      if (root === pj) {
        rs.unshift('');
      }
      return rs;
    }
    name = pj.getval(current,'__name');
    // if we have reached an unnamed node, it should not have a parent either
    if (name!==undefined) {
      rs.unshift(name);
    }
    current = pj.getval(current,'__parent');
  }
  return undefined;
}

pj.stringPathOf = function (node,root) {
  var path = pj.pathOf(node,root);
  return path!==undefined?path.join('/'):undefined;
}



pj.nodeMethod('__pathOf',function (root) {return pj.pathOf(this,root);});


pj.isObject = function (o) {
  return o && (typeof(o) === 'object');
}


pj.isAtomic = function (x) {
  return !pj.isObject(x);
}
  

pj.isNode = function (x) { 
  return pj.Object.isPrototypeOf(x) || pj.Array.isPrototypeOf(x);
}


// creates Objects if missing so that path pth descending from this exists

pj.createPath = function (node,path) {
  var current = node;
  var child,next;
  path.forEach(function (prop) {
    // ignore '' ; this means that createPath can be used on pj
    if (prop === '') return;
    if (!pj.checkName(prop)){
      pj.error('Ill-formed __name "'+prop+'". Names may contain only letters, numerals, and underbars, and may not start with a numeral');
    }
    if (!current.__get) {
      pj.error('Unexpected');
    }
    child = current.__get(prop);
    
    if (child === undefined) {
      next = pj.Object.mk();
      current.set(prop,next);
      current = next;
    } else {
      if (!pj.isNode(child)) pj.error('Conflict in createPath ',path.join('/'));
      current = child;
    }
  });
  return current;
}
  

// gets own properties only
pj.getval = function (node,prop) {
  if (!node) {
    pj.error('null v');
  }
  if (node.hasOwnProperty(prop)) {
    return node[prop];
  }
}


var separateFromParent = function (node) {
  var parent = pj.getval(node,'__parent');
  if (parent) {
    var name = node.__name;
    if (Array.isArray(parent)) {
      parent[name] = undefined;
    } else {
      delete parent[name];
    }
  }
}

// assumes node[__name] is  child, or will be child. checks child's suitability 
var adopt = function (node,name,child) {
  if (pj.isNode(child)) {
    separateFromParent(child);
    child.__name = name;
    child.__parent = node;
  } else if (child && (typeof(child)==='object')) {
    pj.error('Only Nodes and atomic __values can be set as __children in <Node>.set("'+name+'",<val>)');
  } 
}

pj.preSetChildHooks = [];
pj.setChildHooks = [];

/* A property k of a node is watched if the field annotation "Watched" is set for that property. 
 * For watched fields, a change event is emitted of the form {id:change node:node property:__name}
 */

var setChild = function (node,name,child) {
  pj.preSetChildHooks.forEach(function (fn) {fn(node,name);});
  adopt(node,name,child);
  node[name] = child;
  pj.setChildHooks.forEach(function (fn) {
    fn(node,name,child);
  });
  var watched = node.__Watched;
  if (watched && watched[name]) {
  //if (node.__watched && node['__'+name+'_watched']) {
    var event = pj.Event.mk('change',node);
    event.property=name;
    event.emit();
  }
}
/*
 * Fields (aka properties) can be annotated. More description needed here.
 */

pj.Object.__getOwnFieldAnnotation = function (annotationName,prop) {
  var annotations = this.__get(annotationName);
  if (annotations === undefined) {
    return undefined;
  }
  return annotations[prop];
}



pj.Object.__getFieldAnnotation = function (annotationName,prop) {
  var cp = this;
  while (true) {
    if (cp === pj.Object) return undefined;
    var rs = cp.__getOwnFieldAnnotation(annotationName,prop);
    if (rs !== undefined) {
      return rs;
    }
    cp = Object.getPrototypeOf(cp);
  }
}
  

pj.Object.__setFieldAnnotation = function (annotationName,prop,v) {
  var annotations = this.__get(annotationName);
  if (annotations === undefined) {
    annotations = this.set(annotationName,pj.Object.mk());
  }
  if (Array.isArray(prop)) {
    var thisHere = this; 
    prop.forEach(function (ik) {
      annotations[ik] = v;
    });
  } else {
    annotations[prop] = v;
    return v;
  }
}
 
pj.defineFieldAnnotation = function (functionName) {
  var annotationName = '__'+functionName;
  pj.Object['__getOwn'+functionName] = function (k) {
    return this.__getOwnFieldAnnotation(annotationName,k);
  };
  pj.Object['__get'+functionName] = function (k) {
    return this.__getFieldAnnotation(annotationName,k);
  };
  pj.Object['__set'+functionName] = function (k,v) {
    return this.__setFieldAnnotation(annotationName,k,v);
  };
  pj.Array['__get'+functionName] = function (k){}
}
  
pj.defineFieldAnnotation('Watched');

pj.watch = function (node,prop) {
  node.__setWatched(prop,1);
}

/* set has several variants:
 *
 * x.set(name,v)  where name is a simple name (no /'s). This causes v to be the new child of x if v is a node, other wise just does x[name] = v
 *
 * x.set(path,v) where path looks like a/b/../name. This creates the path a/b/... if needed and sets the child name to v. Whatever part of the path
 * is already there is left alone.
 *
 * x.set(source)  extends x by source, in the sense of jQuery.extend in deep mode
 */

 
// returns val
pj.Object.set = function (key,val) {
  var idx,path,name,parent;
  if (arguments.length === 1) {
    pj.extend(this,key);
    return this;
  }
  if (typeof(key)==='string') {
    idx = key.indexOf('/');
  } else { 
    idx = -1;
  }
  if (idx >= 0) {
    path = key.split('/');
    name = path.pop();
    parent = pj.createPath(this,path);
  } else {
    parent = this;
    name = key;
  }
  if (!pj.checkName(name)){
    pj.error('Ill-formed name "'+name+'". Names may contain only letters, numerals, and underbars, and may not start with a numeral');
  }
  setChild(parent,name,val);
  return val;
}


pj.Array.set = function (key,val) {
  setChild(this,key,val);
  return val;
}

// adopts val below this if it is not already in a tree,ow just refers
pj.setIfExternal = function (parent,name,val) { 
  var tp = typeof val;
  if ((tp === 'object') && val && val.__get('__parent')) {
    parent[name] = val;
  } else {
    parent.set(name,val);
  }
  return val;
}

pj.setIfMissing = function (parent,prop,factory) {
  var rs = parent[prop];
  if (!rs) {
    rs = factory();
    parent.set(prop,rs);
  }
  return rs;
}

// this is similar to jquery.extend in deep mode: it merges source into dest. Note that it does not include properties from the prototypes.
pj.extend = function (dest,source) {
  var existingVal,newVal;
  if (!source) return dest;
  for (var prop in source) {
    if (source.hasOwnProperty(prop)) {
      newVal = pj.lift(source[prop]);
      if (newVal === undefined) continue;
       existingVal = dest[prop];
      // merge if existingVal is a Object; replace otherwise
      if (existingVal && pj.Object.isPrototypeOf(existingVal) && pj.Object.isPrototypeOf(newVal)) {
        pj.Object.extend(existingVal,newVal);
      }
      dest.set(prop,newVal);
    }
  }
  return dest;
}


pj.arrayToObject = function (aarray) {
  var rs = {};
  aarray.forEach(function (prop) {rs[prop] = 1;});
  return rs;
}


// transfer properties from source. If props is missing, extend dest by source
pj.setProperties = function (dest,source,props,dontLift,fromOwn) {
  if (!source) return;
  if (!dest) {
    pj.error('Bad arguments')
  }
  // include the case !hasSet so this will work for an ordinary object
  var hasSet = dest.set; 
  if (props) {
    props.forEach(function (prop) {
        var sourceVal = fromOwn?pj.getval(source,prop):source[prop];
        if (sourceVal !== undefined) {
          if (hasSet && !dontLift) {
            dest.set(prop,pj.lift(sourceVal));
          } else {
            dest[prop] = sourceVal;
          }
        }
    });
  } else {
    pj.extend(dest,source);
  }
  return dest;
}

pj.setPropertiesFromOwn = function (dest,source,props,dontLift) {
  return pj.setProperties(dest,source,props,dontLift,1);
}

// only for atomic values
pj.getProperties = function getProperties(source,props) {
  var rs = pj.Object.mk();
  props.forEach(function (prop) {
    var sourceVal = source[prop];
    var type = typeof sourceVal;
    if ((sourceVal === null) || ((type !== 'undefined') && (type !== 'object'))) {
      rs[prop] = sourceVal;
    }
  });
  return rs;
}

// Some Array methods



pj.Array.toArray = function () {
  var rs = [];
  this.forEach(function (e) {rs.push(e);});
  return rs;
}
var arrayPush = Array.prototype.push;
pj.pushHooks = [];

pj.Array.push = function (element) {
  var ln = this.length,
    thisHere = this;
  if (pj.isNode(element)) {
    if (element.__parent) { 
      element.__name = ln;
      element.__parent = this;
    }
  } else if (element && (typeof element==='object')) {
    pj.error('Attempt to push non-node object onto an Array');
  }
  arrayPush.call(this,element);
  pj.pushHooks.forEach(function (fn) {fn(thisHere,element);});
  return ln;
}


var arrayUnshift = Array.prototype.unshift;
pj.Array.unshift = function (element) {
  var ln = this.length;
  if (pj.isNode(element)) {
    separateFromParent(element);
    element.__name = ln;
    element.__parent = this;
  } else if (element && (typeof element==='object')) {
    pj.error('Attempt to shift non-node object onto an Array');
  }
  arrayUnshift.call(this,element);
  return ln;
}



/* utilities for constructing Nodes from ordinary objects and arrays
 * recurses down to objects that are already nodes
 * o is an array or an object
 */

var toNode1 = function (parent,name,o) {
  var tp = typeof o;
  var  rs;
  if ((o === null) || (tp != 'object')) {
    parent[name] =  o;
    return;
  }
  if (pj.isNode(o)) {
    rs = o;
  } else {
    if (Array.isArray(o)) {
      rs = pj.toArray(o,null);
    } else {
      var rs = pj.toObject(o,null);
    }
    
  }
  rs.__parent = parent;
  rs.__name = name;
  parent[name] = rs;
}

// transfer the contents of ordinary object o into idst (or make a new destination if idst is undefined)
pj.toObject= function (o,idest) {
  var dest,oVal;
  if (pj.Object.isPrototypeOf(o)) return o; // already a Object
  if (idest) {
    dest = idest;
  } else {
    dest = pj.Object.mk();
  }
  for (var prop in o) {
    if (o.hasOwnProperty(prop)) {
      oVal = o[prop];
      toNode1(dest,prop,oVal); 
    }
  }
  return dest;
}

pj.toArray = function (array,idest) {
  if (idest) {
    var dest = idest;
  } else {
    dest = pj.Array.mk();
  }
  array.forEach(function (element) {   
    dest.push(pj.toNode(element));
  });
  return dest;
}

pj.toNode = function (o) {
  if (pj.isNode(o)) {
    // idempotent
    return o;
  }
  if (Array.isArray(o)) {
    return pj.toArray(o);
  } else if (o && (typeof o === 'object')) {
    return pj.toObject(o);
  } else {
    return o;
  }
}

pj.lift = pj.toNode;




// Some utilities for iterating functions over trees.

// internal __properties are excluded from the iterators and recursors 

pj.internalProps = {'__parent':1,'__protoChild':1,'__value__':1,'__hitColor':1,'__chain':1,'__copy':1,__name:1,widgetDiv:1,
  __protoLine:1,__inCopyTree:1,__headOfChain:1,__element:1,__domAttributes:1};
pj.internal = function (__name) {
   return pj.internalProps[__name];
}


// a proper element of the tree: an own property with the right parent link. If includeLeaves, then atomic own properties are included too

pj.treeProperty = function (node,prop,includeLeaves,knownOwn) {
  var child;
  if ((!knownOwn && !node.hasOwnProperty(prop)) ||  pj.internal(prop)) return false;
  child = node[prop];
  if (pj.isNode(child)) {
    return child.__parent === node;
  } else {
    return includeLeaves?(typeof child !== 'object'):false;
  }
}


pj.treeProperties = function (node,includeLeaves) {
  var rs = [];
  var child,names,ln,i;
  if (pj.Array.isPrototypeOf(node)) {
    ln = node.length;
    for (i = 0;i < ln;i++) {
      child = node[i];
      if (includeLeaves) {
        rs.push(i);
      } else if (pj.isNode(child) && (child.__parent === node)) {
        rs.push(i);
      }
    }
    return rs;
  }
  names = Object.getOwnPropertyNames(node),
  names.forEach(function (name) {
    if (pj.treeProperty(node,name,includeLeaves,true)) rs.push(name);
  });
  return rs;
}
  
// apply fn(node[prop],prop,node) to each non-internal own property p. 
pj.mapOwnProperties = function (node,fn) {
  var ownprops = Object.getOwnPropertyNames(node);
  ownprops.forEach(function (prop) {
     if (!pj.internal(prop))  { 
      fn(node[prop],prop,node);
    }
  });
  return node;
}

pj.ownProperties = function (node) {
  var rs = [];
  pj.mapOwnPropeties(function (child,prop) {
    rs.push(prop);
  });
  return rs; 
}

// apply fn(node[p],p,node) to each treeProperty p  of node. Used extensively for applying functions through a tree
pj.forEachTreeProperty = function (node,fn,includeLeaves) {
  var perChild = function (value,prop) {
     if (pj.treeProperty(node,prop,includeLeaves,true))  { //true: already known to be an owned property
       fn(node[prop],prop,node);
    }
  }
  //var perArrayChild = function (value,prop) {
  //   if (pj.treeProperty(node,prop,includeLeaves,true))  { //true: already known to be an owned property
 //      fn(value,prop,node);
 //   }
 // }
  if (pj.Array.isPrototypeOf(node)) {
    node.forEach(perChild);
  } else {
    var ownprops = Object.getOwnPropertyNames(node);
    ownprops.forEach(perChild.bind(undefined,undefined));
  }
  return this;
}

pj.forEachDescendant = function (node,fn) {
  fn(node);
  pj.forEachTreeProperty(node,function (child) {
    pj.forEachDescendant(child,fn);
  })
}




pj.everyTreeProperty = function (node,fn,includeLeaves) { 
  var ownprops = Object.getOwnPropertyNames(node);
  return ownprops.every(function (prop) {
     if (pj.treeProperty(node,prop,includeLeaves,true))  { //true: already known to be an owned property
       return fn(node[prop],prop,node);
    } else {
      return 1;
    }
  });
}


pj.someTreeProperty = function (node,fn,includeLeaves) { 
  var ownprops = Object.getOwnPropertyNames(node);
  return ownprops.some(function (prop) {
     if (pj.treeProperty(node,prop,includeLeaves,true))  { //true: already known to be an owned property
       return fn(node[prop],prop,node);
    } else {
      return false;
    }
  });
}

 // if node itself has gthe propety, return true
pj.ancestorHasOwnProperty  = function (node,p) {
  var cv = node;
  while (cv) {
    if (cv.__get(p)) return true;
    cv = cv.__get('__parent');
  }
  return false;
}

pj.Object.__inCore = function () {
  return pj.ancestorHasOwnProperty(this,'__builtIn');
}

/* used eg for iterating through styles.
 * apply fn(node[p],p,node) to each atomic property of node, including properties defined in prototypes, but excluding
 * those defined in core modules.
 * sofar has the properties where fn has been called so far (absent except in the recursive call)
 */

pj.mapNonCoreLeaves = function (node,fn,allowFunctions,isoFar) {
  var soFar = isoFar?isoFar:{};
  if (!node) {
    pj.error('Bad argument');
  }
  if (!node.__inCore || node.__inCore()) return;
  var op = Object.getOwnPropertyNames(node);
  op.forEach(function (prop) {
    var child,childType;
    if (soFar[prop]) return;
    if (!pj.treeProperty(node,prop,true,true)) return true;
    soFar[prop] = 1;
    child = node[prop];
    childType = typeof child;
    if (child && (childType === 'object' )||((childType==='function')&&!allowFunctions)) return;
    fn(child,prop,node);
  });
  var proto = Object.getPrototypeOf(node);
  if (proto) {
    pj.mapNonCoreLeaves(proto,fn,allowFunctions,soFar);
  }
}
//reverts the atomic properties except those given
pj.Object.__revertToPrototype = function (exceptTheseProperties) {
  var proto = Object.getPrototypeOf(this);
  var ownprops = Object.getOwnPropertyNames(this);
  var thisHere = this;
  ownprops.forEach(function (p) {
    if (!(exceptTheseProperties[p] || (proto[p] === undefined))) {
      var cv = thisHere[p];
      if (typeof cv !== 'object') {
        delete thisHere[p];
      }
    }
  });
  if (this.__get('main')) {
    this.main.__revertToPrototype(exceptTheseProperties);
  }
}


pj.deepApplyFun = function (node,fn) {
  fn(node);
  pj.forEachTreeProperty(node,function (c) {
    pj.deepApplyFun(c,fn);
  });
}
  


pj.deepDeleteProps = function (node,props) {
  pj.deepApplyFun(node,function (ch) {
    props.forEach(function (p) {
      delete ch[p];
    });
  });
}



pj.deepDeleteProp = function (inode,prop) {
  pj.deepApplyFun(inode,function (node) {
    delete node[prop]
  });
}

var findResult = [];
pj.findDescendant = function (node,fn) {
  var recurser = function (node) {
    if (fn(node)) {
      findResult[0] = node;
      throw findResult;
    } else {
      pj.forEachTreeProperty(node,function (child) {
        recurser(child);
      });
    }
  }
  try {
    recurser(node);
  } catch(e) {
    if (e === findResult) {
      return e[0];
    } else {
      throw el
    }
  }
}

pj.descendantWithProperty = function (node,prop) {
  return pj.findDescendant(node,function (x) {
    return x[prop] !== undefined;
  });
}

pj.findAncestor = function (node,fn,excludeArrays) {
  var excluded;
  if (node===undefined) return undefined;
  excluded = excludeArrays && pj.Array.isPrototypeOf(node);
  if ((!excluded) && fn(node)) return node;
  var parent = node.__get('__parent');
  return pj.findAncestor(parent,fn,excludeArrays);
}

pj.ancestorThatInheritsFrom = function (node,proto) {
  return pj.findAncestor(node,function (x) {
    return proto.isPrototypeOf(x)
  });
}

pj.ancestorWithProperty = function (node,prop) {
  return pj.findAncestor(node,function (x) {
      return x[prop] !== undefined;
  },1);
}


pj.ancestorWithPrototype = function (node,proto) {
  return pj.findAncestor(node,function (x) {
      return proto.isPrototypeOf(x);
  },1);
}

pj.ancestorWithMethod = function (node,prop) {
  return pj.findAncestor(node,function (x) {
    return typeof x[prop] === 'function';
  },1);
}


pj.ancestorWithName = function (node,name) {
  return pj.findAncestor(node,function (x) {
    return x.__name === name;
  });
}




pj.ancestorWithoutProperty = function (node,prop) {
  return pj.findAncestor(node,function (x) {
      return x[prop] === undefined;
  },1);
}

pj.removeHooks = [];

pj.nodeMethod('remove',function () {
  var thisHere = this;
  var parent = this.__parent;
  var __name = this.__name;
  pj.removeHooks.forEach(function (fn) {
      fn(thisHere);
  });
  // @todo if the parent is an Array, do somethind different
  delete parent[__name];
  return this;  
});


pj.reparentHooks = [];

pj.nodeMethod('__reparent',function (newParent,newName) {
  var thisHere = this;
  var parent = pj.getval(this,'__parent');
  var name = this.__name;
  pj.reparentHooks.forEach(function (fn) {
      fn(thisHere,newParent,newName);
  });
  adopt(newParent,newName,this);
  newParent[newName] = this;
  return this;  
});


pj.removeChildren =  function (node) {
  pj.forEachTreeProperty(node,function (child) {
    child.remove();
  });
  if (pj.Array.isPrototypeOf(node)) {
    node.length = 0;
  }
}




// check that a tree with correct parent pointers and names descends from this node. For debugging.
pj.nodeMethod('__checkTree',function () {
  var thisHere = this;
  pj.forEachTreeProperty(this,function (child,prop) {
    if ((child.__parent) !== thisHere) pj.error(thisHere,child,'bad parent');
    if ((child.__name) !== prop) pj.error(thisHere,child,'bad __name');
    v.__checkTree();
  });
});




// without inheritance from prototype;  x.__get(prop) will return a value only if prop is a direct property of this
pj.nodeMethod('__get',function (prop) { 
  if (this.hasOwnProperty(prop)) {
    return this[prop];
  }
  return undefined;
});

pj.nodeMethod('parent',function () {		
  return this.__get('__parent');		
});

pj.nodeMethod('__nthParent',function (n) {
  var cv = this;
  var i;
  for (i=0;i<n;i++) {
    cv = cv.__parent;
    if (!cv) return undefined;
  }
  return cv;
});

pj.Object.name = function () {		
  return this.__get('__name');		
}		


// in strict mode, the next 4 functions return undefined if c does not appear in s, ow the whole string
pj.afterChar = function (string,chr,strict) {
  var idx = string.indexOf(chr);
  if (idx < 0) return strict?undefined:string;
  return string.substr(idx+1);
}


pj.afterLastChar = function (string,chr,strict) {
  var idx = string.lastIndexOf(chr);
  if (idx < 0) return strict?undefined:string;
  return string.substr(idx+1);
}


pj.beforeLastChar = function (string,chr,strict) {
  var idx = string.lastIndexOf(chr);
  if (idx < 0) return strict?undefined:string;
  return string.substr(0,idx);
}


pj.beforeChar = function (string,chr,strict) {
  var idx = string.indexOf(chr);
  if (idx < 0) return strict?undefined:string;
  return string.substr(0,idx);
}

pj.pathExceptLast = function (string,chr) {
  return pj.beforeLastChar(string,chr?chr:'/');
}



pj.endsIn = function (string,p) {
  var ln = string.length;
  var  pln = p.length;
  var es;
  if (pln > ln) return false;
  es = string.substr(ln-pln);
  return es === p;
}

pj.beginsWith = function (string,p) {
  var ln = string.length;
  var pln = p.length;
  var es;
  if (pln > ln) return false;
  es = string.substr(0,pln);
  return es === p;
}

  
pj.stripInitialSlash = function (string) {
  if (string==='') return string;
  if (string[0]==='/') return string.substr(1);
  return string;
}


pj.addInitialSlash = function (string) {
  if (string==='') return string;
  if (string[0]==='/') return string;
  return '/'+string;
}

pj.pathLast = function (string) {
  return pj.afterLastChar(string,'/');
}

pj.pathReplaceLast = function (string,rep,sep) {
  var sp = sep?sep:'/';
  var idx = string.lastIndexOf(sp);
  var  dr = string.substring(0,idx+1);
  return dr + rep;
}
  
 
pj.setIfNumeric = function (node,prp,v) {
  var n = parseFloat(v);
  if (!isNaN(n)) {
    this[prp] = v;
  }
}

/* an atomic property which does not inherit currently, but could,
 * in that there is a property down the chain with the same typeof
 */

pj.inheritableAtomicProperty = function (node,prop) {
  var propVal;
  if (prop === 'backgroundColor') {
    return false;
  }
  if (!node.hasOwnProperty(prop)) return false;
  var proto = Object.getPrototypeOf(node);
  return (typeof node[prop] === typeof proto[prop]);
}
  
/* inheritors(root,proto,filter) computes all of the descendants of root
 * which inherit from proto (including proto itself) and for which the filter (if any) is true.
 */

 

pj.inheritors = function (proto,filter) {
  var rs = [];
  var root = proto.__root();
  var recurser = function (node,proto) {
    if ((proto === node) || proto.isPrototypeOf(node)) {
      if (filter) {
        if (filter(node)) rs.push(node);
      } else {
        rs.push(node);
      }
    }
    pj.forEachTreeProperty(node,function (child) {
      recurser(child,proto);
    });
  }
  recurser(root,proto);
  return rs;
}


pj.forInheritors = function (proto,fn,filter) {
  var root = proto.__root();
  var recurser = function (node,proto) {
    if ((proto === node) || proto.isPrototypeOf(node)) {
      if ((filter && filter(node)) || !filter) {
        fn(node)
      }
    }
    pj.forEachTreeProperty(node,function (child) {
      recurser(child,proto);
    });
  }
  recurser(root,proto);
}


pj.forSomeInheritors = function (proto,fn) { 
  var rs = 0;
  var root = proto.__root();
  var recurser = function (node,proto) {
    
    if ((proto === node) || proto.isPrototypeOf(node)) {
      if (fn(node)) {
        rs = 1;
      } else {
        pj.forEachTreeProperty(node,function (child) {
          recurser(child,proto);
        });
      }
    }
    return rs;
  }
  recurser(root,proto);
  return rs;
}
 

pj.nodeMethod('__root',function () {
  var pr  = this.__get('__parent');
  return pr?pr.__root():this;
});



// the first protopy in node's chain with property prop 
pj.prototypeWithProperty = function (node,prop) {
  if (node[prop] === undefined) {
    return undefined;
  }
  var rs = node;
  while (true) {
    if (rs.__get(prop)) {
      return rs;
    }
    rs = Object.getPrototypeOf(rs);
    if (!rs) {
      return undefined;
    }
  }
}
  
  
  
  
// maps properties to sets (as Arrays) of  values.
pj.MultiMap = pj.Object.mk();

pj.MultiMap.mk = function () {
  return Object.create(pj.MultiMap);
}

pj.MultiMap.setValue = function(property,value) {
  var cv = this[property];
  if (!cv) {
    cv = pj.Array.mk();
    this.set(property,cv);
  }
  cv.push(value);
}

// array should contain strings or numbers
pj.removeDuplicates = function(array) {
  var rs;
  if (pj.Array.isPrototypeOf(array)) {
    rs = pj.Array.mk();
  } else {
    rs = [];
  }
  var d = {};
  array.forEach(function (v) {
    if (d[v] === undefined) {
      rs.push(v);
      d[v] = 1; 
    }
  });
  return rs;
}

pj.removeFromArray = function (array,value) {
  var index = array.indexOf(value);
  if (index > -1) {
    array.splice(index,1);
  }
  return array;
}

pj.addToArrayIfAbsent = function (array,value) {
  var index = array.indexOf(value);
  if (index == -1) {
    array.push(value);
  }
  return array;
}
  

/* a utility for autonaming. Given seed nm, this finds a __name that does not conflict
 * with children of avoid, and has the form nmN, N integer. nm is assumed not to already have an integer at the end
 * Special case. nm might be a number (as it will be when derived from the name of an array element). In this case, nm is replaced
 * by "N" and the usual procedure is followed
 */

 
 pj.autoname = function (avoid,inm) {
    var maxnum = -1;
    var anm;
    var nm = (typeof inm === 'number')?'N':inm;
    if (!avoid[nm]) {
      return nm;
    }
    var nmlength = nm.length;
    for (anm in avoid) {
      if (anm === nm) {
	    continue;
      }
      var idx = anm.indexOf(nm);
      if (idx === 0) {
	    var rst = anm.substr(nmlength);
	    if (!isNaN(rst)) {
	      var rint = parseInt(rst);
	      maxnum = Math.max(maxnum,parseInt(rst));
	    }
      }
    }
  var num = (maxnum === -1)?1:maxnum+1;
  return nm + num;
}

  
pj.fromSource = function (x,src) {
    if (x && (typeof(x)==='object')) {
      if ((x.__sourceUrl) && (x.__sourceUrl === src)) {
        return true;
      } else {
        var pr = Object.getPrototypeOf(x);
        return pj.fromSource(pr,src);
      } 
    } else {
      return false;
    }
  }

  
pj.nodeMethod("__inWs",function () {
  if (this === pj.root) return true;
  var pr = this.__get('__parent');
  if (!pr) return false;
  return pr.__inWs();
});

//last in the  work space which satisfies fn
pj.Object.__lastInWs = function (returnIndex,fn) {
  var current = this;
  var n = 0;
  var last = current;
  if (last.__inWs() && (!fn || fn(last))) {
    current = Object.getPrototypeOf(last);
    while (current.__inWs() && (!fn || fn(current))) {
      n++;
      last = current;
      current = Object.getPrototypeOf(last);
    }
    return returnIndex?n:last;
  }
  return returnIndex?-1:undefined;
}

pj.nodeMethod('__size',function () {
  var n=0;
  if (pj.Object.isPrototypeOf(this)) {
    pj.forEachTreeProperty(this,function () {
      n++;
    },1);
    return n;
  } else {
    return this.length;
  }
});



pj.Object.__namedType = function () { // shows up in the inspector
  this.__isType = 1;
  return this;
}

pj.countDescendants = function (node,fn) {
  var rs = 0;
  pj.forEachDescendant(node,function (d) {
    rs +=  fn?(fn(d)?1:0):1;
  });
  return rs;
}

// an object X s "pure" if its structure is a pure inheritance from its prototype; that is, if it has only 
// Objects as descendants, and if each of those descendants inherits from the prototype. Furthernore, the protoype should have
// no  non-null object descendant D that has no corresponding node in X. after X = Y.instantiate, X starts out pure

// In serialization, each top level pure object (object whose parent is not pure) is serialized as if it had the structure {__pure:1}. pjObject.__restorePures
// is run after serialization. 

pj.Object.__isPure = function () {
  var thisHere = this;
  var names = Object.getOwnPropertyNames(this);
  var proto = Object.getPrototypeOf(this);
  var i,child;

  var nn = names.length;
  for (i=0;i<nn;i++) {
    var name = names[i];
    child = this[name];
    if (!pj.Object.isPrototypeOf(x)) {
      return false;
    }
    childProto = Object.getPrototypeOf(child);
    protoChild = proto[name];
    if (childProto !== protoChild) {
      delete x.__pure;
      return false;
    }
    if (!child.__isPure()) {
      delete x.__pure;
      return false;
    }
  }
  // now make sure the prototype has no extra Object children
  names = Object.getOwnPropertyNames(proto);
  nn = names.length;
  for (i=0;i<nn;i++) {
    var name = names[i];
    child = proto[name];
    if (pj.Object.isPrototypeOf(child)) {
      if (!this[name]) {
        delete x.__pure;
        return false;
      }
    }
  }
  x.__pure = true;
  return true;
}

pj.numericalSuffix = function (string) {
  var i,c,ln;
  var n = Number(string);
  if (!isNaN(n)) {
    return n;
  }
  ln = string.length;
  for (i=ln-1;i>=0;i--) {
    c = string[i];
    if (isNaN(Number(c))) { //that is, if c is a digit
      return Number(string.substring(i+1));
    }
  }
  return Number(string);
}

// c = max after decimal place; @todo adjust for .0000 case
pj.nDigits = function (n,d) {
  var ns,dp,ln,bd,ad;
  if (typeof n !=="number") return n;
  var pow = Math.pow(10,d);
  var unit = 1/pow;
  var rounded = Math.round(n/unit)/pow;
  ns = String(rounded);
  dp = ns.indexOf(".");
  if (dp < 0) return ns;
  ln = ns.length;
  if ((ln - dp -1)<=d) return ns;
  bd = ns.substring(0,dp);
  ad = ns.substring(dp+1,dp+d+1)
  return bd + "." + ad;
}

pj.Array.__copy = function (copyElement) {
  var rs = pj.Array.mk();
  var ln = this.length;
  var i,ce;
  for (i=0;i<ln;i++) {
    ce = this[i];
    if (copyElement) {
      rs.push(copyElement(ce));
    } else {
      rs.push(ce);
    }
  }
  return rs;  
}