<template>
    <div class="settings-container" :class="{ 'expanded': show}">
        <div class="settings-title">{{title}}<i class="settings-cog-small fa-solid fa-gear"></i></div>

        <!-- List of settings -->
        <div class="settings-list">
            <!-- Popup warning settings -->
            <div class="setting">
                <span class="setting-title">Popup Warnings</span>
                <label class="switch">
                    <input type="checkbox" v-model="warningActive">
                    <div class="slider round">
                        <span class="text on">ON</span>
                        <span class="text off">OFF</span>
                    </div>
                </label>
            </div>
            
            <!-- If popup warning activated then show the popup settings -->
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
        
        <!-- Chevron to close the settings dropdown -->
        <i class="settings-close fa-solid fa-chevron-right" @click="close()"></i>
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

    // Watcher functions to watch each data property and update the chrome.storage API when necessary
    watch : {
        warningActive: function(newVal){
            chrome.storage.local.set({
                warningActive: this.warningActive
            }, () => {
            });
        },
        warningThreshold: function(newVal){
            chrome.storage.local.set({
                warningThreshold: this.warningThreshold
            }, () => {
            });
        },
        warningTimeout: function(newVal){
            chrome.storage.local.set({
                warningTimeout: this.warningTimeout
            }, () => {
            });
        },
    },
    methods: {
        // Emit close-popup event for Popup.vue to handle
        close(){
            this.$emit('close-popup')
        }
    },
    mounted(){
        // Get the warning settings data from the chrome.storage API
        chrome.storage.local.get(['warningActive','warningThreshold','warningTimeout'], (data) => {
            this.warningActive = data.warningActive;
            this.warningThreshold = data.warningThreshold;
            this.warningTimeout = data.warningTimeout;
        }); 
    },
}
</script>