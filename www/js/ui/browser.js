(function (pj) {
  var ui = pj.om;

// This is one of the code files assembled into pjui.js. 'start extract' and 'end extract' indicate the part used in the assembly

//start extract


// <Section> browser ====================================================

ui.safariSupported = 1;

ui.browser = function () {
  var userAgent = window.navigator.userAgent,
    match,version;
  var genResult = function (browser) {
    if ((browser === 'Safari') || (browser === 'Googlebot')) {
      return {browser:browser}
    }
    version = parseInt(match[1]);
    return {browser:browser,version:version};
  } 
  match = userAgent.match(/Chrome\/(\d*)/);
  if (match) return genResult('Chrome');
  match = userAgent.match(/Firefox\/(\d*)/);
  if (match) return genResult('Firefox');
  match = userAgent.match(/MSIE (\d*)/);
  if (match) return genResult('IE');
  match = userAgent.match(/Safari/);
  if (match) return genResult('Safari');
  match = userAgent.match(/Googlebot/);
  if (match) return genResult('Googlebot');
  match = userAgent.match(/rv\:(\d*)/);
  if (match) return genResult('IE');
  return undefined;
}


ui.supportedBrowser = function () {
  var browserVersion = ui.browser();
  if (!browserVersion) {
    return 0;;
  }
  var browser =  browserVersion.browser;
  if ((browser === 'IE') && (browserVersion.version < 10)) {
    return 0;
  }
  if ((browser === 'Safari') && !ui.safariSupported) {
    return 0;
  }
  return 1;
}

ui.checkBrowser = function () {
  if (!ui.supportedBrowser()) {
    window.location.href = '/unsupportedbrowser';
  }
}
  

//end extract

})(prototypeJungle);

