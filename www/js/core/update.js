
(function (pj) {
  'use strict'

// This is one of the code files assembled into pjom.js. 'start extract' and 'end extract' indicate the part used in the assembly

//start extract

// <Section> update

/* When a Object has a method called update, the state of that node is maintained by application of that method
 * when there are changes. Some nodes within the tree might be generated by update, and in that case, the node is marked compted.
 * Independently, the atomic values of some properties might be set by update, and in that case, the property might me marked computed.
 * Typically, the latter marking is made on the prototype (eg, if width of a bar is computed, this fact is declared in the prototype of the bar)
 */


pj.declareComputed = function (node) {
  node.__computed = 1; 
  return node;
}

pj.defineFieldAnnotation("computed");  // defines __setComputed and __getComputed

pj.isComputed = function (node,k,id) {
  var d = id?id:0;
  if (d > 20) {
    debugger;
  }
  if (!node) return false;
  if (node.__computed) return true;
  if (k && node.__getcomputed(k)) {
    return true;
  }
  
  return pj.isComputed(node.__get('__parent'),undefined,d+1);
}


// overrides should  only  be specified in the top level call

pj.updateErrors = [];
pj.debugMode = 1; // no tries in debug mode, to ease catching of errors
pj.updateCount = 0;

/* add an override to the override tree in root, for node, with respect to the given root. If the override is already there, does nothing
 * but returns it.
 

pj.addOverride = function (root,node) {
  var path,overrides; 
  if (!node) {
    pj.error('Bad argument');
  }
  var overrides = root.__overrides;
  if (!overrides) {
    overrides = root.set('__overrides',pj.Object.mk());
  }
  var path = node.__pathOf(root);
  return pj.createPath(overrides,path);
}
*/
/* transfer the __values of the specified __properties to the override overrides; nothing is done if there is no corresponding prop in overrides
 * only atomic props will be transferred
 * root is the Object corresponding to the root node of overrides
 */
/*
pj.transferToOverride = function (root,node,prop) {
  var overrideNode = pj.addOverride(root,node),
   value = node.__get(prop);
  if (value && (typeof value === 'object')) {
    pj.error('Only atomic data can be transferred to overrides');
  }
  if (value===undefined) {
    return  0;
  }
  // preface numbers with __ so as to stay away from numerical properties of dictionaries
  var overrideProp = (typeof prop==='number')?'__'+prop:prop;
  overrideNode[prop] = value;
}

// stickySet means set and recall in the overrides  
pj.stickySet = function (root,node,prop,value) {
  node.set(prop,value);
  pj.transferToOverride(root,node,prop);
}



var updateParents = {};
var installOverridesTop; // the top level node upon which this method is called

pj.installOverrides = function (node,overrides,notTop) {
  var props = Object.getOwnPropertyNames(overrides);
  props.forEach(function (prop) {
    var value,newValue;
    if (pj.internal(prop)) {
      return;
    }
    value = overrides[prop];
    if (pj.isObject(value)) {
      newValue = node[prop];
      if (pj.isNode(newValue)) {
        pj.installOverrides(newValue,value,1);
      }
    } else {
      node[prop] = value;
      var ancestorWithUpdate = pj.ancestorWithMethod(node,'update');
      if (ancestorWithUpdate && (ancestorWithUpdate !== installOverridesTop)) {
        var path = pj.pathOf(ancestorWithUpdate,installOverridesTop).join('/');
        updateParents[prop] = 1;
      }
    }
  });
}
*/
pj.catchUpdateErrors = 0; 
pj.Object.outerUpdate = function () {
  if (this.update) {
    pj.updateError = undefined;
    if (pj.catchUpdateErrors) {
      try {
        this.update();
      } catch(e) {
        pj.updateError = e;
      }
    } else {
      this.update();
    }
  }
  var overrides = this.__overrides;
  if (overrides) {
    pj.installOverrides(this,overrides);
  }
}


pj.outerUpdate = function (node) {
  node.outerUpdate();
}

pj.forEachPart = function (node,fn) {
  pj.forEachTreeProperty(node,function (child) {
    if (child.__isPart) {
      fn(child);
    } else {
      pj.forEachPart(child,fn);
    }
  });
}

pj.partAncestor = function (node) {
  var rs = node;
  while (1) {
    if (rs.__isPart) {
      return rs;
    }
    var pr = rs.__get('__parent');
    if (pr) {
      rs = pr;
    } else {
      return rs;
    }
  }
}
  


pj.updateParts = function (node) {
  pj.forEachPart(node,pj.outerUpdate);
}
    

pj.resetComputedLNode = function (node,prop) {
  var child = node.__get(prop); 
  if (child) {
    pj.removeChildren(child);
  } else {
    child = node.set(prop,pj.Array.mk());
  }
  pj.declareComputed(child);
  return child;
}

// create a new fresh value for node[prop], all set for computing a new state

pj.resetComputedDNode = function (node,prop,factory) {
  var value = node.__get(prop),
    newValue;
  if (value) {
    pj.removeChildren(value);
  } else {
    if (factory) {
      var newValue = factory();
    } else {
      newValue = pj.Object.mk();
    }
    value = node.set(prop,newValue);
  }
  pj.declareComputed(value);
  return value;
}
  
/* if stash is nonnull, save the computed nodes to stash
 * the stash option is used when saving an item, but wanting its state to persist after the save
 */

pj.removeComputed = function (node,stash) {
  var thisHere = this,
    found = 0;
  pj.forEachTreeProperty(node,function (child,prop) {
    if (prop == "__required") {
      return;
    }
    var stashChild;
    if (child.__computed) {
      found = 1;
      if (stash) {
        stash[prop] = child;
      }
      child.remove();
    } else {
      if (stash) {
        stashChild = stash[prop] = {__internalNode:1};
      } else {
        stashChild = undefined;
      }
      if (pj.removeComputed(child,stashChild)) {
        found = 1;
      } else {
        if (stash) {
          delete stash[prop];
        }
      }
    }
  });
  return found;
}


pj.restoreComputed = function (node,stash) {
  for (var prop in stash) {
    if (prop === '__internalNode') continue;
    var stashChild = stash[prop];
    if (!stashChild) {
      return;
    }
    if (stashChild.__internalNode) {
      pj.restoreComputed(node[prop],stashChild);
    } else {
      node[prop] = stashChild;
    }
  }
}
 
//end extract

})(prototypeJungle);