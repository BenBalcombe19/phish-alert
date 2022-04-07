<template>
    <div class="popup-wrapper">
        <h1 v-if="isData" class="title">Current Email</h1>
        
        <h1 v-else class="title center">No Email Found</h1>

        <span class="options-wrapper">
            <settings :show="settings.show" :title="settings.title" @close-popup="settings.show = false"></settings>
            
            <i class="settings-cog-main fa-solid fa-gear" @click="settings.show = !settings.show"></i>
            
            <label class="switch">
                <input type="checkbox" v-model="extensionActive">
                <span class="slider round"></span>
            </label>
            
        </span>
        



        <!-- EMAIL DETAILS TABLE -->
        <div v-if="isData" class="table-title">General Details:</div>
        <div v-if="isData" class="table">
            <div class="row header" :class="{ disabled: !extensionActive}">
                <div class="cell">Details</div>
                <div class="cell value">Content</div>
                <div class="cell">Risk Rating</div>
                <div class="cell">Info</div>
            </div>

            <div class="row">
                <div class="cell">Sender Address</div>
                <div class="cell value"><abbr :title="currentMailData.from.address">{{currentMailData.from.address}}</abbr></div>
                <div class="cell"><rating :riskValue="fromAddressScore"></rating></div>
                <div class="cell">
                    <span @click="address.show = ! address.show" class="learn-button" :class="{ 'disabled-text': !extensionActive}">
                        Learn More 
                        <i v-if="!address.show" class="fa-solid fa-circle-info"></i>
                        <i v-else class="fa-solid fa-chevron-up"></i>
                    </span>
                </div>
            </div>

            <info :show="address.show" :title="address.title" :data="address.data" :inTable="true" @close-popup="address.show = false"></info>
            
            <div class="row">
                <div class="cell">Sender Name</div>
                <div class="cell value"><abbr :title="currentMailData.from.name">{{currentMailData.from.name}}</abbr></div>
                <div class="cell"><rating :riskValue="fromNameScore"></rating></div>
                <div class="cell">
                    <span @click="name.show = !name.show" class="learn-button" :class="{ 'disabled-text': !extensionActive}">Learn More <i class="fa-solid fa-circle-info"></i></span>
                </div>
            </div>

            <info :show="name.show" :title="name.title" :data="name.data" :inTable="true" @close-popup="name.show = false"></info>

            <div class="row">
                <div class="cell">Subject</div>
                <div class="cell value"><abbr :title="currentMailData.subject">{{currentMailData.subject}}</abbr></div>
                <div class="cell"><rating :riskValue="subjectScore"></rating></div>
                <div class="cell">
                    <span @click="subject.show = ! subject.show" class="learn-button" :class="{ 'disabled-text': !extensionActive}">Learn More <i class="fa-solid fa-circle-info"></i></span>
                </div>
            </div>

            <info :show="subject.show" :title="subject.title" :data="subject.data" :inTable="true" @close-popup="subject.show = false"></info>

        </div>

        <!-- LINKS TABLE -->
        <div v-if="isData && currentMailData.links.length != 0" class="table-title">Link Details 
            <span @click="linkInfo.show = ! linkInfo.show" class="learn-button" :class="{ 'disabled-text': !extensionActive}">
                Learn More <i class="fa-solid fa-circle-info"></i>
            </span>
        </div>
        <info :show="linkInfo.show" :title="linkInfo.title" :data="linkInfo.data" :inTable="false" @close-popup="linkInfo.show = false"></info>

        <div v-if="isData && currentMailData.links.length != 0" class="table link-table">

            <div class="row header sticky" :class="{ disabled: !extensionActive}">
                <div class="cell">Link Text</div>
                <div class="cell value">Link URL</div>
                <div class="cell">Domain Match</div>
                <div class="cell">Risk Rating</div>
            </div>

            <div class="row" v-for="link in currentMailData.links" :key="link.id">
                <div class="cell"><abbr :title="link.innerText">{{link.innerText}}</abbr></div>
                <div class="cell value"><abbr :title="link.href" v-html="domainHighlightURL(link.href,link.hostname)"></abbr></div>
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
        <div v-if="isData && currentMailData.attachments.length != 0" class="table-title">Attachment(s) Details 
            <span @click="attachmentInfo.show = ! attachmentInfo.show" class="learn-button" :class="{ 'disabled-text': !extensionActive}">
                Learn More <i class="fa-solid fa-circle-info"></i>
            </span>
        </div>
        <info :show="attachmentInfo.show" :title="attachmentInfo.title" :data="attachmentInfo.data" :inTable="false" @close-popup="attachmentInfo.show = false"></info>

        <div v-if="isData && currentMailData.attachments.length != 0" class="table link-table">

            <div class="row header sticky" :class="{ disabled: !extensionActive}">
                <div class="cell">File Name</div>
                <div class="cell value">Type</div>
                <div class="cell">Size</div>
                <!-- <div class="cell">Risk Rating</div> -->
            </div>

            <div class="row" v-for="attachment in currentMailData.attachments" :key="attachment.attachment_id">
                <div class="cell"><abbr :title="attachment.name">{{attachment.name}}</abbr></div>
                <div class="cell value"><abbr :title="attachment.type">{{attachment.type}}</abbr></div>
                <div class="cell">{{attachment.size}}</div>
                <!-- <div class="cell">
                    <rating :riskValue="attachment.riskRating"></rating>
                </div> -->
            </div>
        </div>

        
    </div>
</template>
<script>

import rating from './Rating.vue';
import info from './Info.vue';
import settings from './Settings.vue';

export default {
    data() {
        return {
            extensionActive: false,
            list: [],
            currentMailData: {},
            isData: false,
            settings:{
                show: false,
                title: 'Settings',
            },
            address:{
                show: false,
                title: 'Useful Tips',
                data: ['Make sure you trust this email address before progressing any further', 'If this is from an organisation or business, make sure the domain is spelled correctly as often attackers will try and trick users e.g no-reply@goggle.com']
            },
            name:{
                show: false,
                title: 'Useful Tips',
                data: ['Does the name contain any unusual characters ie  $ , % , @ , * , etc? This is also a cause for concern.']
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
                data:['Link Text - This is the text of the link displayed to the user e.g "Click Here"','Link URL - This is the actual URL that you will be directed to when you click the link text e.g "https://google.com"',
                    'Domain Match - This refers to whether the domain of the Link URL (Highlighted in Blue) matches the domain of the sender address e.g no-reply@google.com, the domain is google.com']
            }
            // icons: {
            //     active: 'images/icon-48x48.png',
            //     inactive: 'images/icon-48x48-off.png'
            // }
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
        fromAddressScore(){
            return this.isData ? this.currentMailData.scores.address : 'No Information Found';
        },
        fromNameScore(){
            return this.isData ? this.currentMailData.scores.name : 'No Information Found'; 
        },
        subjectScore(){
            return this.isData ? this.currentMailData.scores.subject : 'No Information Found';
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
                extensionActive: this.extensionActive
            }, () => {});
        },
    },
    methods: {
        setActive(active) {
            this.active = active;
            chrome.storage.local.set({
                toggleSitesActive: active
            }, () => {});
            // chrome.browserAction.setIcon({
            //     path: this.icons[active ? 'active' : 'inactive']
            // });
        },
        getData(){
            chrome.storage.local.get(['emailData','extensionActive'], (data) => {
                this.currentMailData = data.emailData;
                this.extensionActive = data.extensionActive;
            });    
        },
        domainHighlightURL(url,domain){
            return url.replace(domain, '<span class="domain-highlight">' + domain + '</span>')
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
    },
}
</script>