
  
// This is one of the code files assembled into pjdom.js. 

if (pj.set) {
  var fb = pj.set("fb",pj.Object.mk());
} else {
  fb = pj.fb = {};
}
fb.__builtIn = true;

// get the  directory for this user. Create if missing.

var notSignedInUid = 'TcYg4ep5s5TrvfxG5CWr11vjZZu1';

 var protohart_config = {
    apiKey: "AIzaSyDCSJngwaC0I6K3QJNs4jibqmvV6Ezbvvc",
    authDomain: "protochart.firebaseapp.com",
    databaseURL: "https://protochart.firebaseio.com",
    storageBucket: "protochart.appspot.com",
  };
  
var config = {
    apiKey: "AIzaSyAKaFHViXlHy6Hm-aDeKa5S9Pnz87ZRpvA",
    authDomain: "prototypejungle.firebaseapp.com",
    databaseURL: "https://prototypejungle.firebaseio.com",
    storageBucket: "project-5150272850535855811.appspot.com",
  };

 var dev_config = {
    apiKey: "AIzaSyA97dcoN5fPvEoK_7LAGZcJn-GHd3xPW9I",
    authDomain: "prototypejungle-dev.firebaseapp.com",
    databaseURL: "https://prototypejungle-dev.firebaseio.com",
    storageBucket: "prototypejungle-dev.appspot.com",
  };
  
fb.initFirebase = function () {
   firebase.initializeApp(config);
   fb.rootRef =  firebase.database().ref();
   fb.storage = firebase.storage();
   fb.storageRef = fb.storage.ref();
}

/*
 * Structure: to the user, there is just one tree of objects. The underlying firebase structure is more complicated.
 * In the database <uid>/directory contains an entry for every element of the tree of whatever kind. For an item at <path>,
 * <uid>/diretory/<path> holds a 1, and in storage <uid>/<path> contains the corresponding data
 *
 */
fb.setCurrentUser = function (cb) {
  if (fb.currentUser) {
     if (cb) {
      cb();
     }
     return;
  }
  var  auth = firebase.auth();
  fb.currentUser = auth.currentUser;
  if (!fb.currentUser) {
    auth.onAuthStateChanged(function(user) {
      fb.currentUser = user;
      if (cb) {
        cb();
      }
    });
    return;
  }
  if (cb) {
    cb();
  }
}
fb.removeUser = function () {
 if (fb.currentUser) {
    var uid = encodeURIComponent(fb.currentUser.uid);
    var userRef = fb.rootRef.child(uid);
    userRef.remove();
 }
}

fb.currentUid = function ()  {
  return fb.currentUser?fb.currentUser.uid:undefined;
}

fb.directoryRefString = function () {
  return 'directory/' + fb.currentUid();
}


fb.directoryRef = function () {
  return fb.rootRef.child(fb.directoryRefString());
}


fb.accountRefString = function () {
  return 'account/' + fb.currentUid();
}


fb.accountRef = function () {
  return fb.rootRef.child(fb.accountRefString());
}





fb.storageRefString = function () {
  return fb.currentUid();
}

fb.svgMetadata =  {
  contentType: 'image/svg+xml'
};


fb.jsonMetadata =  {
  contentType: 'application/json'
};

fb.userRef = function () {
  return fb.rootRef.child(fb.currentUid()); 
}

pj.dotCode = 'd73O18t';

//  .'s are replaced by dotCode in the dataBase; this puts the dots back in
var putInDots  = function (src) {
  for (var k in src) {
    var v = src[k];
    if (typeof v === 'object') {
      var child = src[k];
      if (child) {
        putInDots(child);
      }
    } else if (k.indexOf(pj.dotCode)>-1) {
      delete src[k];
      src[k.replace(pj.dotCode,'.')] = v;
    }
  }
  return src;
}


fb.getDirectory = function (cb) {
  if (fb.directory) {
    cb(undefined,fb.directory);
    return;
  }
   if (!fb.currentUser) {
    fb.directory = {};//notSignedInDirectory;
    cb(undefined,fb.directory);
    return;
  }
  var directoryRef = fb.directoryRef();
  directoryRef.once("value").then(function (snapshot) {
    var rs = snapshot.val();
    if (rs === null) {
      cb(undefined,{});
      //fb.initializeStore(cb);
      return;
    } else {
      fb.directory = putInDots(rs);
    }
    cb(undefined,fb.directory);
  });
}



fb.getAccount = function (cb) {
  if (fb.account) {
    cb(undefined,fb.account);
    return;
  }
   if (!fb.currentUser) {
    fb.account = {};
    cb(undefined,fb.account);
    return;
  }
  var accountRef = fb.accountRef();
  accountRef.once("value").then(function (snapshot) {
    var rs = snapshot.val();
    if (rs === null) {
      cb(undefined,{});
      //fb.initializeStore(cb);
      return;
    } else {
      fb.account = rs;
    }
    cb(undefined,fb.account);
  });
}



fb.deleteFromUiDirectory = function (path) {
  var splitPath = path.split('/');
  var cd = fb.directory;
  if (!cd) {
    return;
  }
  var ln = splitPath.length;
  for (var i=1;i<ln-1;i++) {
    cd = cd[splitPath[i]];
    if (!cd) {
      return;
    }
  }
  delete cd[splitPath[ln-1]];
}


fb.deleteFromDatabase =  function (url,cb) {
  if (!fb.currentUser) {
    cb?cb('notSignedIn'):null;
    return;
  }
  var decodedUrl = pj.decodeUrl(url);
  var uid = decodedUrl[0];
  //var path = pj.stripInitialSlash(decodedUrl[1]);
  var path = decodedUrl[1];
  if (uid !== fb.currentUid()) {
    cb?cb('permissionDenied'):null;
    return;
  }
  var removePromise;
  var dotPath = path.replace('.',pj.dotCode);
  var deleteFromDirectory = function () {
    var fullPath = fb.directoryRefString()+dotPath;
    var directoryRef = fb.rootRef.child(fullPath);
    var removePromise = directoryRef.remove();
    removePromise.then(function () {
      fb.deleteFromUiDirectory(path);
      cb?cb(undefined,'ok'):null;
    });
  }
   var  deleteFromStorage = function () {
    var fullPath = fb.storageRefString()+path;
    var storageRef = fb.storageRef.child(fullPath);
    var deletePromise = storageRef.delete();
    deletePromise.then(function () {
      deleteFromDirectory(path);
    }).catch(function (error) {
       pj.error('firebase','delete from directory failed'); 
    });
  }
  var ext = pj.afterLastChar(path,'.',true);
  deleteFromStorage();
  
}
  


fb.addToDirectory = function (parentPath,name,link,cb) {
    if (!fb.currentUser) {
    return;
  }
  var directoryRef = fb.directoryRef();
  var uv,pRef;
  if (directoryRef) {
    pRef = directoryRef.child(parentPath);
    uv = {};
    //uv[name] = link;
    uv[name] = 1;
    pRef.update(uv,cb);
  }
}


fb.setAccountValue = function (id,value,cb) {
    if (!fb.currentUser) {
    return;
  }
  var accountRef = fb.accountRef();
  var uv,idRef;
  if (accountRef) {
    //idRef = accountRef.child(id);
    uv = {};
    uv[id] = value;
    accountRef.update(uv,cb);
  }
}


fb.directoryValue = function (path,cb) {
  fb.getDirectory(function (err,directory) {
      var rs = pj.evalPath(directory,path);
      cb(null,rs);
    });
  
  }
/*  var uid = fb.currentUser.uid;
  var directoryRef = fb.rootRef.child(fb.directoryRefString()+path.replace('.',pj.dotCode));
  directoryRef.once("value",function (snapshot) {
    var rs = snapshot.val();
    cb(null,rs);
  });
}
*/
fb.getFromStore = function (uid,path,cb) {
  var ref = fb.rootRef.child(uid+path);
  ref.once("value",function (snapshot) {
    var rs = snapshot.val();
    cb(null,rs);
  });
}

  
fb.testStore = function () {
  var uid = encodeURIComponent(fb.authData.uid);
  var directoryRef = new Firebase(fb.firebaseHome+'/'+uid+'/directory');
  directoryRef.set({});return;
  directoryRef.update({'a':'def'});
}

// decodes a pjUrl of the form [uid]/path
//if iurl has the form [uid]/whatever (a "pjUrl"), uid is taken from the path

pj.decodeUrl = function (iurl,uid) {
  var m= iurl.match(/\((.*)\)(.*)/);
  //var m= iurl.match(/\[(.*)\](.*)/);
  if (m) {
    return [m[1],m[2]];
  } else {
    return [uid,iurl];
  }
}

pj.uidOfUrl = function (url)  {
  //var m= url.match(/\[(.*)\](.*)/);
  var m= url.match(/\((.*)\)(.*)/);
  return m?m[1]:undefined;
}

pj.pathOfUrl = function (url) {
  var m= url.match(/\((.*)\)(.*)/);
  return m?m[2]:undefined;
}

// the url for the directory side of the db (/s/...)

pj.databaseDirectoryUrl = function (ipath,iuid) {
  var uid,path;
  var durl = pj.decodeUrl(ipath);
  uid = durl[0];
  path = durl[1].replace('.',pj.dotCode)
  return 'https://prototypejungle.firebaseio.com/directory/'+uid+path+'.json';
}


pj.webPrefix = '/repo1';


pj.storageUrl = function (ipath,iuid) {
  var uid,path;
  if (pj.beginsWith(ipath,'http://')||pj.beginsWith(ipath,'https://')) {
    return ipath;
  }
  var durl = pj.decodeUrl(ipath,iuid);
  uid = durl[0];
  uid = (uid==='sys')?'twitter:14822695':uid;
  path = durl[1];
  if (uid) {
    return 'https://firebasestorage.googleapis.com/v0/b/project-5150272850535855811.appspot.com/o/'+
    encodeURIComponent(uid+path)+'?alt=media';
  } else if (pj.beginsWith(ipath,'/'))  {
    return pj.webPrefix + ipath;
  } else {
    return ipath;
  }
}


pj.mapUrl = pj.storageUrl; // used down in core/install.js

pj.indirectUrl = function (iurl) { // deals with urls of the form [uid]path
  if (pj.beginsWith(iurl,'[')) {

     return pj.databaseDirectoryUrl(iurl)
  }
}

fb.filterDirectory = function (dir,filter) {
  var rs = {};
  var none = true;
  for (var name in dir) {
    var element = dir[name];
    if (typeof element === 'string')  {
      if (filter(name)) {
        rs[name] = "1";
        none = false;
      }
    } else {
      var fel = fb.filterDirectory(element,filter);
      if (fel) {
        rs[name] = fel;
        none = false;
      }
    }
  }
  return none?undefined:rs;
}

fb.filterDirectoryByExtension = function (dir,ext) {
  return fb.filterDirectory(dir,function (element) {
    return pj.endsIn(element,ext);
  });
}
  
  

  
  
  