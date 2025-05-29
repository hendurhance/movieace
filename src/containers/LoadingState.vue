<template>
    <div class="loading-section" :style="{ backgroundColor: backgroundColor }">
        <div class="loading-spinner" :class="{ 'large': size === 'large' }"></div>
        <p>{{ message }}</p>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'LoadingState',
    props: {
        message: {
            type: String as PropType<string>,
            default: 'Loading...'
        },
        size: {
            type: String as PropType<'small' | 'medium' | 'large'>,
            default: 'medium'
        },
        backgroundColor: {
            type: String as PropType<string>,
            default: '#081b27'
        }
    }
});
</script>

<style lang="scss" scoped>
.loading-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    color: #8ea9bd;
    min-height: 200px;
    
    .loading-spinner {
        width: 50px;
        height: 50px;
        border: 4px solid rgba(241, 183, 34, 0.2);
        border-left: 4px solid #f1b722;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
        
        &.large {
            width: 60px;
            height: 60px;
        }
    }
    
    p {
        font-size: 1.1rem;
        margin: 0;
        text-align: center;
    }
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>