(function (pj) {
  var ui = pj.ui;
  
// This is one of the code files assembled into pjui.js. //start extract and //end extract indicate the part used in the assembly
//start extract

if (!ui) {
  ui = pj.set("ui",pj.Object.mk());
}
ui.sessionTimeout = 24 * 60 * 60;
ui.useCloudFront =  0;
ui.useS3 = 1;
ui.cloudFrontDomain = "d2u4xuys9f6wdh.cloudfront.net";
ui.s3Domain = "openchart.net.s3.amazonaws.com";
//ui.messageCallbacks = {};   // for communication between pages on prototypejungle.org, and prototype-jungle.org
ui.itemDomain = ui.useCloudFront?"d2u4xuys9f6wdh.cloudfront.net":"openchart.net";
ui.setUIconstants = function () {
ui.atLive = location.href.indexOf('http://prototype-jungle.org')===0;
ui.liveDomain = pj.devVersion?"prototype-jungle.org:8000":"prototype-jungle.org";
ui.useMinified = !pj.devVersion;
if (pj.devVersion) {
  ui.homePage = "/indexd.html";
}
}
ui.itemHost = "http://"+ui.itemDomain;//"http://prototypejungle.org";

ui.homePage = "";
//pj.activeConsoleTags = (ui.isDev)?["error","updateError","installError"]:["error"];//,"drag","util","tree"];

//end extract

})(prototypeJungle);
