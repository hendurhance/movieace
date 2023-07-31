<template>
    <div>
        <BaseHeader />
        <section>
            
        </section>
        <BaseFooter />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseHeader from '../components/base/BaseHeader.vue';
import BaseFooter from '../components/base/BaseFooter.vue';
export default defineComponent({
    name: 'TVShow',
    components: {
        BaseHeader,
        BaseFooter
    },
    setup() {
    }
});


</script>

<style lang="scss" scoped>

</style>