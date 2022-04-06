// when the extension is first installed, set default values
chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.local.set({
        active: true,
        emailData: {},
        activeWarning: false
    }, function () { });
});

chrome.runtime.onMessage.addListener(function (msg, sender, response) {
    console.log('Message Received', msg)
    if (msg.sender === 'content-script') {
        if (msg.type === 'new-email') {
            updateData(msg.data, 'data-update')
        } else if (msg.type === 'no-data') {
            updateData({}, 'data-update')
        }
    }
})

function updateData(data, message) {
    chrome.storage.local.set({
        emailData: data
    }, () => {
        chrome.runtime.sendMessage({ sender: 'background-script', type: 'data-update' });
        console.log('data updated')
    });
}