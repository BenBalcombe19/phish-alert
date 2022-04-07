// when the extension is first installed, set default values
chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.local.set({
        extensionActive: true,
        emailData: {},
        warningActive: false,
        warningThreshold: 5,
        warningTimeout: 5
    }, function () { });
});

chrome.runtime.onMessage.addListener(function (msg, sender, response) {
    console.log('Message Received', msg)
    if (msg.sender === 'content-script') {
        if (msg.type === 'new-email') {
            updateData(msg.data, 'data-update')
        } else if (msg.type === 'no-data') {
            updateData({}, 'data-update')
        } else if(msg.type === 'get-settings-data'){
            getData(['extensionActive','warningActive','warningThreshold','warningTimeout']).then((data)=>{
                response({settingsData: data});
            });
            
        }
    }
    return true;
})

function updateData(data, message) {
    chrome.storage.local.set({
        emailData: data
    }, () => {
        chrome.runtime.sendMessage({ sender: 'background-script', type: 'data-update' });
        console.log('data updated')
    });
}

async function getData(dataKeys){
    let settingsData = {}

    for (let key of dataKeys){
        settingsData[key] = await readLocalStorage(key);
    }
    console.log('SETTINGS DATA',settingsData)
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

chrome.storage.onChanged.addListener(function (changes, namespace) {
for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    if (key == 'warningActive' || key == 'warningThreshold' || key == 'warningTimeout' || key == 'extensionActive'){
        getData(['extensionActive','warningActive','warningThreshold','warningTimeout']).then((data)=>{
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                console.log('TABS',tabs)
                chrome.tabs.sendMessage(tabs[0].id, { sender: 'background-script', type: 'settings-update', settingsData: data});
            });
        });
    }
}
});