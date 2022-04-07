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
    var settings;
    let getSettingsDataEvent = new CustomEvent("get-settings-data");
    window.dispatchEvent(getSettingsDataEvent);

    window.addEventListener('settings-retrieved', function(event){
        settings = event.detail
    }, false)

    gmail.observe.on("load", () => {
        const userEmail = gmail.get.user_email();
        console.log("Hello, " + userEmail + ". This is your extension talking!");

        gmail.observe.on("view_email", (emailID) => {
            const emailData = gmail.new.get.email_data(emailID);
            const phishingModule = require('./phishing.js');
            let phishing = new phishingModule.Phishing();
            let senderAddress, senderName, subject, content = "";

            try{
                var email = new gmail.dom.email(gmail.new.get.email_id());
            } catch {
                console.log('email data errored')
            }

            if (emailData) {
                console.log("EMAIL DATA:", emailData);

                senderAddress = emailData.from.address;
                subject = emailData.subject;
                content = emailData.content_html;

                if (typeof emailData.from.name !== 'undefined') {
                    if (emailData.from.name.length === 0) {
                        emailData.from.name = email.from().name;
                    }
                }
                senderName = emailData.from.name;

                phishing.validateName(senderName);
                phishing.validateSubject(subject, userEmail);
                phishing.validateBody(content, emailData.from.address);
                // phishing.validateAttachments();
                emailData.scores = phishing.scores;
                emailData.links = phishing.linkArray;

                emailData.userEmail = userEmail;

                window.dispatchEvent(new CustomEvent("emailOpened", { detail: emailData }));

                if (settings.warningActive) {
                    if (!validScores(settings.warningThreshold, emailData.scores,emailData.links)){
                        gmail.tools.add_modal_window('Potential Phishing Attempt', 'Do you want to continue?', () => {
                            gmail.tools.remove_modal_window();
                        });
                    }
                }

            } else {
                console.log("EMAIL DATA NOT LOADED YET")
                window.dispatchEvent(new CustomEvent("no-data", { detail: emailData }));
            }

        });
    });
}

function validScores(threshold, scores, links){
    let valid = true;

    Object.values(scores).forEach((score) => {
        if (score >= threshold){
            valid = false;
        }
    });

    links.forEach((link) => {
        if (link.riskRating >= threshold){
            valid = false;
        }
    })

    return valid;
}
