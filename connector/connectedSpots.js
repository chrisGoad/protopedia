


core.require('/connector/connector0.js','/line/connectedSpots.js',function (connectorP,lineP) {

core.standsAlone('/line/connectedSpots.js');  // suitable for loading into code editor

let rs = connectorP.instantiate();
core.replacePrototype(rs,'lineP',lineP);
//core.setProperties(rs,lineP,lineP.adjustableProperties);
//ui.hide(rs,['shaft','stroke-width']);
return rs;
});
