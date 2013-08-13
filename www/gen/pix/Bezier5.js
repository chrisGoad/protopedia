//var smudge = __pj__.set("smudge",om.mkDNode());

(function () {
  var om = __pj__.om;
  //var lib = draw.emptyWs("smudge");
om.install([],function () {
  var pix = __pj__.setIfMissing("pix");
  var geom = __pj__.geom;
  var draw = __pj__.draw;
  var  qw = pix.installType("Bezier5");
 // qw.set("__bounds__", geom.Rectangle.mk({corner:[-200,-200],extent:[200,200]}));
 qw.set("arcproto",geom.Arc.mk({startAngle:0,endAngle:2*Math.PI,style:{strokeStyle:"black",lineWidth:1}}));
  var arcp = qw.arcproto;
  arcp.hide();
  qw.set("arc0",arcp.instantiate());
  qw.set("arc1",arcp.instantiate());
  qw.arc0.show();
  qw.arc0.radius = 50;
  qw.arc1.radius = 100;
  qw.arc1.show();
  qw.spin = 0;
  qw.degreesField('spin');
  qw.setNote("spin","Move the destination of the lines around by this angle");;
 qw.set("bzproto",geom.Bezier.instantiate());
 var bzp = qw.bzproto;
 bzp.hide();


 
 //bzp.setN("style",{lineWidth:1,strokeStyle:"blue"});
 bzp.randomFactor = 8;
 bzp.setNote("randomFactor","How wiggly to make the lines");
 bzp.segCount = 5;
 // qw.setNote("setCount","How many wiggles do the lines have");
// vert = vertical ; posx, posy are 1, -1
  qw.bzproto.update = function () {
    var geom = __pj__.geom;
    var draw = __pj__.draw;
    var om = __pj__.om;
    var e0 = this.startPoint;
    var e1 = this.endPoint;
    
    var vc = e1.difference(e0);
    var vcs = vc.times(1/this.segCount);
    var qvcs = vcs.times(1/4);
    var vcn  = vc.normalize();
    var vcnn = vcn.normal();
    var cp = e0;
    var segs = om.LNode.mk();
    this.set("segments",segs);
    for (var i = 0;i<this.segCount;i++) {
      var odd = i%2;
      var dr = odd?-1:1;
      var np = cp.plus( vcs);
      var d = (dr*Math.random()) * this.randomFactor;
      var dsp = vcnn . times(d);
      var lastDsp;
      if (i==0) {
        var cp1 = cp.plus(dsp.plus(qvcs));
      } else {
        var cp1 = cp.plus((lastDsp.times(-1)).plus(qvcs)); // make this cp1 match the last cp2
      }
      lastDsp = dsp;
      var cp2 = np.difference(qvcs).plus(dsp);
      var bzs = Object.create(geom.BezierSegment);
      segs.pushChild(bzs);
      bzs.set("dest",np);
      bzs.set("cp1",cp1);
      bzs.set("cp2",cp2);
      cp = np;
    }
  }
  
  
  qw.lineCount = 10;
  qw.setInputF('lineCount',om,"checkPositiveInteger");

  qw.reverse = 0;
  qw.setNote("reverse","Reverse the order of traversal of the second arc, when computing where to attach lines.");
  qw.booleanField("reverse");
  
  qw.update = function () {
    var cnt = 0;
    var interval = 2*Math.PI/this.lineCount;
    var ca = 0;
    var curves = this.createChild("curves",om.LNode.mk);
    curves.computed();
    for (var i=0;i<this.lineCount;i++) {
      var bz = curves[i];
      if (!bz) {
        var bz = this.bzproto.instantiate();
        curves.pushChild(bz);
      }
      var t = i/(this.lineCount);
      if (this.reverse) var t1 = 1-t; else t1 = t;
      var pp0 = this.arc0.pathPosition(t);
      var pp1 = this.arc1.pathPosition(t1+(this.spin/(2*Math.PI)));
      bz.show();
      bz.startPoint = pp0;
      bz.endPoint = pp1;
      bz.update();
      ca = ca + interval;
    }
    
  }
  
  
  om.save(qw);
 
    
});
})();
  