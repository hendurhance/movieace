<template>
    <div>
        <BaseHeader />
        <h1>TV Shows</h1>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseHeader from '../components/base/BaseHeader.vue';
export default defineComponent({
    name: 'TVSeries',
    components: {
    BaseHeader
}
});
</script>

<style scoped>

</style>