
(function (pj) {

  
// This is one of the code files assembled into pjcore.js. //start extract and //end extract indicate the part used in the assembly

//start extract

// <Section> Externalize ==========================



/* a node is a protoChild if its parent has a prototype, and it has the correspondingly named child of the parent as prototype
 *
 * 
 * Any top level externalizable item may have a __requires field.  each component has an id  and url
 * if the url has the form '/...' this means that it is relative to it's own repo, whose url is held in __repo
 * In internalization, pj.itemsLoaded holds the items loaded so far by url. Every loaded item has  __sourceRepo and __sourcePath
 * fields, describing where it was loaded from.
 * In the externalized object, references to external objects have the form repo|path where repo = "." means from
 * the objects own repo. References may also take the forms
 * /<internalpath> such as /pj/Object or /svg/g.  ./path is used for references
 * within the object being externalized.
 */ 

// this is the repo for the current externalization. Needed to interpret components (but not needed if no components)
var xrepo; 


pj.Object.__isProtoChild = function () {
  var proto = Object.getPrototypeOf(this);
  var  protoParent;
  if (!proto) return false;
  var parent = this.__get('__parent');
  if (!parent) return false;
  protoParent = Object.getPrototypeOf(parent);
  if (!pj.Object.isPrototypeOf(protoParent)) return false;
  return protoParent[this.__name] === proto;
}

  

Function.prototype.__isProtoChild = function () {return false;}

// rti is the root of the externalization, or null, if this is the root
var exRecursionExclude = {__prototype:1,__name:1,__typePrototype:1,_parent:1,widgetDiv:1,__requires:1} //@todo rename widgetDiv
  
// the object currently being externalized
var currentX ;



var dependencies;

var externalizedAncestor = function (x,root) {
  if ((x === root) ||pj.getval(x,'__sourceRepo')||pj.getval(x,'__builtIn')) {
    if (pj.getval(x,'__sourceRepo')) dependencies.push(x);
    return x;
  } else {
    var parent = pj.getval(x,'__parent');
    if (parent) {
      return externalizedAncestor(parent,root);
    } else {
      return undefined;
    }
    
  }
}

/*
var findComponent = function (x,root) {
  var requires = root.__requires;
  var rs;
  if (!requires) return undefined;
  rs = undefined;
  requires.some(function (require) {
    var repo = require.repo;
    if (require.repo === '.') {// relative to current rep
      repo = xrepo;
    }
    if ((x.__sourceRepo === repo) && (x.__sourcePath === require.path)) {
      rs = require.id;
      return true;
    }
  });
  return rs;
}
*/

var genExtRef = function (x) {
  var repo = x.__sourceRepo;
  var path = x.__sourcePath;
  if (repo === xrepo) { // relative to current repo
    repo = ".";
  }
  return "["+repo+"|"+path+"]";
}
  

pj.refCount = 0;

/* find the reference path for x.  This will be the path relative to its externalized ancestor, prepended by the path to that ancestor.
 * If this ancestor is repo, then just use '.' to denote it (relative path). 
 */

pj.refPath = function (x,repo,missingOk) {
  var extAncestor = externalizedAncestor(x,repo);
  var  builtIn,relative,componentPath,relPath,builtInPath;
  if (extAncestor === undefined) {
    debugger; 
    if (missingOk) {
      return undefined; 
    }
    pj.error('Cannot build reference');
  }
  builtIn = pj.getval(extAncestor,'__builtIn');
  relative = extAncestor === repo;
  if ( !(builtIn || relative)) {
    var componentPath = genExtRef(extAncestor); //findComponent(extAncestor,repo);
    if ( !componentPath) {
      throw(pj.Exception.mk('Not in a require',x));
    }
  }
  if (!x.__pathOf) {// @remove
    debugger;
  }
  var relPath = (x === extAncestor)?'':x.__pathOf(extAncestor).join('/');                                  
  if (builtIn) {
    if (extAncestor === pj) {
      return relPath;
    } else {
      builtInPath = extAncestor.__pathOf(pj);
      return builtInPath.join('/') + '/' + relPath;
    }
  }
  if (relative) {
    return './'+relPath;
  }
  return (relPath==='')?componentPath:componentPath+'/'+relPath;
}

   
pj.externalizeObject = function (node,rootin) {
  var rs = {};  
  if (rootin) {
    var root = rootin;
  } else {
    root = node;
  }
  //currentX = root;
  var protoChild = node.__isProtoChild();
  if (protoChild) { // in this case, when internalize, we can compute the value of __prototype from the parent and its prototype
    //rs.__protoChild = 1;
    rs.__prototype = "..pc";
  } else {
    var proto =  Object.getPrototypeOf(node);
    var protoReference = pj.refPath(proto,root);
        //pj.error('Cannot build reference');

    if (protoReference) {
      rs.__prototype = protoReference;
     
    }
  }
  //var thisHere = this;      
  pj.mapOwnProperties(node,function (child,prop) {
    var childReference,requireReps;
    if (!pj.treeProperty(node,prop,1)) { //1 means includeLeaves
      childReference = pj.refPath(child,root,1);//1 means tolerate missing 
      if (childReference) rs[prop] = {__reference:childReference};
      return; 
    }
    if (!exRecursionExclude[prop]) {
      if (pj.isNode(child)) {
        rs[prop] = pj.externalize(child,root);
      } else {
        if (typeof child === 'function') {
          rs[prop] = {'__function':child.toString()}
        } else {
          rs[prop] = child;
        }
      } 
    }
  });
  if (node === root) {
    debugger;
    var requires = node.__requires;  
    if (0) {  
      var requireReps = {};
      if (requires) {
        requires.forEach(function (c) {
          requireReps[c.id] = {repo:c.repo,path:c.path,isScript:c.isScript};
          
        });
      }
    } else {
      if (requires) {
        var requireReps = requires.map(function (c) {
          return {id:c.id,repo:c.repo,path:c.path,isScript:c.isScript};
        });
      } 
    }
    rs.__requires = requireReps;
  }
  return rs;
}

pj.propertiesOfArray = ["__setIndex","__head","__computed"];  

  // __properties of the Array are placed in the first element of the form {__props:1,,, At the moment, only __setIndex is involved.
pj.externalizeArray = function (node,rootin) {
  var setIndex,head,ln,i,element,rs,props;
  if (rootin) {
    var root = rootin;
  } else { 
    root = node;
  }
  pj.propertiesOfArray.forEach(function (prop) {
    var val = node[prop];
    if (val !== undefined) {
      if (!props) {
        props = {__props:1};
      }
      props[prop] = val;
    }
  });
  rs = props?[props]:[];
  /* 
  setIndex = node.__setIndex;
  head = node.__head;
  if ((setIndex !== undefined) || head) {
    props = {__props:1};
    rs = [props]; 
    if (setIndex) {
      props.__setIndex = setIndex;
    }
    if (head) {
      props.__head = head;
    }
  } else {
    rs = [];
  }*/
  var ln = node.length;
  for (i=0;i<ln;i++) {
    element = node[i];
    rs.push(pj.isNode(element)?pj.externalize(element,root):element);
  }
  return rs;
}

pj.externalize = function (node,root) {
  if (pj.Array.isPrototypeOf(node)) {
    return pj.externalizeArray(node,root);
  } else {
    return pj.externalizeObject(node,root);
  }
}

  
    
pj.beforeStringify = [];// a list of callbacks
pj.afterStringify = [];

var requireRepsFromDependencies = function (dependencies) {
  var rs = dependencies.map(function (dep) {
    return {repo:dep.__sourceRepo,path:dep.__sourcePath,isScript:1,newScheme:1};
  });
  console.log('requireRepsFromDeps',rs);
  return rs;
}
pj.stringify = function (node,repo) { 
  var x;
  dependencies = [];
  if (repo) {
    xrepo = repo;
  } else {
    xrepo = node.__sourceRepo;
  }
  pj.beforeStringify.forEach(function (fn) {fn(node);});
  x = pj.externalizeObject(node);
  console.log('dependencies',dependencies);
  //x.__requires = requireRepsFromDependencies(dependencies);
  pj.afterStringify.forEach(function (fn) {fn(node);});
  debugger;
  return JSON.stringify(x);
  //rs = 'prototypeJungle.assertItemLoaded('+jsonX+');\n';
  //return rs; 
}

//end extract
})(prototypeJungle);