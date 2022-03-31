<template>
    <div  class="info-wrapper" :class="{ 'expanded': show}">
        <div class="info-title">Useful Tips</div>
        <ul class="info-list">
            <li v-for="point in data" :key="point.id">
                {{point}}
            </li>
            <!-- <li>Lorem ipsum dolor sit amet, consectetur adipisicing elit. 
                Deleniti repudiandae, dolor commodi ullam iure voluptatibus 
                aperiam natus nostrum ipsum dignissimos nobis!</li>
            <li>Lorem ipsum dolor sit amet, consectetur adipisicing elit. 
                Deleniti repudiandae, dolor commodi ullam iure voluptatibus 
                aperiam natus nostrum ipsum dignissimos nobis!</li> -->
        </ul>
    </div>
</template>

<script>
export default {
    props: {
        show: false,
        data: [],
    },

    data() {
        return {
            showInfo: false,
        }
    },
    computed: {

    },
    
    methods: {
        
    },
    
    beforeMount() {
    },
    created(){
    },
    mounted(){
    },
    beforeDestroy(){
    },
    destroyed(){
    }
}
</script>