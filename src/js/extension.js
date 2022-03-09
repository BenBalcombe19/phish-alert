"use strict";

// loader-code: wait until gmailjs has finished loading, before triggering actual extensiode-code.
const loaderId = setInterval(() => {
    if (!window._gmailjs) {
        return;
    }

    clearInterval(loaderId);
    startExtension(window._gmailjs);
}, 100);

// actual extension-code
function startExtension(gmail) {
    console.log("Extension loading...");
    window.gmail = gmail;

    gmail.observe.on("load", () => {
        const userEmail = gmail.get.user_email();
        console.log("Hello, " + userEmail + ". This is your extension talking!");

        gmail.observe.on("view_email", (emailID) => {
            const emailData = gmail.new.get.email_data(emailID);
            const phishingModule = require('./phishing.js');
            let phishing = new phishingModule.Phishing();
            var senderAddress, subject, content = "";

            if (emailData) {
                senderAddress = emailData.from.address;
                subject = emailData.subject;
                content = emailData.content_html;
                console.log("EMAIL DATA:",emailData)
            } else {
                console.log("EMAIL DATA NOT LOADED YET")
            }

            senderAddress ? console.log("Sender Address:", senderAddress) : console.log("NO ADDRESS");
            // content ? console.log("Sender Content:", content) : console.log("NO CONTENT");

            phishing.validateAddress(senderAddress);
            phishing.validateSubject(subject);

            if (phishing.phishy){
                gmail.tools.add_modal_window('Potential Phishing Attempt', 'Do you want to continue?',
                    function () {
                        console.log("HELLO WORLD")
                        gmail.tools.remove_modal_window();
                        chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
                            console.log("RESPONSE",response);
                        });
                    });
            }

        });

        gmail.observe.on("compose", (compose) => {
            console.log("New compose window is opened!", compose);
        });
    });
}
