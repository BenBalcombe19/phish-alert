"use strict";
const phishingModule = require('./phishing.js');

// Wait until gmailjs has finished loading, before calling the main extension code.
const loaderId = setInterval(() => {
    if (!window._gmailjs) {
        return;
    }

    clearInterval(loaderId);
    startExtension(window._gmailjs);
}, 100);

// The modal that displays the risk rating of current email displayed at top of email
const riskModal = document.createElement("div");
riskModal.style.display = "inline";
riskModal.style.alignItems = "center";
riskModal.style.width = "fit-content";
riskModal.style.padding = "3px 5px";
riskModal.style.marginRight = "5px";
riskModal.style.color = "#fff";
riskModal.style.fontSize = "11px";
riskModal.style.borderRadius = "3px";

// The button to block the current sender displayed at top of email
const blockButton = document.createElement("div");
blockButton.style.display = "inline";
blockButton.style.alignItems = "center";
blockButton.style.width = "fit-content";
blockButton.style.padding = "3px 5px";
blockButton.style.color = "white";
blockButton.style.background = "#1aa260";
blockButton.style.fontSize = "11px";
blockButton.style.borderRadius = "3px";
blockButton.style.cursor = "pointer";
blockButton.innerHTML = "Block Sender";

//************************************************//
////////////// Main Code Starts Here ///////////////
//************************************************//

function startExtension(gmail) {
    window.gmail = gmail;
    var settings;

    // Event dispatch and listener for getting the settings data
    window.dispatchEvent(new CustomEvent("get-settings-data"));
    window.addEventListener('settings-retrieved', function(event){
        settings = event.detail;
    }, false)

    // Callback function called once gmail has finished loading
    gmail.observe.on("load", () => {
        const userEmail = gmail.get.user_email();

        // If page refreshed is in an email, locate the place to put the block button div and inject it with right text and colour
        if (gmail.get.current_page() == 'email' && settings.extensionActive){
            var divArray = document.getElementsByClassName('ha');
            if (divArray.length != 0){
                divArray[0].appendChild(blockButton);
            }
            if (settings.blockedList.includes(new gmail.dom.email(gmail.new.get.email_id()).from().email)){
                blockButton.innerHTML = "Unblock Sender";
                blockButton.style.background = "#ca2222";
            }
        }

        // Event Listener for block button onClick in gmail DOM
        blockButton.onclick = function(){
            if (blockButton.innerHTML == 'Block Sender'){
                blockButton.innerHTML = "Unblock Sender";
                blockButton.style.background = "#ca2222";
            } else {
                blockButton.innerHTML = "Block Sender";
                blockButton.style.background = "#1aa260";
            }
            // Dispatch current email address to parent script with scope to access chrome.storage API
            let address = new gmail.dom.email(gmail.new.get.email_id()).from().email;
            window.dispatchEvent(new CustomEvent("address-block-toggled", { detail:  address}));
        }        

        // Callback function called once an email has been opened taking the emailID as parameter
        gmail.observe.on("view_email", (emailID) => {
            // Only run the following block of code if the extension hasn't been turned off by the user
            if (settings.extensionActive){
                const emailData = gmail.new.get.email_data(emailID); // emailData is the data object of the opened email
                let phishing = new phishingModule.Phishing(); // Instantiate the phishing module

                // Get div to append risk modal and block button
                var divArray = document.getElementsByClassName('ha');
                if (divArray.length != 0){
                    divArray[0].appendChild(riskModal);
                    divArray[0].appendChild(blockButton);

                    if (settings.blockedList.includes(emailData.from.address)){
                        blockButton.innerHTML = "Unblock Sender";
                        blockButton.style.background = "#ca2222";
                    } else {
                        blockButton.innerHTML = "Block Sender";
                        blockButton.style.background = "#1aa260";
                    }
                }

                // Different way to get email data as sometimes the gmail.new.get.email_data() function has issues
                try{
                    var email = new gmail.dom.email(gmail.new.get.email_id());
                } catch {
                    console.log('email data errored')
                }

                // If email data has been found
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

                    // Set the new data on the emailData object to be retrieved by the popup script so that it can be displayed
                    emailData.riskRatings = phishing.riskRatings;
                    emailData.links = phishing.linkArray;
                    emailData.attachmentsRated = phishing.attachmentArray;
                    emailData.userEmail = userEmail;
                    emailData.overallRating = phishing.overallRating;

                    //Send event to let the extension know email has been opened and pass emailData object
                    window.dispatchEvent(new CustomEvent("emailOpened", { detail: emailData }));

                    // Set the risk colour and rating of the modal displayed in Gmail DOM
                    let riskColours = ['#1aa260','#9acd32', '#eed202', '#fa7f3d','#ca2222']
                    riskModal.innerHTML = "Email Risk: " + phishing.overallRating + "/5";
                    riskModal.style.background = riskColours[phishing.overallRating - 1]


                    // Warning popup if the user settings allows it
                    if (settings.warningActive) {
                        if (warningTimerElapsed(settings.warningTimeout, settings.timeOfLastWarning)){
                            if (!validRatings(settings.warningThreshold, emailData.riskRatings,emailData.links, emailData.attachmentsRated)){
                                let dateNow = new Date();
                                window.dispatchEvent(new CustomEvent("warning-given", { detail: dateNow.toJSON() })); // Set the time of last warning to local storage for anytime the script is reloaded
                                settings.timeOfLastWarning = dateNow; // Set time of last warning to now for the current content script
                                
                                // Inject popup modal, first callback is if continue is clicked, second callback is for cancel
                                gmail.tools.add_modal_window('Potential phishing attempt', 'Do you wish to continue?', () => {
                                    gmail.tools.remove_modal_window();
                                }, () => {
                                    window.history.back(); 
                                    gmail.tools.remove_modal_window();
                                });
                            }
                        }
                    }

                    // Warning popup if the sending address is in a specified list of blocked addresses
                    if (senderBlocked(emailData.from.address, settings.blockedList)){
                        // Inject popup modal, first callback is if continue is clicked, second callback is for cancel
                        gmail.tools.add_modal_window('The sender of this email is in a list of blocked addresses specified by you', 'Do you wish to continue?', () => {
                            gmail.tools.remove_modal_window();
                        }, () => {
                            window.history.back();
                            gmail.tools.remove_modal_window();
                        });
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
// If true is returned the warning timeout has elapsed else it hasn't
function warningTimerElapsed(warningTimeout, timeOfLastWarning){
    if (warningTimeout == 0 || timeOfLastWarning == 0){
        return true;
    } else {
        if (timeOfLastWarning != 0){
            timeOfLastWarning = new Date(timeOfLastWarning)
        }
        if (Math.floor(((new Date() - new Date(timeOfLastWarning)) / 60000)) > warningTimeout){
            return true;
        }
    }
    return false;
}

// Function to check if the current email sender address is in a list of blocked emails by the user
function senderBlocked(address, blockedList){
    if (blockedList.includes(address)){
        return true;
    } else {
        return false;
    }
}