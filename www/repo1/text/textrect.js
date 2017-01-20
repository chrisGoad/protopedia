// Arrow

'use strict';

pj.require('/text/textboxP.js','/shape/rectangle.js',function (textboxP,rectangleP) {

var item = textboxP.instantiate();
item.set('box',rectangleP.instantiate());
item.box.__unselectable = true;
item.fill = '#f5f5ff';
item.stroke  = 'black';
item['stroke-width'] = 3;
item.box.__affixedChild = true; // dragging the box, drags this item


item.update = function () {
  debugger;
  this.updateCommon();
  //this.drawLineHead();
}

return item;
});

