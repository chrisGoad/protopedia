
'use strict';

//pj.require('/text/textbox.js','/shape/rectangle.js','/shape/rectanglePeripheryOps.js',
//function (textboxP,rectangleP,peripheryOps) {
pj.require('/text/textbox.js','/shape/rectanglePeripheryOps.js',
function (textboxP,peripheryOps) {var item = textboxP.instantiate();
//item.set('box',rectangleP.instantiate());
item.__defaultSize = pj.geom.Point.mk(45,30);
//item.width = 60;
//item.height = 40;
//item.uiShowForBox();
peripheryOps.installOps(item);

return item;
});

