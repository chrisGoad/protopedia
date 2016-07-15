// Arrow

'use strict';

(function () {
var svg = pj.svg;
var ui = pj.ui;
var geom = pj.geom;

var item = svg.Element.mk('<g/>');
item.__adjustable = 1;
item.set("shaft", svg.Element.mk('<path fill="none" stroke="blue"  stroke-opacity="1" stroke-linecap="round" stroke-width="1"/>'));
item.set('labelText', svg.Element.mk('<text font-size="20" stroke-width="0.2" font-style="italic" font-family="Arial" stroke="black" text-anchor="middle">1</text>'));
//item.label.setText('a');
item.label = '';
item.labelSep = 20;

item.setLabel = function (txt) {
  this.label.setText(txt);
}

/*

*/

item.shaft.__unselectable = 1;
item.shaft.__show();
item.stroke = "blue";
item.clockwise = 0;
item.headLength = 15;
item.headWidth = 10;
item.headGap = 10; // arrow head falls short of e1 by this amount
item.tailGap = 10; // tail of arrow  is this far out from e0
item.radius = 2; // radius as a multiple of distance from end0 to end1

item.includeEndControls = 1;

item['stroke-width'] = 2;
item.set("HeadP",
  svg.Element.mk('<line x1="-10" y1="0" x2="0" y2="20" visibility="hidden" \
    stroke="black"  stroke-linecap="round" stroke-width="2"/>'));
item.set("head0",item.HeadP.instantiate());
item.set("head1",item.HeadP.instantiate());
item.head0.__show();
item.head1.__show();
item.head0.__unselectable = 1;
item.head1.__unselectable = 1;
item.set("end0",pj.geom.Point.mk(0,0));
item.set("end1",pj.geom.Point.mk(100,0));
//item.set("tailPoint",geom.Point.mk());
//item.set("headPoint",geom.Point.mk());
//item.set("center",geom.Point.mk());
item.__customControlsOnly = 1;

var center,tailPoint,headPoint,aHead,aTail,aHeadd,aTaild;


item.setEnds = function (p0,p1) {
  this.end0.copyto(p0);
  this.end1.copyto(p1);
}

/* debugging aid 
item.set("circle0",svg.Element.mk(
   '<circle fill="red" cx="0" cy="0" stroke="black" stroke-width="0.2" \ r="2" />'));

item.set("circle1",svg.Element.mk(
   '<circle fill="orange" cx="0" cy="0" stroke="black" stroke-width="0.2" \ r="2" />'));
item.mark = function (p,n) {
  this['circle'+n].cx  = p.x;
  this['circle'+n].cy  = p.y;
}
*/
var halfwayPoint; //between end0,end1 on straight line
var radius;
var length;

item.computeRadius = function () {
  var e0 = this.end0,e1 = this.end1;
  length = (e1.difference(e0)).length();
  radius = length * this.radius;
  return radius;
}
item.computeCircleCenter = function () {
    var e0 = this.end0,e1 = this.end1;
  var v = e1.difference(e0);
  var ln = v.length();
  radius  = ln * this.radius;

  var distToCenterSquared = radius*radius - 0.25*ln*ln;
  var distToCenter = Math.sqrt(distToCenterSquared);
  halfwayPoint = e1.plus(e0).times(0.5);// halfway point between e0 and e1
  var uv = v.times(1/ln).normal(); // the direction normal to e0->e1
  center = halfwayPoint.difference(uv.times(distToCenter * (this.clockwise?-1:1)));
  //this.mark(center,0);
  //this.center.copyto(center);
  //console.log("DISTANCES",center.distance(e0),center.distance(e1),r);
  return center;
  
}
item.setEnds = function (p0,p1) {
  this.end0.copyto(p0);
  this.end1.copyto(p1);
}

var toDeg = 180/Math.PI;
item.pointAtAngle = function (angle,otherRadius) {
  var rad = otherRadius?otherRadius:radius;
  var ad = toDeg * angle;
  var vc = geom.Point.mk(Math.cos(angle),Math.sin(angle)).times(rad);//vector from center
  return center.plus(vc);
  return this.center.plus(vc);

}

item.computeEnds = function () {
      var e0 = this.end0,e1 = this.end1;
      debugger;
  //var ln = (e1.difference(e0)).length();
  this.computeRadius();
  //radius = ln * this.radius;
  //var center = this.computeCircleCenter();
  this.computeCircleCenter();
  var e02c = e0.difference(center);
  var e12c = e1.difference(center);
  var a0 = Math.atan2(e02c.y,e02c.x);
  var a1 = Math.atan2(e12c.y,e12c.x);
  var a0d = a0*toDeg;//debugging
  var a1d = a1*toDeg;
  aTail = a0 - (this.clockwise?-1:1) * this.tailGap/radius;
  aHead = a1 + (this.clockwise?-1:1) * this.headGap/radius;
  pj.aTaild = aTail*toDeg;
  pj.aHeadd = aHead * toDeg;
  console.log('atail',aTaild,'ahead',aHeadd);
  //this.aTail = aTail;
  //this.aHead = aHead;
  //var tailVFC = geom.Point.mk(Math.cos(aTail),Math.sin(aTail)).times(radius);//vector from center
  tailPoint = this.pointAtAngle(aTail);//center.plus(tailVFC);
  //this.tailPoint.copyto(tailPoint);
  headPoint = center.plus(geom.Point.mk(Math.cos(aHead),Math.sin(aHead)).times(radius));
  //this.headPoint.copyto(headPoint);
  return;
  var e0 = this.end0,e1 = this.end1;
  var d = e1.difference(e0).normalize();
  return e1.difference(d.times(this.headGap));
}
/* aHead and aTail might be more that PI apart (eg -PI - small angle , and PI+small angle). For finding the middle
on the correct side, we need to bring aTail  within PI of aHead*/
var bringWithinPI = function (target,otherAngle) {
  if (Math.abs(otherAngle - target) < Math.PI) return otherAngle;
  if (otherAngle > target) {
    return otherAngle - 2*Math.PI
  }
  return otherAngle + 2*Math.PI;
}

item.middle = function (otherRadius) { //middle point on the curved arrow
  var aTailN = bringWithinPI(aHead,aTail);
  console.log(toDeg*(aTailN - aHead));
  return this.pointAtAngle(0.5*(aHead+aTailN),otherRadius);
}

item.setEnds = function (e0,e1) {
  this.end0.copyto(e0);
  this.end1.copyto(e1);
}
item.setColor = function (c) {
  this.stroke = c;
}

item.updateShaft = function () {
  var d = 'M '+ tailPoint.x+' '+ tailPoint.y;
  d += ' A '+ radius+' ' + radius+' 1 0 '+this.clockwise+' '+headPoint.x+' '+headPoint.y;
  //console.log('d',d);
  this.shaft.d = d;
}
var firstTime = 1;
item.update = function () {
  var e0 = this.end0,e1 = this.end1;
  var hw = Number(this.head0['stroke-width']);
  //var d = e1.difference(e0).normalize();
  //var e1p = this.computeEnd1();
  var n,sh,e1he,h0,h1;
  //debugger;
  this.computeEnds();
  this.updateShaft();
  var d = geom.Point.mk(Math.cos(aHead),Math.sin(aHead)).normal().minus();;
 // this.shaft.setEnds(e0,e1p);
 
  
  this.head0.stroke = this.head1.stroke = this.shaft.stroke = this.stroke; 
  this.head0['stroke-width'] = this.head1['stroke-width'] = this.shaft['stroke-width'] = this['stroke-width'];
  n = d.normal().times(0.5*this.headWidth);
  var hp = headPoint;
  sh = this.pointAtAngle(aHead + (this.clockwise?-1:1) *this.headLength/radius);//hp.difference(d.times(this.headLength)); //  point on shaft where head projects
 // e1he = hp.plus(d.times(0.0*hw));
// this.mark(sh,1);
  h0 = sh.plus(n);
  h1 = sh.difference(n);
  this.head0.setEnds(hp,h0);
  this.head1.setEnds(hp,h1);
  debugger;
  if (this.label) {
    this.labelText.__show();
    var labelPos = this.middle(radius+this.labelSep);
    this.labelText.setText(this.label);
    this.labelText.__moveto(labelPos);
    this.labelText.center();
  } else {
    this.labelText.__hide();
  }
}


item.__controlPoints = function () {
  var rs =  [this.head0.end2()];
  this.computeEnds();
  rs.push(this.middle());
  if (this.includeEndControls) {
    rs.push(this.end0);
    rs.push(this.end1);
  }
  //pj.uu();
  return rs;
}

item.__holdsControlPoint = function (idx,headOfChain) {
  if (idx === 0) {
    return this.hasOwnProperty('headWidth')
  }
  return headOfChain;
}

pj.uu = function () {pj.root.shape.uu()};
item.__updateControlPoint = function (idx,pos) {
  console.log("UPDATE CONTROL POINT");
  var event,toAdjust,e0,e1,end,d,n,e1p,h2shaft,cHeadWidth,cHeadLength;
  if (idx > 1) {
    if (idx === 2) {
      end = this.end0;
    } else {
      end = this.end1;
    }
    end.copyto(pos);
    event = pj.Event.mk('moveArrowEnd',end);
    event.emit();
    this.update();
    this.__draw();
    return;
  }
  toAdjust = ui.whatToAdjust?ui.whatToAdjust:this;// we might be adjusting the prototype
  this.computeEnds();
  if (idx===0) {
     // adjust the head
     //var d = geom.Point.mk(Math.cos(aHead),Math.sin(aHead)).normal().minus();// direction from head along arc towards tail
    this.computeRadius();
    var n = geom.Point.mk(Math.cos(aHead),Math.sin(aHead));// normal to the arrow at head
    var d = n.normal().minus();
    var sh = this.pointAtAngle(aHead + (this.clockwise?-1:1) *this.headLength/radius);// point on shaft which head ends project to
    var pos2shaft = pos.difference(sh);
    var newHeadWidth = pos2shaft.dotp(n);
    var newHeadLength = toAdjust.headLength+(this.clockwise?1:-1) *pos2shaft.dotp(d);
    toAdjust.headWidth = Math.max(0,2*newHeadWidth);
    toAdjust.headLength = Math.max(0,newHeadLength);
   
    
  } else {
    // adjust the radius
     /* we need to compute a new radius such that the distance from the new center
     * to the head is the same as that to the new (dragged) middle
     * now the new center will lie on the existing line from the center to the arcCenter
     *  Let v be the unit vector in the direction from center to arcCenter
     *  Suppose that the newCenter(nx,ny) is t*v + center.
     *  So nx = t*vx + cx, ny = t*vy + cy
     *  We want to solve for t
     *  we have
     *  dist(newCenter,headPoint) = distance(newCenter,newMiddle)
     *  newMiddle = middle + delta*v (write newMiddle as mx,my)
     *  distanceSquared(newCenter,headPoint) = (nx -hx)**2 + (ny- hy)**2
     *  distanceSquared(newCenter,newMiddle) = (nx - mx)**2 + (ny - my)**2
     *  Call t*vx + cx nx, t*vy+cy ny
     *  We have:
     *  nx**2 - 2*nx*hx + hx**2 + ny**2 - 2*ny*hy + hy**2 - (nx**2 - 2*nx*mx + mx**2 + ny**2 - 2*ny*my + my**2 = 0
     *  hx**2 + hy**2 - mx**2 - my**2 + 2*(nx*mx + ny*my - nx*hx - ny*hy) = 0
     *  ss + 2*((t*vx+cx)*mx + (t*vy+cy)*my - (t*vx+cx)*hx - (t*vy+cy)*hy) = 0
     *  ss + t * 2 * (vx*mx + vy*my - vx*hx - vy*hy) + 2*(cx*mx + cy*my - cx*hx - cy*hy) = 0
     * ss + t * 2 * (vx*(mx-hx) + vy*(my-hy)) + 2*(cx*(mx-hx) + cy*(my - hy)) = 0
     * t * 2 * (vx*(mx-hx) + vy*(my-hy)) = 2*(cx*(hx-mx) + cy*(hy - my)) - ss
     * t =  (2*(cx*(hx-mx) + cy*(hy - my)) - ss)/(2 * (vx*(mx-hx) + vy*(my-hy))) 
     *  whew!
     */
     debugger;
     toAdjust.computeRadius();
    //var r = toAdjust.radius;
    var middle = toAdjust.middle();
    var v = middle.difference(center).normalize();
    var dist = pos.distance(center);
    var hwdist = halfwayPoint.distance(center);
    if (dist < hwdist) {
      return;
    }
    var delta = dist - radius;
    var newMiddle = middle.plus(v.times(delta));
    var mx=newMiddle.x,my=newMiddle.y;
    var vx=v.x,vy=v.y;
    var cx=center.x,cy=center.y;
    var hx=toAdjust.end0.x,hy=toAdjust.end0.y;
    var ss = hx*hx + hy*hy - ( mx*mx + my*my);
    var t = (2*(cx*(hx-mx) + cy*(hy - my)) - ss)/(2 * (vx*(mx-hx) + vy*(my-hy)));
    var newCenter = center.plus(v.times(t));
    var nx = newCenter.x,ny = newCenter.y;
    //var minRadius = 0.5 * toAdjust.end0.distance(toAdjust.end1);
    var maxRadius = 100;// a big number, is all
    toAdjust.radius = Math.min(maxRadius,Math.max(0.5,(radius + delta- t)/length));
  }
  ui.adjustInheritors.forEach(function (x) {
    x.__update();
    x.__draw();
  });
  return;
}

ui.hide(item,['HeadP','shaft','includeEndControls']);
ui.hide(item,['head0','head1','LineP','end0','end1']);

pj.returnValue(undefined,item);
})();
