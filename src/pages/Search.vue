<template>
    <div>
        <BaseHeader />
        <section></section>
        <BaseFooter />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseHeader from '../components/base/BaseHeader.vue';
import BaseFooter from '../components/base/BaseFooter.vue';
export default defineComponent({
    name: 'Search',
    components: {
        BaseHeader,
        BaseFooter
    },
    setup() {
        return {

        }
    }
});
</script>

<style lang="scss" scoped>

</style>