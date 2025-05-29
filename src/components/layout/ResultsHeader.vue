<template>
    <div class="results-header">
        <div class="results-info">
            <h2 class="results-title">{{ title }}</h2>
            <p class="results-count" v-if="count > 0">
                {{ countText }}
                <span v-if="filterText">{{ filterText }}</span>
            </p>
        </div>
        
        <!-- Sort Options -->
        <div class="sort-options" v-if="showSort">
            <label class="sort-label">Sort by:</label>
            <select 
                :value="sortValue" 
                @change="$emit('sort-change', ($event.target as HTMLSelectElement).value)" 
                class="sort-select"
            >
                <option 
                    v-for="option in sortOptions" 
                    :key="option.value"
                    :value="option.value"
                >
                    {{ option.label }}
                </option>
            </select>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';

interface SortOption {
    value: string;
    label: string;
}

export default defineComponent({
    name: 'ResultsHeader',
    props: {
        title: {
            type: String as PropType<string>,
            required: true
        },
        count: {
            type: Number,
            default: 0
        },
        itemType: {
            type: String as PropType<string>,
            default: 'items'
        },
        filterText: {
            type: String as PropType<string>,
            default: ''
        },
        showSort: {
            type: Boolean,
            default: true
        },
        sortValue: {
            type: String as PropType<string>,
            default: 'popularity.desc'
        },
        sortOptions: {
            type: Array as PropType<SortOption[]>,
            default: () => [
                { value: 'popularity.desc', label: 'Most Popular' },
                { value: 'release_date.desc', label: 'Newest First' },
                { value: 'release_date.asc', label: 'Oldest First' },
                { value: 'vote_average.desc', label: 'Highest Rated' },
                { value: 'title.asc', label: 'A-Z' },
                { value: 'title.desc', label: 'Z-A' }
            ]
        }
    },
    emits: ['sort-change'],
    setup(props) {
        const countText = computed(() => {
            return `Showing ${props.count} ${props.itemType}`;
        });

        return {
            countText
        };
    }
});
</script>

<style lang="scss" scoped>
.results-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin: 2rem 0;
    padding: 1.5rem;
    background: rgba(15, 20, 25, 0.4);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    
    @media (max-width: 768px) {
        flex-direction: column;
        gap: 1rem;
    }
}

.results-info {
    flex: 1;
}

.results-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 0.5rem 0;
    
    @media (max-width: 768px) {
        font-size: 1.5rem;
    }
}

.results-count {
    font-size: 1rem;
    color: #8ea9bd;
    margin: 0;
}

.sort-options {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    @media (max-width: 768px) {
        width: 100%;
        justify-content: flex-start;
    }
}

.sort-label {
    font-size: 0.9rem;
    color: #8ea9bd;
    font-weight: 500;
}

.sort-select {
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: #ffffff;
    font-size: 0.9rem;
    cursor: pointer;
    
    &:focus {
        outline: none;
        border-color: #f1b722;
        box-shadow: 0 0 0 2px rgba(241, 183, 34, 0.2);
    }
    
    option {
        background: #1a2332;
        color: #ffffff;
    }
}
</style>