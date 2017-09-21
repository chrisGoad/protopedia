'use strict';

pj.require('/shape/circlePeripheryOps.js',function (peripheryOps) {
var svg = pj.svg;
var ui = pj.ui;
var geom =  pj.geom;

var item =  svg.Element.mk('<circle/>');

/* adjustable parameters */
item.__dimension = 50; //either 
item.fill = 'transparent';
item.stroke = 'black';
item['stroke-width']  = 2;
/* end adjustable parameters */

// r can also be used for radius
Object.defineProperty(item, 'r', { set: function(x) {this.__dimension = 2 * x; } });
ui.hide(item,['r']);

item.__roles = ['vertex'];
item.__adjustable = true;
item.__draggable = true;
item.__cloneable = true;


item.__setDomAttributes = function (element) {
  element.setAttribute('r',0.5*this.__dimension); // set the circle's radius to half its dimension
};

item.update = function () {}
// used to compute where connections (eg arrows) terminate on this shape's periphery
peripheryOps.installOps(item);

ui.setTransferredProperties(item,ui.stdTransferredProperties);

item.__setExtent = function (extent,nm) {
  var event,ext;
  if ((nm === 'c01') || (nm === 'c21')) {
    ext = extent.x;
  } else if ((nm === 'c10') || (nm === 'c12'))  {
    ext = extent.y;
  } else {
    ext = Math.max(extent.x,extent.y);
  }
  this.__dimension = ext;
}


return item;
});

