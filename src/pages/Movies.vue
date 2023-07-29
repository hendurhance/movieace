<template>
    <div>
        <BaseHeader />
        <h1>Movies</h1>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseHeader from '../components/base/BaseHeader.vue';
export default defineComponent({
    name: 'Movies',
    components: {
    BaseHeader
}
});
</script>

<style scoped>

</style>