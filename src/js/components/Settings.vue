<template>
    <div class="settings-container" :class="{ 'expanded': show}">
        <div class="settings-title">{{title}}<i class="settings-cog-small fa-solid fa-gear"></i></div>

        <div class="settings-list">
            <div class="setting">
                <span class="setting-title">Actively Warn Me</span>

                <label class="switch">
                    <input type="checkbox" v-model="warningActive">
                    <span class="slider round"></span>
                </label>
                <!-- <input class="setting-value" type="checkbox" v-model="warningActive"> -->
            </div>
            <div v-if="warningActive" class="setting">
                <span class="setting-title">Warning Threshold</span>
                <select name="risk-threshold" id="risk-threshold" v-model="warningThreshold">
                    <option :value="1">Risk Rating: 1</option>
                    <option :value="2">Risk Rating: 2</option>
                    <option :value="3">Risk Rating: 3</option>
                    <option :value="4">Risk Rating: 4</option>
                    <option :value="5">Risk Rating: 5</option>
                </select>
            </div>
            <div v-if="warningActive" class="setting">
                <span class="setting-title">Warning Timeout</span>
                <select name="warning-timeout" id="warning-timeout" v-model="warningTimeout">
                    <option :value="0">None</option>
                    <option :value="5">5 minutes</option>
                    <option :value="10">10 minutes</option>
                    <option :value="30">30 minutes</option>
                    <option :value="60">1 hour</option>
                </select>
            </div>
        </div>
        
        <i class="settings-close fa-solid fa-xmark" @click="close()"></i>
    </div>
</template>

<script>
export default {
    props: {
        show: false,
        data: [],
        inTable: true,
        title: '',
    },

    data() {
        return {
            warningActive: false,
            warningThreshold: 5,
            warningTimeout: false
        }
    },

    watch : {
        warningActive: function(newVal){
            chrome.storage.local.set({
                warningActive: this.warningActive
            }, () => {
                console.log('setting warningActive', newVal)
            });
        },
        warningThreshold: function(newVal){
            chrome.storage.local.set({
                warningThreshold: this.warningThreshold
            }, () => {
                console.log('setting warningThreshold', newVal)
            });
        },
        warningTimeout: function(newVal){
            chrome.storage.local.set({
                warningTimeout: this.warningTimeout
            }, () => {
                console.log('setting warningTimeout', newVal)
            });
        },
    },

    computed: {

    },
    
    methods: {
        close(){
            this.$emit('close-popup')
        }
    },
    mounted(){
        chrome.storage.local.get(['warningActive','warningThreshold','warningTimeout'], (data) => {
            this.warningActive = data.warningActive;
            this.warningThreshold = data.warningThreshold;
            this.warningTimeout = data.warningTimeout;
        }); 
    },

}
</script>