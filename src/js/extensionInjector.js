"use strict";

// Listen for email opened event from extension.js and send the data to background script
window.addEventListener('emailOpened', function(event){
    chrome.runtime.sendMessage({sender:'content-script',type: 'new-email', data: event.detail});
}, false)

// Listen for the no data event from the extension.js and send the update to the background script
window.addEventListener('no-data', function(event){
    chrome.runtime.sendMessage({sender:'content-script',type: 'no-data', data: event.detail});
}, false)

// Listen for the get settings data event from extension.js and send the request to the background script
// Then await the response and send a new custom event telling the extension.js the data
// This is run when the extension is loaded
window.addEventListener('get-settings-data', function(event){
    chrome.runtime.sendMessage({sender:'content-script',type: 'get-settings-data', data: event.detail}, function(response){
        window.dispatchEvent(new CustomEvent("settings-retrieved", { detail: response.settingsData }));
    });
}, false)

// Listen for messages from the background script and send the data into the extension.js
// This is for when data is dynamically updated by user in DOM and background script sends update
chrome.runtime.onMessage.addListener(function (msg, sender, response) {
    if (msg.sender === 'background-script') {
        if (msg.type === 'settings-update') {
            window.dispatchEvent(new CustomEvent("settings-retrieved", { detail: msg.settingsData }));
        } 
    }
    return true;
})


function addScript(src) {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = chrome.runtime.getURL(src);
    (document.body || document.head || document.documentElement).appendChild(script);
}

addScript("js/gmailJsLoader.js");
addScript("js/extension.js");
