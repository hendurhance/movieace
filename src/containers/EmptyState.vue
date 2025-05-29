<template>
    <div class="empty-state">
        <div class="empty-icon">{{ icon }}</div>
        <h3>{{ title }}</h3>
        <p>{{ description }}</p>
        <button 
            v-if="showResetButton" 
            @click="$emit('reset')"
            class="reset-btn"
        >
            {{ resetButtonText }}
        </button>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'EmptyState',
    props: {
        title: {
            type: String as PropType<string>,
            default: 'Nothing found'
        },
        description: {
            type: String as PropType<string>,
            default: 'Try adjusting your search or filters'
        },
        icon: {
            type: String as PropType<string>,
            default: '🔍'
        },
        showResetButton: {
            type: Boolean,
            default: true
        },
        resetButtonText: {
            type: String as PropType<string>,
            default: 'Reset Filters'
        }
    },
    emits: ['reset']
});
</script>

<style lang="scss" scoped>
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
    min-height: 300px;
    
    .empty-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
        opacity: 0.7;
    }
    
    h3 {
        font-size: 1.5rem;
        color: #ffffff;
        margin: 0 0 0.5rem 0;
        font-weight: 700;
    }
    
    p {
        font-size: 1rem;
        color: #8ea9bd;
        margin: 0 0 2rem 0;
        max-width: 400px;
        line-height: 1.5;
    }
    
    .reset-btn {
        padding: 0.875rem 2rem;
        background: linear-gradient(135deg, #f1b722 0%, #e6a71a 100%);
        border: none;
        border-radius: 50px;
        color: #ffffff;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.9rem;
        
        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(241, 183, 34, 0.3);
        }
    }
}
</style>