<template>
    <div class="popup-wrapper">
        <h1 class="title">Phish Detector</h1>

        <label class="switch">
            <input type="checkbox" v-model="active">
            <span class="slider round"></span>
        </label>

        <div class="table">
            <div class="row header" :class="{ disabled: !active}">
                <div class="cell">Identifier</div>
                <div class="cell value">Value</div>
                <div class="cell">Risk Rating</div>
                <div class="cell">Info</div>
            </div>

            <div class="row">
                <div class="cell">Sender Address</div>
                <div class="cell value">{{fromAddressText}}</div>
                <div class="cell"><rating :riskValue="addressScore"></rating></div>
                <div class="cell">
                    <span @click="address.show = ! address.show" class="learn-button" :class="{ 'disabled-text': !active}">Learn More <i class="fa-solid fa-circle-info"></i></span>
                </div>
            </div>

            <info :show="address.show" :data="address.data"></info>
            
            <div class="row">
                <div class="cell">Sender Name</div>
                <div class="cell value">{{fromNameText}}</div>
                <div class="cell"><rating :riskValue="nameScore"></rating></div>
                <div class="cell">
                    <span @mouseenter="name.show = true" @mouseleave="name.show = false" class="learn-button" :class="{ 'disabled-text': !active}">Learn More <i class="fa-solid fa-circle-info"></i></span>
                </div>
            </div>

            <info :show="name.show" :data="name.data"></info>

            <div class="row">
                <div class="cell">Subject</div>
                <div class="cell value">{{subjectText}}</div>
                <div class="cell"><rating :riskValue="subjectScore"></rating></div>
                <div class="cell">
                    <span @click="subject.show = ! subject.show" class="learn-button" :class="{ 'disabled-text': !active}">Learn More <i class="fa-solid fa-circle-info"></i></span>
                </div>
            </div>

            <info :show="subject.show" :data="subject.data"></info>

        </div>

        
    </div>
</template>
<script>

import rating from './Rating.vue';
import info from './Info.vue';

export default {
    data() {
        return {
            active: false,
            list: [],
            currentMailData: {},
            isData: false,
            address:{
                show: false,
                data: ['hello', 'my', 'world']
            },
            name:{
                show: false,
                data: ['world']
            },
            subject:{
                show: false,
                data: ['Does the subject convey urgency using language such as "important", "immediately" "urgent", etc. This is a common tactic among attackers to provoke an emotional reaction.',
                 'Does the subject contain any unusual characters ie "$","%","@",etc. This is also a cause for concern.']
            },
            // icons: {
            //     active: 'images/icon-48x48.png',
            //     inactive: 'images/icon-48x48-off.png'
            // }
        }
    },
    components: {
        rating,
        info
    },
    computed: {
        fromAddressText(){
            return this.isData ? this.currentMailData.from.address : 'No Information Found';
        },
        fromNameText(){
            return this.isData ? this.currentMailData.from.name : 'No Information Found'; 
        },
        subjectText(){
            return this.isData ? this.currentMailData.subject : 'No Information Found';
        },
        addressScore(){
            return this.isData ? this.currentMailData.scores.address : 'No Information Found';
        },
        nameScore(){
            return this.isData ? this.currentMailData.scores.name : 'No Information Found'; 
        },
        subjectScore(){
            return this.isData ? this.currentMailData.scores.subject : 'No Information Found';
        },
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
        active: function(newVal){
            chrome.storage.local.set({
                active: this.active
            }, () => {});
        }
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
            chrome.storage.local.get(['emailData','active'], (data) => {
                this.currentMailData = data.emailData;
                this.active = data.active;
            });    
        },
        showStoredData(){
            chrome.storage.local.get(['emailData'], (data) => {
                console.log('EMAILDATA FROM STORAGE',data.emailData)
            });
        },
    },
    
    beforeMount() {
        chrome.runtime.sendMessage({sender:'popup',type: 'before-mounted'});
    },
    mounted(){
        chrome.runtime.sendMessage({sender:'popup',type: 'mounted'});
        this.getData();
        chrome.runtime.onMessage.addListener((msg, sender, response) => {
            console.log('message received (from popup)')
            if (msg.sender === 'background-script'){
                if (msg.type === 'data-update'){
                    this.getData();
                }
            }
        })
    },
}
</script>