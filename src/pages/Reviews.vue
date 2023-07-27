<template>
    <div>
        <AppHeader />
        <h1>Reviews</h1>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppHeader from '../components/layout/AppHeader.vue'
export default defineComponent({
    name: 'Reviews',
    components: {
        AppHeader
    }
});
</script>

<style scoped>

</style>