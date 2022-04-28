"use strict";

// Listen for email opened event from extension.js update the email data in chrome local storage
window.addEventListener('emailOpened', function(event){
    updateData('emailData', event.detail, true);
}, false)

// Listen for the no data event from the extension.js update the email data in chrome local storage
window.addEventListener('no-data', function(event){
    updateData('emailData', {}, true);
}, false)

// Listen for the warning-given event and update time of last warning data property in chrome local storage
window.addEventListener('warning-given', function(event){
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

// Helper function to set data from the chrome.storage API
function updateData(key, data, updateData) {
    chrome.storage.local.set({
        [key]: data
    }, () => {});
}

// Helper function to retrieve data from the chrome.storage API
// asnynchronous as often run inside a for loop to retrieve multiple data properties and would slow down to run
// synchronously
async function getData(dataKeys){
    let settingsData = {}

    for (let key of dataKeys){
        settingsData[key] = await readLocalStorage(key);
    }
    return settingsData;
}

// Called by the getData() function to actually make the API call and handle the rejection if data not retrieved
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

// function to inject scripts into the content script of the extension
function addScript(src) {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = chrome.runtime.getURL(src);
    (document.body || document.head || document.documentElement).appendChild(script);
}

addScript("js/gmailJsLoader.js");
addScript("js/extension.js");
