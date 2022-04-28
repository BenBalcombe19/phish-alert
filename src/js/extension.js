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

// Main code below which is run once the gmail.js API is loaded
function startExtension(gmail) {
    window.gmail = gmail;
    var settings;

    // Event dispatch and listener for getting the settings data
    window.dispatchEvent(new CustomEvent("get-settings-data"));
    window.addEventListener('settings-retrieved', function(event){
        settings = event.detail
    }, false)

    gmail.observe.on("load", () => {
        const userEmail = gmail.get.user_email();

        gmail.observe.on("view_email", (emailID) => {
            // Only run the following block of code if the extension hasn't been turned off by the user
            if (settings.extensionActive){
                const emailData = gmail.new.get.email_data(emailID); // emailData is the data object of the opened email
                let phishing = new phishingModule.Phishing(); // Instantiate the phishing module

                // Different way to get email data as sometimes the gmail.new.get.email_data() function has issues
                try{
                    var email = new gmail.dom.email(gmail.new.get.email_id());
                } catch {
                    console.log('email data errored')
                }

                if (emailData) {
                    // Another means to get the senders name to fix issue with name not being found
                    if (typeof emailData.from.name !== 'undefined') {
                        if (emailData.from.name.length === 0) {
                            emailData.from.name = email.from().name;
                        }
                    }

                    // Pass data to the various phishing analysis functions
                    phishing.validateName(emailData.from.name);
                    phishing.validateSubject(emailData.subject, userEmail);
                    phishing.validateBody(emailData.content_html, emailData.from.address);
                    phishing.validateAttachments(email.attachments());
                    phishing.calculateOverallRating();

                    // Set the new data on the emailData object
                    emailData.riskRatings = phishing.riskRatings;
                    emailData.links = phishing.linkArray;
                    emailData.attachmentsRated = phishing.attachmentArray;
                    emailData.userEmail = userEmail;
                    emailData.overallRating = phishing.overallRating;

                    //Send event to let the extension know email has been opened and pass emailData object
                    window.dispatchEvent(new CustomEvent("emailOpened", { detail: emailData }));

                    // Warning popup if the user settings allows it
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
                    // If the gmail.js API hasn't found any email data, send event to let the extension know
                    window.dispatchEvent(new CustomEvent("no-data", { detail: emailData }));
                }
            }
        });
    });
}

// Function to check if any of the ratings given to each email element are greater than the threshold the user
// sets at which to be warned
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

// Function to check if the time since the last warning given is greater than the warning timeout specified by the user
function warningTimerElapsed(warningTimeout, timeOfLastWarning){
    if (warningTimeout == 0 || timeOfLastWarning == 0){
        return true;
    } else {
        if (Math.floor(((new Date() - new Date(timeOfLastWarning)) / 60000)) > warningTimeout){
            return true;
        }
    }
    return false;
}