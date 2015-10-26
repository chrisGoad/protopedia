
(function (pj) {
  'use strict'

// This is one of the code files assembled into pjcore.js. 'start extract' and 'end extract' indicate the part used in the assembly

//start extract

// <Section> update

/* When a Object has a method called update, the state of that node is maintained by application of that method
 * when there are changes. Some nodes within the tree might be generated by update, and in that case, the node is marked computed.
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



pj.updateErrors = [];
pj.debugMode = 1; // no tries in debug mode, to ease catching of errors
pj.updateCount = 0;
pj.catchUpdateErrors = 0;

pj.forEachPart = function (node,fn) {
  pj.forEachTreeProperty(node,function (child) {
    if (child.update) {
      fn(child);
    } else {
      pj.forEachPart(child,fn);
    }
  });
}

pj.partsFromSource = function (src) {
  var rs = pj.Array.mk();
  pj.forEachPart(function (part) {
    if (pj.fromSource(src)) {
      rs.push(src);
    }
  })
  return rs;
}
pj.partAncestor = function (node) {
  var rs = node;
  while (1) {
    if (rs.update) {
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
  var updateLast = [];
  pj.forEachPart(node,function (node) {
    if (node.__updateLast) {
      updateLast.push(node);
    } else {
      if (node.update) node.update();
    }
  });
  updateLast.forEach(function (node) {
     if (node.update) node.update();
  });
}

pj.updateRoot = function () {
  if (pj.root && pj.root.update)  {
    pj.root.update();
  } else if (pj.root) {
      pj.updateParts(pj.root);
  }
}
    

pj.resetComputedArray = function (node,prop) {
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

pj.resetComputedObject = function (node,prop,factory) {
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
 
 //pj.resetComputedDNode = pj.resetComputedObject; // old name
 
/* if stash is nonnull, save the computed nodes to stash
 * the stash option is used when saving an item, but wanting its state to persist after the save
 */

pj.removeComputed = function (node,stash) {
  var thisHere = this;
  var  found = 0;
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