var util = require('./util.js');

var levelup = require('level');
if (!exports.pjdb) {
  util.log("level",'new db');
  var db = levelup('./pjdb');
  exports.pjdb = db;
} else {
  util.log("level","exising db");
}

exports.spew = function () {
  var rs = db.createReadStream();
  rs.on('data', function (data) {
    console.log("level",data.key, '=', data.value)
  })
  .on('error', function (err) {
    console.log("level",'Oh my!', err)
  })
  .on('close', function () {
    console.log("level",'Stream closed')
  })
  .on('end', function () {
    console.log("level",'Stream closed')
  })
}

exports.deleteAll = function () {
  var rs = db.createReadStream();
  rs.on('data', function (data) {
    console.log("level","deleting ",data.key);
    db.del(data.key);
  })
}