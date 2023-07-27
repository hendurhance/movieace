<template>
    <div>
        <BaseHeader />
        <h1>Reviews</h1>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseHeader from '../components/base/BaseHeader.vue';
export default defineComponent({
    name: 'Reviews',
    components: {
    BaseHeader
}
});
</script>

<style scoped>

</style>