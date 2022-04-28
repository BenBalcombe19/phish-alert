<template>
    <div class="info-container" :class="{ 'expanded': show, 'table-title-info': !inTable}">
        <div class="info-title">{{title}} <i class="fa-solid fa-circle-info"></i></div>
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
        show: false,
        data: [],
        inTable: true,
        title: '',
    },

    data() {
        return {
        }
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