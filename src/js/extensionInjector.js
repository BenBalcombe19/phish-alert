"use strict";

// Listen for email opened event from extension.js update the email data in chrome local storage
window.addEventListener('emailOpened', function(event){
    // sendMessage('content-script','new-email', event.detail)
    updateData('emailData', event.detail, true);
}, false)

// Listen for the no data event from the extension.js update the email data in chrome local storage
window.addEventListener('no-data', function(event){
    // sendMessage('content-script','no-data')
    updateData('emailData', {}, true);
}, false)

// Listen for the warning-given event and update time of last warning data property in chrome local storage
window.addEventListener('warning-given', function(event){
    // sendMessage('content-script','warning-given', event.detail)
    updateData('timeOfLastWarning',event.detail,false)

}, false)




// Listen for the get settings data event from extension.js and retrieve the data keys from chrome local storage
// This is run when the extension is loaded
window.addEventListener('get-settings-data', function(event){
    getData(['extensionActive','warningActive','warningThreshold','warningTimeout','timeOfLastWarning']).then((settingsData)=>{
        window.dispatchEvent(new CustomEvent("settings-retrieved", { detail: settingsData }));
    })
}, false)




// Whilst the get-settings-data event is fired at the injection of the script, this listener acts on anytime the settings
// data is updated and appropriately updates the data in the injected script
chrome.storage.onChanged.addListener(function (changes) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (key == 'warningActive' || key == 'warningThreshold' || key == 'warningTimeout' || key == 'extensionActive'){
            getData(['extensionActive','warningActive','warningThreshold','warningTimeout','timeOfLastWarning']).then((settingsData)=>{
                window.dispatchEvent(new CustomEvent("settings-retrieved", { detail: settingsData }));
            });
        }
    }
});

// Listen for messages from the background script and send the data into the extension.js
// This is for when data is dynamically updated by user in DOM and background script sends update
// chrome.runtime.onMessage.addListener(function (msg, sender, response) {
//     if (msg.sender === 'background-script') {
//         if (msg.type === 'settings-update') {
//             window.dispatchEvent(new CustomEvent("settings-retrieved", { detail: msg.settingsData }));
//         } 
//     }
//     return true;
// })

// function sendMessage(sender, type, data, callback){
//     chrome.runtime.sendMessage({sender: sender, type: type, data: data}, callback);
// }

function updateData(key, data, updateData) {
    chrome.storage.local.set({
        [key]: data
    }, () => {
        // if (updateData){
        //     chrome.runtime.sendMessage({ sender: 'content-script', type: 'data-update' });
        //     console.log('data updated')
        // }
    });
}

async function getData(dataKeys){
    let settingsData = {}

    for (let key of dataKeys){
        settingsData[key] = await readLocalStorage(key);
    }
    return settingsData;
}

const readLocalStorage = async (key) => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([key], function (result) {
        if (result[key] === undefined) {
          reject();
        } else {
          resolve(result[key]);
        }
      });
    });
};


function addScript(src) {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = chrome.runtime.getURL(src);
    (document.body || document.head || document.documentElement).appendChild(script);
}

addScript("js/gmailJsLoader.js");
addScript("js/extension.js");
