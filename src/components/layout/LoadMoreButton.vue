<template>
    <div class="pagination" v-if="showButton">
        <button 
            @click="$emit('load-more')" 
            :disabled="isLoading"
            class="load-more-btn"
        >
            <span v-if="!isLoading">{{ buttonText }}</span>
            <span v-else class="loading-text">
                <div class="mini-spinner"></div>
                Loading...
            </span>
        </button>
        <p class="pagination-info" v-if="showPaginationInfo">
            Page {{ currentPage }} of {{ totalPages }}
        </p>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';

export default defineComponent({
    name: 'LoadMoreButton',
    props: {
        currentPage: {
            type: Number,
            required: true
        },
        totalPages: {
            type: Number,
            required: true
        },
        isLoading: {
            type: Boolean,
            default: false
        },
        itemType: {
            type: String as PropType<string>,
            default: 'items'
        },
        showPaginationInfo: {
            type: Boolean,
            default: true
        }
    },
    emits: ['load-more'],
    setup(props) {
        const showButton = computed(() => {
            return props.currentPage < props.totalPages;
        });

        const buttonText = computed(() => {
            return `Load More ${props.itemType}`;
        });

        return {
            showButton,
            buttonText
        };
    }
});
</script>

<style lang="scss" scoped>
.pagination {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 3rem;
    gap: 1rem;
}

.load-more-btn {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 2.5rem;
    background: linear-gradient(135deg, rgba(241, 183, 34, 0.1) 0%, rgba(230, 167, 26, 0.2) 100%);
    border: 2px solid rgba(241, 183, 34, 0.3);
    border-radius: 50px;
    color: #f1b722;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover:not(:disabled) {
        background: linear-gradient(135deg, rgba(241, 183, 34, 0.2) 0%, rgba(230, 167, 26, 0.3) 100%);
        border-color: rgba(241, 183, 34, 0.5);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(241, 183, 34, 0.2);
    }
    
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    .loading-text {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .mini-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(241, 183, 34, 0.3);
        border-left: 2px solid #f1b722;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
}

.pagination-info {
    font-size: 0.9rem;
    color: #8ea9bd;
    margin: 0;
    text-align: center;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>