<template>
    <div class="block-container" :class="{ 'expanded': show}">
        <!-- Title and close dropdown icon -->
        <div class="block-title">{{title}} <i class="fa-solid fa-ban"></i></div>
        <i class="block-close fa-solid fa-xmark" @click="close()"></i>

        <div class="divider"></div>

        <!-- List of blocked addresses if blockedList is not empty -->
        <div v-if="blockedList.length != 0" class="block-list">
            <div class="block-element" v-for="address in blockedList" :key="address.id">
                {{address}}
                <span class="block-remove" @click="unBlockAddress(address)"><i class="fa-solid fa-trash-can"></i></span>
            </div>
        </div>

        <!-- If blockedList is empty then display message -->
        <div v-else class="no-blocked">No Blocked Addresses...</div>

        <div class="divider"></div>
        
        <!-- Button to add current email sender address to blockedList -->
        <div class="block-button" :class="{disabled: blocked}" @click="blockSender()">
            Block Current Sender <i class="fa-solid fa-plus"></i>
        </div>
        
    </div>
</template>

<script>
export default {
    props: {
        show: false,
        title: '',
        address:'',
    },

    data() {
        return {
            blockedList: []
        }
    },

    computed: {
        // Dynamic value of whether the blockedList contains the current address
        blocked(){
            return this.blockedList.includes(this.address) ? true : false;
        }
    },
    
    methods: {
        // Emit close-dropdown event for Popup.vue to handle
        close(){
            this.$emit('close-dropdown')
        },
        // Emit new-blocked-value event for Popup.vue to handle and display accordingly
        emitBlockData(){
            this.$emit('new-blocked-value', this.blocked)
        },
        // Function to update the blockedList in the chrome.storage API so the data persists once the popup is closed
        updateBlockedData(){
            chrome.storage.local.set({
                    blockedList: this.blockedList
                });
        },
        // Function to block sender. Adds address to list and calls the functions to emit the data and update storage
        blockSender(){
            if (!this.blocked){
                this.blockedList.push(this.address);
                this.emitBlockData();
                this.updateBlockedData()
            }
        },
        // Function to unblock sender. Removes address from list and calls the functions to emit the data and update storage
        unBlockAddress(unBlockAddress){
            for (let i = 0; i <= this.blockedList.length; i++){
                if (this.blockedList[i] === unBlockAddress){
                    this.blockedList.splice(i,1);
                    this.emitBlockData();
                    this.updateBlockedData()
                }
            }
            
        }
    },
    mounted(){
        // Get blockedList from storage when mounted
        chrome.storage.local.get(['blockedList'], (data) => {
            this.blockedList = data.blockedList;
            this.emitBlockData();
        });    
    },

}
</script>