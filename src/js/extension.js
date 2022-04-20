"use strict";
const phishingModule = require('./phishing.js');

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
    // console.log("Extension loading...");
    window.gmail = gmail;
    var settings;
    window.dispatchEvent(new CustomEvent("get-settings-data"));

    window.addEventListener('settings-retrieved', function(event){
        settings = event.detail
    }, false)

    gmail.observe.on("load", () => {
        const userEmail = gmail.get.user_email();
        // console.log("Hello, " + userEmail + ". This is your extension talking!");

        gmail.observe.on("view_email", (emailID) => {
            if (settings.extensionActive){
                const emailData = gmail.new.get.email_data(emailID);
                let phishing = new phishingModule.Phishing();

                try{
                    var email = new gmail.dom.email(gmail.new.get.email_id());
                } catch {
                    console.log('email data errored')
                }

                if (emailData) {
                    // console.log("EMAIL DATA:", emailData);

                    // Another means to get the senders name to fix issue with name not being found
                    if (typeof emailData.from.name !== 'undefined') {
                        if (emailData.from.name.length === 0) {
                            emailData.from.name = email.from().name;
                        }
                    }

                    phishing.validateName(emailData.from.name);
                    phishing.validateSubject(emailData.subject, userEmail);
                    phishing.validateBody(emailData.content_html, emailData.from.address);
                    phishing.validateAttachments(email.attachments());
                    phishing.calculateOverallRating();

                    emailData.riskRatings = phishing.riskRatings;
                    emailData.links = phishing.linkArray;
                    emailData.attachmentsRated = phishing.attachmentArray;
                    emailData.userEmail = userEmail;
                    emailData.overallRating = phishing.overallRating;

                    window.dispatchEvent(new CustomEvent("emailOpened", { detail: emailData }));

                    if (settings.warningActive) {
                        if (warningTimerElapsed(settings.warningTimeout, settings.timeOfLastWarning)){
                            if (!validRatings(settings.warningThreshold, emailData.riskRatings,emailData.links, emailData.attachmentsRated)){
                                let dateNow = new Date();
                                window.dispatchEvent(new CustomEvent("warning-given", { detail: dateNow })); // Set the time of last warning to local storage for anytime the script is reloaded
                                settings.timeOfLastWarning = dateNow; // Set time of last warning to now for the current content script

                                gmail.tools.add_modal_window('Potential phishing attempt', 'Do you wish to continue?', () => {
                                    gmail.tools.remove_modal_window();
                                }, () => {
                                    window.history.back();
                                    gmail.tools.remove_modal_window();
                                });
                            }
                        }
                    }

                } else {
                    // console.log("EMAIL DATA NOT LOADED YET")
                    window.dispatchEvent(new CustomEvent("no-data", { detail: emailData }));
                }
            }
        });
    });
}

function validRatings(threshold, riskRatings, links, attachments){
    let valid = true;

    Object.values(riskRatings).forEach((rating) => {
        if (rating >= threshold){
            valid = false;
        }
    });

    for (let link of links){
        if (link.riskRating >= threshold){
            valid = false;
            break;
        }
    }

    for (let attachment of attachments){
        if (attachment.riskRating >= threshold){
            valid = false;
            break;
        }
    }
    
    return valid;
}

function warningTimerElapsed(warningTimeout, timeOfLastWarning){
    // console.log('timeOfLastWarning', timeOfLastWarning)
    // console.log('TIME SINCE LAST WARNING:',((new Date() - new Date(timeOfLastWarning)) / 60000))
    if (warningTimeout == 0 || timeOfLastWarning == 0){
        return true;
    } else {
        if (Math.floor(((new Date() - new Date(timeOfLastWarning)) / 60000)) > warningTimeout){
            return true;
        }
    }
    return false;
}