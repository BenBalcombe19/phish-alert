<template>
    <div class="popup-wrapper" :class="{ 'no-email-settings-open': (settings.show && (!isData || !extensionActive))}">
        <div v-if="isData && extensionActive" class="title">
            <div class=title-text>Email Rating:</div>
            <rating v-if="isData" :riskValue="currentMailData.overallRating"></rating>
        </div>
        
        <h1 v-else class="title center">Sorry, no email found</h1>

        
        <span class="options-wrapper">
            <settings :show="settings.show" :title="settings.title" @close-popup="settings.show = false"></settings>
            
            <i class="menu-button fa-solid fa-gear" @click="settingsInfoMechanic('settings')"></i>

            <i class="menu-button fa-solid fa-circle-question" @click="settingsInfoMechanic('mainInfo')"></i>

            <label class="switch">
                <input type="checkbox" v-model="extensionActive">
                <div class="slider round">
                    <span class="text on">ON</span>
                    <span class="text off">OFF</span>
                </div>
            </label>
            
        </span>

        <info :show="mainInfo.show" :title="mainInfo.title" :data="mainInfo.data" :inTable="false" @close-popup="mainInfo.show = false"></info>
        
        <!-- EMAIL DETAILS TABLE -->
        <div v-if="isData && extensionActive" class="table-title">General Details:</div>
        <div v-if="isData && extensionActive" class="table">
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
        <div v-if="isData && extensionActive && currentMailData.links.length != 0" class="table-title">Link Details 
            <span @click="linkInfo.show = ! linkInfo.show" class="learn-button" :class="{ 'disabled-text': !extensionActive}">
                Learn More <i class="fa-solid fa-circle-info"></i>
            </span>
        </div>
        <info :show="linkInfo.show" :title="linkInfo.title" :data="linkInfo.data" :inTable="false" @close-popup="linkInfo.show = false"></info>

        <div v-if="isData && extensionActive && currentMailData.links.length != 0" class="table link-table">

            <div class="row header sticky" :class="{ disabled: !extensionActive}">
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
        <div v-if="isData && extensionActive && currentMailData.attachmentsRated.length != 0" class="table-title">Attachment(s) Details 
            <span @click="attachmentInfo.show = ! attachmentInfo.show" class="learn-button" :class="{ 'disabled-text': !extensionActive}">
                Learn More <i class="fa-solid fa-circle-info"></i>
            </span>
        </div>
        <info :show="attachmentInfo.show" :title="attachmentInfo.title" :data="attachmentInfo.data" :inTable="false" @close-popup="attachmentInfo.show = false"></info>

        <div v-if="isData && extensionActive && currentMailData.attachmentsRated.length != 0" class="table link-table">

            <div class="row header sticky" :class="{ disabled: !extensionActive}">
                <div class="cell">File Name</div>
                <!-- <div class="cell value">Type</div> -->
                <div class="cell">Size</div>
                <div class="cell">Risk Rating</div>
            </div>

            <div class="row" v-for="attachment in currentMailData.attachmentsRated" :key="attachment.attachment_id">
                <div class="cell"><abbr :title="attachment.fileName" v-html="textHighlight(attachment.fileName, attachment.fileName.split('.').pop())"></abbr></div>
                <!-- <div class="cell value"><abbr :title="attachment.type">{{attachment.type}}</abbr></div> -->
                <div class="cell">{{attachment.size}}</div>
                <!-- <div class="cell">{{Math.ceil(attachment.size / 1000) + 'KB'}}</div> -->
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
const parser = require('tld-extract');


export default {
    data() {
        return {
            extensionActive: false,
            list: [],
            currentMailData: {},
            isData: false,
            mainInfo:{
                show: false,
                title: 'General Information',
                data:['The purpose of this extension is to educate and spread awareness on the identification of phishing emails and where possible, provide warning to users of potential phishing attempts.',
                'Phishing is a social engineering technique used by cyber criminals to steal personal and usually valuable information from victims by pretending to be a trusted organisation.']
            },
            settings:{
                show: false,
                title: 'Settings',
            },
            address:{
                show: false,
                title: 'Useful Tips',
                data: ['Make sure you trust this email address before progressing any further', 'If this is from an organisation or business, make sure the domain is spelled correctly as often attackers will try and trick users e.g no-reply@goggle.com',
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
                data:['Link Text - This is the text of the link displayed to the user e.g "Click Here"','Link URL - This is the actual URL that you will be directed to when you click the link text e.g "https://google.com"',
                    'Domain Match - This refers to whether the domain of the Link URL (Highlighted in Blue) matches the domain of the sender address e.g no-reply@google.com, the domain is google.com']
            },
            attachmentInfo:{
                show: false,
                title: 'Attachment Information',
                data:['Unfortunately, there are many attachments file extensions that could potentially run code on your computer and thus install malware. e.g .exe, .src, .doc, .xls... ',
                'Often, dangerous file extensions are concealed in .zip files','In addition, cybercriminals like to hide malicious links in PDF']
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
        settings
    },
    computed: {
        // fromAddressText(){
        //     return this.isData ? this.currentMailData.from.address : 'No Information Found';
        // },
        // fromNameText(){
        //     return this.isData ? this.currentMailData.from.name : 'No Information Found'; 
        // },
        // subjectText(){
        //     return this.isData ? this.currentMailData.subject : 'No Information Found';
        // },
        fromAddressRating(){
            return this.isData ? this.currentMailData.riskRatings.address : 'No Information Found';
        },
        fromNameRating(){
            return this.isData ? this.currentMailData.riskRatings.name : 'No Information Found'; 
        },
        subjectRating(){
            return this.isData ? this.currentMailData.riskRatings.subject : 'No Information Found';
        },
        infoData(){
            return {
                
            }
        }
    },
    watch : {
        currentMailData: {
            handler(newVal){
                console.log('WATCHER: currentMailData changed', newVal)
                if (Object.keys(newVal).length != 0){
                    this.isData = true;
                    console.log('object is not empty')
                } else {
                    this.isData = false;
                    console.log('object is empty')
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
        getData(){
            chrome.storage.local.get(['emailData','extensionActive'], (data) => {
                this.currentMailData = data.emailData;
                this.extensionActive = data.extensionActive;
            });    
        },
        textHighlight(mainText,highlightText){
            return mainText.replace(highlightText, '<span class="text-highlight">' + highlightText + '</span>')
        },
        settingsInfoMechanic(element){
            if (element == 'settings'){
                this.settings.show = !this.settings.show;
                this.mainInfo.show = false;
            } else if (element == 'mainInfo'){
                this.mainInfo.show = !this.mainInfo.show;
                this.settings.show = false;
            }
        }
    },
    
    mounted(){
        chrome.runtime.sendMessage({sender:'popup',type: 'mounted'});
        this.getData();
        chrome.runtime.onMessage.addListener((msg, sender, response) => {
            if (msg.sender === 'background-script'){
                if (msg.type === 'data-update'){
                    this.getData();
                }
            }
        })

        chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
            let url = tabs[0].url;
            try {
                let domain = parser.parse_host(url, {allowUnknownTLD : true}).domain;
                if (!domain.includes('google.com/mail')){
                    setTimeout(() => {
                        this.isData = false
                        this.currentMailData = {}
                    },300)
                }
                } catch{
                    console.log('Tab URL failed')
                    return false;
                }
        });
    },
}
</script>