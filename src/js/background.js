// when the extension is first installed, set default values
chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.local.set({
        emailData: {},
        active: true
    }, function() {});
});

chrome.runtime.onMessage.addListener(function(msg, sender, response) {
    console.log('Message Received', msg)
    if (msg.sender === 'content-script'){
        if (msg.type === 'new-email'){
            chrome.storage.local.set({
                emailData: msg.data
            }, () => {
                chrome.runtime.sendMessage({sender:'background-script',type: 'data-update'});
            });
        }
    }
})