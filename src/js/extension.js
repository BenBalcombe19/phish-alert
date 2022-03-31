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
            let senderAddress, subject, content = "";

            var email = new gmail.dom.email(gmail.new.get.email_id());

            
            if (emailData) {
                senderAddress = emailData.from.address;
                subject = emailData.subject;
                content = emailData.content_html;
                console.log("EMAIL DATA:",emailData)
                phishing.validateSubject(subject);
                phishing.validateBody('Validating Body:',subject);
                emailData.scores = phishing.scores;

                if (emailData.from.name.length === 0){
                    emailData.from.name = email.from().name;
                }

                var event = new CustomEvent("emailOpened", {detail:emailData});
                window.dispatchEvent(event);
            } else {
                console.log("EMAIL DATA NOT LOADED YET")
            }

            // senderAddress ? console.log("Sender Address:", senderAddress) : console.log("NO ADDRESS");
            // content ? console.log("Sender Content:", content) : console.log("NO CONTENT");

            phishing.validateAddress(senderAddress);
            // phishing.validateSubject(subject);

            if (phishing.phishy){
                gmail.tools.add_modal_window('Potential Phishing Attempt', 'Do you want to continue?',
                    function () {
                        console.log("HELLO WORLD")
                        gmail.tools.remove_modal_window();
                    });
            }
        });

        gmail.observe.on("compose", (compose) => {
            console.log("New compose window is opened!", compose);
        });
    });
}
