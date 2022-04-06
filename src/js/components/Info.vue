<template>
    <div class="info-container" :class="{ 'expanded': show, 'table-title-info': !inTable}">
        <div class="info-title">{{title}}</div>
        <ul class="info-list">
            <li v-for="point in data" :key="point.id">
                {{point}}
            </li>
        </ul>
        <i class="info-close fa-solid fa-chevron-up" @click="close()"></i>
    </div>
</template>

<script>
export default {
    props: {
        settings: false,
        show: false,
        data: [],
        inTable: true,
        title: '',
        activeWarning: false,
    },

    data() {
        return {
            showInfo: false,
        }
    },

    watch : {
        activeWarning: function(newVal){
            chrome.storage.local.set({
                activeWarning: this.activeWarning
            }, () => {});
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

    },

}
</script>