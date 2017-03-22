
pj.require('/chart/component/axis.js','/chart/core/line.js','/lib/axis_utils.js',function (axisP,coreP,axisUtils) {
debugger;
var ui=pj.ui;
var geom=pj.geom;
var dat=pj.data;

var item = pj.svg.Element.mk('<g/>');
item.markType = 'pointArray';
item.__adjustable = true;
item.__draggable = true;

//item.set('extent',geom.Point.mk(500,400));
item.width = 500;
item.height = 400;

item.set("axisH",axisP.instantiate());
item.set("axisV",axisP.instantiate());


item.set("core",coreP.instantiate());
item.core.__unselectable = true;

item.axisSep  = 0;

axisUtils.initAxes(item,'adjustable');
//item.core.__show();

item.axisV.showTicks = item.axisH.showTicks = true;
item.axisV.showLine = item.axisH.showLine = true;
item.axisV.bigTickImageInterval = item.axisH.bigTickImageInterval = 30;

item.core.orientation = 'vertical';

item.shifterPlacement = function () {
 return geom.Point.mk(0,0);
}


item.update = function () {
  if (!this.__data) return;
  var idata = this.__getData();
  if (!dat.Sequence.isPrototypeOf(idata)) {
    pj.dat.throwDataError('Data has the wrong form; data sequence expected');
  }
  if (!idata.numericalDomain()) {
    pj.dat.throwDataError('Data has the wrong form: numerical domain expected');
  }
  this.set('extent',geom.Point.mk(this.width,this.height));
  axisUtils.updateAxes(this);
  this.core.__setData(this.__getData());
}

item.reset = function () {
  this.core.reset();
}



/**
 * Set accessibility and notes for the UI
*/

ui.hide(item,['color_utils','colors','axisSep',
  'alternativeDataSources','extent','hPadding','markType']);
return item;
});

