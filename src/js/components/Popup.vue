<template>
    <div class="popup-wrapper" :class="{ 'no-email-settings-open': (settings.show && (!isData || !extensionActive || !isGmail))}">
        <!-- If gmail is not detected then give help message -->
        <div v-if="!isGmail" class="title-no-email">Open Gmail to use this extension :)</div>

        <!-- Else if extension is active and data is loaded, display email rating -->
        <div v-else-if="isData && extensionActive" class="title-email" @mouseenter="toggleDropdown('ratingInfo')" @mouseleave="toggleDropdown('ratingInfo')">
            <div class=title-email-text>Email Rating:</div>
            <rating v-if="isData" :riskValue="currentMailData.overallRating"></rating>
        </div>
        
        <!-- Else display no email found message -->
        <div v-else class="title-no-email">Sorry, no email found</div>
        
        <!-- top right settings/options panel -->
        <span class="options-wrapper">
            <settings :show="settings.show" :title="settings.title" @close-popup="settings.show = false"></settings>
            
            <i title="Settings" class="menu-button fa-solid fa-gear" @click="toggleDropdown('settings')"></i>

            <i title="Block emails from this sender" class="menu-button fa-solid fa-user-shield" :style="{'color':blockedColor}" @click="toggleDropdown('blockedList')"></i>
            
            <i title="Extension Information" class="menu-button fa-solid fa-circle-info" @click="toggleDropdown('mainInfo')"></i>
            
            
            <label class="switch">
                <input type="checkbox" v-model="extensionActive">
                <div class="slider round">
                    <span class="text on">ON</span>
                    <span class="text off">OFF</span>
                </div>
            </label>
            
        </span>

        <!-- MAIN INFO dropdown -->
        <info :show="mainInfo.show" :title="mainInfo.title" :data="mainInfo.data" :inTable="false" @close-popup="toggleDropdown('mainInfo')"></info>
        <!-- RATING INFO dropdown -->
        <info :show="ratingInfo.show" :title="ratingInfo.title" :data="ratingInfo.data" :inTable="false" @close-popup="toggleDropdown('ratingInfo')"></info>
        <!-- BLOCKED LIST dropdown -->
        <block v-if="showEmailDetails" :title="blockedList.title" :show="blockedList.show" :address="currentMailData.from.address" @new-blocked-value="toggleBlocked" @close-dropdown="toggleDropdown('blockedList')"></block>
       
        <!-- EMAIL DETAILS TABLE -->
        <div v-if="showEmailDetails" class="table-title">General Details:</div>
        <div v-if="showEmailDetails" class="table">
            <div class="row header" :class="{ disabled: !extensionActive}">
                <div class="cell">Details</div>
                <div class="cell value">Content</div>
                <div class="cell">Risk Rating</div>
                <div class="cell">Info</div>
            </div>

            <div class="row">
                <div class="cell">Sender Address</div>
                <div class="cell value"><abbr :title="currentMailData.from.address" v-html="textHighlight(currentMailData.from.address, currentMailData.from.address.split('@').pop())">{{currentMailData.from.address}}</abbr></div>
                <div class="cell"><rating :riskValue="fromAddressRating"></rating></div>
                <div class="cell">
                    <span @click="address.show = ! address.show" class="learn-button" :class="{ 'disabled-text': !extensionActive}">Learn More <i class="fa-solid fa-circle-info"></i></span>
                </div>
            </div>

            <info :show="address.show" :title="address.title" :data="address.data" :inTable="true" @close-popup="address.show = false"></info>
            
            <div class="row">
                <div class="cell">Sender Name</div>
                <div class="cell value"><abbr :title="currentMailData.from.name">{{currentMailData.from.name}}</abbr></div>
                <div class="cell"><rating :riskValue="fromNameRating"></rating></div>
                <div class="cell">
                    <span @click="name.show = !name.show" class="learn-button" :class="{ 'disabled-text': !extensionActive}">Learn More <i class="fa-solid fa-circle-info"></i></span>
                </div>
            </div>

            <info :show="name.show" :title="name.title" :data="name.data" :inTable="true" @close-popup="name.show = false"></info>

            <div class="row">
                <div class="cell">Subject</div>
                <div class="cell value"><abbr :title="currentMailData.subject">{{currentMailData.subject}}</abbr></div>
                <div class="cell"><rating :riskValue="subjectRating"></rating></div>
                <div class="cell">
                    <span @click="subject.show = ! subject.show" class="learn-button" :class="{ 'disabled-text': !extensionActive}">Learn More <i class="fa-solid fa-circle-info"></i></span>
                </div>
            </div>

            <info :show="subject.show" :title="subject.title" :data="subject.data" :inTable="true" @close-popup="subject.show = false"></info>

        </div>

        <!-- LINKS TABLE -->
        <div v-if="showLinks" class="table-title">Link Details 
            <span @click="linkInfo.show = ! linkInfo.show" class="learn-button" :class="{ 'disabled-text': !extensionActive}">
                Learn More <i class="fa-solid fa-circle-info"></i>
            </span>
        </div>
        <info :show="linkInfo.show" :title="linkInfo.title" :data="linkInfo.data" :inTable="false" @close-popup="linkInfo.show = false"></info>

        <div v-if="showLinks" class="table dynamic-table" @click="linkInfo.show = ! linkInfo.show">

            <div class="row header" :class="{ disabled: !extensionActive}">
                <div class="cell">Link Text</div>
                <div class="cell value">Link URL</div>
                <div class="cell">Domain Match</div>
                <div class="cell">Risk Rating</div>
            </div>

            <div class="row" v-for="link in currentMailData.links" :key="link.id">
                <div class="cell"><abbr :title="link.innerText">{{link.innerText}}</abbr></div>
                <div class="cell value"><abbr :title="link.href" v-html="textHighlight(link.href,link.hostname)"></abbr></div>
                <div class="cell tick-cross">
                    <i v-if="link.senderDomainDisparity" class="fa-solid fa-circle-xmark"></i>
                    <i v-else class="fa-solid fa-circle-check"></i>
                </div>
                <div class="cell">
                    <rating :riskValue="link.riskRating"></rating>
                </div>
            </div>
        </div>

        <!-- ATTACHMENTS TABLE -->
        <div v-if="showAttachments" class="table-title">Attachment(s) Details 
            <span @click="attachmentInfo.show = ! attachmentInfo.show" class="learn-button" :class="{ 'disabled-text': !extensionActive}">
                Learn More <i class="fa-solid fa-circle-info"></i>
            </span>
        </div>

        <info :show="attachmentInfo.show" :title="attachmentInfo.title" :data="attachmentInfo.data" :inTable="false" @close-popup="attachmentInfo.show = false"></info>

        <div v-if="showAttachments" class="table dynamic-table" @click="attachmentInfo.show = ! attachmentInfo.show">

            <div class="row header" :class="{ disabled: !extensionActive}">
                <div class="cell value">File Name</div>
                <div class="cell">Size</div>
                <div class="cell">Risk Rating</div>
            </div>

            <div class="row" v-for="attachment in currentMailData.attachmentsRated" :key="attachment.attachment_id">
                <div class="cell value"><abbr :title="attachment.fileName" v-html="textHighlight(attachment.fileName, attachment.fileName.split('.').pop())"></abbr></div>
                <div class="cell">{{attachment.size}}</div>
                <div class="cell">
                    <rating :riskValue="attachment.riskRating"></rating>
                </div>
            </div>
        </div>

        
    </div>
</template>
<script>

import rating from './Rating.vue';
import info from './Info.vue';
import settings from './Settings.vue';
import block from './Block.vue';
const parser = require('tld-extract');


export default {
    data() {
        return {
            extensionActive: false,
            currentMailData: {},
            isData: false,
            isGmail: false,
            loaded: false,
            blocked: false,
            mainInfo:{
                show: false,
                title: 'General Information',
                data:['The purpose of this extension is to educate and spread awareness on the identification of phishing emails and where possible, provide warning to users of potential phishing attempts.',
                'Phishing is a social engineering technique used by cyber criminals to steal personal and usually valuable information from victims by pretending to be a trusted organisation.']
            },
            ratingInfo:{
                show: false,
                title: 'Rating Information',
                data:['The rating\s given in this extension are in the range of 1 to 5.', '1 signals completely safe, nothing to worry about.', '5 signals take extreme caution and be sure of the emails credibility before acting on it.']
            },
            settings:{
                show: false,
                title: 'Settings',
            },
            blockedList:{
                show: false,
                title: 'Blocked Addresses',
            },
            address:{
                show: false,
                title: 'Useful Tips',
                data: ['Make sure you trust this email address before progressing any further.', 'If this is from an organisation or business, make sure the domain is spelled correctly as often attackers will try and trick users e.g no-reply@goggle.com',
                'An email from a nonsensical address (for example, 535vukasimeru@gmail.com) is almost certainly something you shouldn\'t open.']
            },
            name:{
                show: false,
                title: 'Useful Tips',
                data: ['Does the name contain any unusual characters ie  $ , % , @ , * , etc? This is a cause for concern.']
            },
            subject:{
                show: false,
                title: 'Useful Tips',
                data: ['Does the subject convey urgency using language such as "important", "immediately" "urgent", etc? This is a common tactic among attackers to provoke an emotional reaction.',
                    'Does the subject contain any unusual characters ie   $  ,  %  ,  @  ,  *  , etc? This is also a cause for concern.','Does the subject contain your email username e.g john.smith23, as this is a tactic used to gain familiarity with users.']
            },
            linkInfo:{
                show: false,
                title: 'Link Information',
                data:['Link Text - This is the text of the link displayed to the user e.g "Click Here".','Link URL - This is the actual URL that you will be directed to when you click the link text e.g "https://google.com".',
                    'Domain Match - This refers to whether the domain of the Link URL (Highlighted in Blue) matches the domain of the sender address e.g no-reply@google.com, the domain is google.com.',
                    'Make sure you double check the spelling of the domain of the url is correct. "The mind sees what it wants to see" and attackers will try and fool you with slight tweaks to legitimate domains.']
            },
            attachmentInfo:{
                show: false,
                title: 'Attachment Information',
                data:['Unfortunately, there are many attachments file extensions that could potentially run code on your computer and thus install malware. e.g .exe, .src, .doc, .xls... ',
                'Often, dangerous file extensions are concealed in .zip files','In addition, cybercriminals like to hide malicious links in PDF or .doc files.']
            },
            icons: {
                active: 'icons/icon-48x48.png',
                inactive: 'icons/icon-48x48-off.png'
            }
        }
    },
    components: {
        rating,
        info,
        settings,
        block
    },
    computed: {
        // Return risk rating for sender address if data is loaded
        fromAddressRating(){
            return this.isData ? this.currentMailData.riskRatings.address : 'No Information Found';
        },
        // Return risk rating for sender name if data is loaded
        fromNameRating(){
            return this.isData ? this.currentMailData.riskRatings.name : 'No Information Found'; 
        },
        // Return risk rating for email subject if data is loaded
        subjectRating(){
            return this.isData ? this.currentMailData.riskRatings.subject : 'No Information Found';
        },
        // Show email details if email data is loaded, the extension is activea and gmail is detected
        showEmailDetails(){
            return this.isData && this.extensionActive && this.isGmail;
        },
        // Show links table if email data is loaded, the extension is active, gmail is detected and there are links in the email
        showLinks(){
            return this.isData && this.extensionActive && this.isGmail && this.currentMailData.links.length != 0;
        },
        // Show attachments table if email data is loaded, the extension is active, gmail is detected and there are attachments in the email
        showAttachments(){
            return this.isData && this.extensionActive && this.isGmail && this.currentMailData.attachmentsRated.length != 0;
        },
        blockedColor(){
            if (this.extensionActive && this.isGmail){
                if (this.blocked){
                    return '#ca2222';
                } else {
                    return '#1aa260';
                }
            } else {
                return '#888'
            }
        }
    },
    watch : {
        currentMailData: {
            handler(newVal){
                if (Object.keys(newVal).length != 0){
                    this.isData = true;
                } else {
                    this.isData = false;
                }
            },
            deep: true
        },
        extensionActive: function(newVal){
            chrome.storage.local.set({
                extensionActive: newVal
            }, () => {});
            chrome.action.setIcon({
                path: this.icons[newVal ? 'active' : 'inactive']
            });
        },
    },
    methods: {
        //Function to get the required data from the chrome.storage API
        getData(){
            chrome.storage.local.get(['emailData','extensionActive'], (data) => {
                this.currentMailData = data.emailData;
                this.extensionActive = data.extensionActive;
            });    
        },
        // Function to highlight the parts of a string used for highlighting the domain in a URL
        textHighlight(mainText,highlightText){
            return mainText.replace(highlightText, '<span class="text-highlight">' + highlightText + '</span>')
        },

        // Function to toggle the dropdown at the top of the popup so user isn't overwhelmed with drop downs
        // Closes all other dropwowns when another is clicked
        toggleDropdown(toggleItem){
            let elements = ['settings','mainInfo','ratingInfo','blockedList'];

            elements.forEach(element => {
                if (element == toggleItem){
                    this[element].show = !this[element].show;
                } else {
                    this[element].show = false;
                }
            })
        },
        // Function to toggle whether the sender address is blocked and takes value from child component Block.vue
        // when it emits a change in value
        toggleBlocked(value){
            this.blocked = value;
        }
    },
    
    mounted(){
        this.getData();

        // Setup listener to watch values stored in chrome.storage API and act accordingly
        chrome.storage.onChanged.addListener(function (changes) {
            for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
                if (key == 'emailData'){
                    this.getData();
                }
            }
        });

        // Check whether the current tab is gmail to determine what information should be displayed in popup
        chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
            let url = tabs[0].url;
            try {
                let domain = parser.parse_host(url, {allowUnknownTLD : true}).domain;
                if (!domain.includes('google.com/mail')){
                    this.isGmail = false
                } else {
                    this.isGmail = true;
                }
            } catch{
                console.log('Tab URL failed')
                return false;
            }
        });
    },
}
</script>