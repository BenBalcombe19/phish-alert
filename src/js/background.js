// when the extension is first installed, set default values
chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.local.set({
        extensionActive: true,
        emailData: {},
        warningActive: true,
        warningThreshold: 5,
        warningTimeout: 5,
        timeOfLastWarning: 0
    }, function () { });
});