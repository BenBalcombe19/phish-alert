<template>
    <div v-if="riskValue" class="rating">
        <i class="fa-solid fa-circle circle" :class="riskClass(1)"></i>
        <i class="fa-solid fa-circle circle" :class="riskClass(2)"></i>
        <i class="fa-solid fa-circle circle" :class="riskClass(3)"></i>
        <i class="fa-solid fa-circle circle" :class="riskClass(4)"></i>
        <i class="fa-solid fa-circle circle" :class="riskClass(5)"></i>
    </div>
</template>

<script>
export default {
    props: {
        riskValue: false
    },

    data() {
        return {
    
        }
    },
    computed: {
       riskColor(){
           switch (this.riskValue){
               case 1:
                   return 'dark-green';
                   break;

               case 2:
                   return 'light-green';
                   break;

               case 3:
                   return 'yellow';
                   break;

               case 4:
                   return 'orange';
                   break;

               case 5:
                   return 'red';
                   break;

                default:
                    return 'gray';
                    break;
           }
       }
    },
    
    methods: {
        riskClass(id){
            if (this.riskValue != false){
                if (id <= this.riskValue){
                    return this.riskColor
                } else {
                    return 'gray'
                }
            }
        }
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