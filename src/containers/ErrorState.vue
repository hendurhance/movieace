<template>
    <div class="error-state" :style="{ backgroundColor: backgroundColor }">
        <div class="error-icon">⚠️</div>
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
        <button 
            @click="$emit('retry')"
            class="retry-button"
        >
            {{ retryText }}
        </button>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'ErrorState',
    props: {
        title: {
            type: String as PropType<string>,
            default: 'Something went wrong'
        },
        message: {
            type: String as PropType<string>,
            required: true
        },
        retryText: {
            type: String as PropType<string>,
            default: 'Try Again'
        },
        backgroundColor: {
            type: String as PropType<string>,
            default: '#fff'
        }
    },
    emits: ['retry']
});
</script>

<style lang="scss" scoped>
.error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    text-align: center;
    color: #ff6b6b;
    min-height: 200px;
    
    .error-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.8;
    }
    
    h3 {
        font-size: 1.3rem;
        margin: 0 0 0.5rem 0;
        font-weight: 600;
        color: #ff6b6b;
    }
    
    p {
        font-size: 1rem;
        margin: 0 0 1.5rem 0;
        color: #ff6b6b;
        max-width: 400px;
        line-height: 1.4;
    }
    
    .retry-button {
        padding: 0.75rem 1.5rem;
        background: linear-gradient(135deg, #f1b722 0%, #e6a71a 100%);
        color: #fff;
        border: none;
        border-radius: 25px;
        cursor: pointer;
        font-weight: 500;
        font-size: 0.9rem;
        transition: all 0.3s ease;
        
        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(241, 183, 34, 0.3);
        }
    }
}
</style>