<template>
    <div class="popup-wrapper">
        <h1 class="title">Phish Detector</h1>

        <label class="switch">
            <input type="checkbox" v-model="active">
            <span class="slider round"></span>
        </label>

        <div class="table" :class="{ disabled: !active}">
            <div class="row header">
                <div class="cell">Identifier</div>
                <div class="cell">Value</div>
                <div class="cell">Risk Rating</div>
                <div class="cell">Info</div>
            </div>

            
            <div class="row">
                <div class="cell">Sender Address</div>
                <div class="cell">{{fromAddress}}</div>
                <div class="cell"><rating></rating></div>
                <div class="cell">{{fromAddress}}</div>
            </div>
            <div class="row">
                <div class="cell">Sender Name</div>
                <div class="cell">{{fromName}}</div>
                <div class="cell">{{fromName}}</div>
                <div class="cell">{{fromName}}</div>
            </div>
            <div class="row">
                <div class="cell">Subject</div>
                <div class="cell">{{subject}}</div>
                <div class="cell">{{subject}}</div>
                <div class="cell">{{subject}}</div>
            </div>
        </div>
        <!-- <button @click="showStoredData" :class="{ disabled: !active}">Get Stored Data</button>
        <button @click="getAddress" :class="{ disabled: !active}">Get Address</button>
        <button @click="getName" :class="{ disabled: !active}">Get Name</button>
        <button @click="getSubject" :class="{ disabled: !active}">Get Subject</button> -->
    </div>
</template>
<script>
import rating from './Rating.vue';

export default {
    data() {
        return {
            active: false,
            list: [],
            currentMailData: {},
            isData: false,
            // icons: {
            //     active: 'images/icon-48x48.png',
            //     inactive: 'images/icon-48x48-off.png'
            // }
        }
    },
    components: {
        rating
    },
    computed: {
        fromAddress(){
            return this.isData ? this.currentMailData.from.address : 'No Information Found';
        },
        fromName(){
            return this.isData ? this.currentMailData.from.name : 'No Information Found'; 
        },
        subject(){
            return this.isData ? this.currentMailData.subject : 'No Information Found';
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
        getAddress(){
            console.log('Address:', this.fromAddress)
        },
        getName(){
            console.log('Name:', this.fromName)
        },
        getSubject(){
            console.log('Subject:', this.subject)
        }
    },
    
    beforeMount() {
        chrome.runtime.sendMessage({sender:'popup',type: 'before-mounted'});
    },
    created(){
        chrome.runtime.sendMessage({sender:'popup',type: 'created'});
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
    beforeDestroy(){
        chrome.runtime.sendMessage({sender:'popup',type: 'before-destroyed'});
    },
    destroyed(){
        chrome.runtime.sendMessage({sender:'popup',type: 'destroyed'});
    }
}
</script>