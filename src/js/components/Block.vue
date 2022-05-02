<template>
    <div class="block-container" :class="{ 'expanded': show}">
        <div class="block-title">{{title}} <i class="fa-solid fa-ban"></i></div>
        <i class="block-close fa-solid fa-xmark" @click="close()"></i>

        <div class="divider"></div>

        <div v-if="blockedList.length != 0" class="block-list">
            <div class="block-element" v-for="address in blockedList" :key="address.id">
                {{address}}
                <span class="block-remove" @click="unBlockAddress(address)"><i class="fa-solid fa-trash-can"></i></span>
            </div>
        </div>

        <div v-else class="no-blocked">No Blocked Addresses...</div>

        <div class="divider"></div>
        
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
        blocked(){
            return this.blockedList.includes(this.address) ? true : false;
        }
    },
    
    methods: {
        close(){
            this.$emit('close-dropdown')
        },
        emitBlockData(){
            this.$emit('new-blocked-value', this.blocked)
        },
        updateBlockedData(){
            chrome.storage.local.set({
                    blockedList: this.blockedList
                });
        },
        blockSender(){
            if (!this.blocked){
                this.blockedList.push(this.address);
                this.emitBlockData();
                this.updateBlockedData()
            }
        },
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
        chrome.storage.local.get(['blockedList'], (data) => {
            this.blockedList = data.blockedList;
            this.emitBlockData();
        });    
    },

}
</script>