

/*
Utility for updating  Repo3.


cd /mnt/ebs0/prototypejungledev/node;node admin/toRepo3.js
 
*/
var files = [
     'test/two_arrows.js','test/arrow.js','shape/arrow1.js',
      'chart/component/axis1.js','test/axis.js',
      'chart/component/labels1.js','test/labels.js','example/data/labels0.js',
      'chart/component/legend1.js','test/legend.js',
       'chart/core/bar1.js','test/core_bar.js',
       'lib/text_layout.js','text/textarea1.js','test/textarea.js',
        'chart/scatter1.js','chart/core/scatter1.js','test/core_scatter.js','test/scatter.js',      
      'chart/bar1.js','chart/line1.js','test/bar.js','test/bar_categories.js','test/core_bar_categories.js','test/line.js',
       'chart/column1.js','test/column.js',
       'chart/core/line1.js','test/core_line.js',
      'lib/color_utils.js',
       'example/data/metal_densities.js',
       'example/data/trade_balance.js',
       'example/data/trade_balanceN.js',
       'example/data/graph0.js','example/data/figure2.js',
       'example/two_rectangles.js','example/two_arrows.js','example/standalone.html',
       'example/simple_bar_chart.js','example/bar_chart.js','example/external_data0.js',
       'example/external_data1.js','example/sample_data0.js','example/figure2.js',
       'example/bar_categories.js',
       'example/bar_chart_components.js',
       'example/bar_chart_slow.js',
       'nonfunctional/lines1.js',
     'test/graph.js','graph/def.js','graph/svg.js'
     ];

var srcdir = "/mnt/ebs0/prototypejungle/repo3xfer/";
var dstdir = "sys/repo3/";
var jst = "application/javascript";
var htt = "text/html";

var fs = require('fs');
var s3 = require('../s3');
var util = require('../util.js');

var toS3 = function (fl,cb) {
    var mxa = 0;
    var fpth = srcdir+fl;
    var dpth = dstdir+fl;
    var ctp = (fl.indexOf('.js')>0)?jst:htt;
    console.log("Reading from ",fpth, "saving to ",dpth,' content type',ctp);
    var vl = fs.readFileSync(fpth).toString();
    s3.save(dpth,vl,{contentType:ctp,encoding:"utf8",maxAge:mxa,dontCount:1},cb);
  }
//toS3(files[0]);

 util.asyncFor(toS3,files,function () {
    console.log("DONE UPDATING S3");
  },1);




