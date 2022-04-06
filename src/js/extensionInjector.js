"use strict";

window.addEventListener('emailOpened', function(event){
    chrome.runtime.sendMessage({sender:'content-script',type: 'new-email', data: event.detail});
}, false)

window.addEventListener('no-data', function(event){
    chrome.runtime.sendMessage({sender:'content-script',type: 'no-data', data: event.detail});
}, false)



function addScript(src) {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = chrome.runtime.getURL(src);
    (document.body || document.head || document.documentElement).appendChild(script);
}

addScript("js/gmailJsLoader.js");
addScript("js/extension.js");
