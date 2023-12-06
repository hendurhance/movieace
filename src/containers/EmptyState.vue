<template>
    <div class="empty-state-wrapper">
        <h3>{{ title }}</h3>
        <p>{{ description }}</p>
    </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';

export default defineComponent({
    name: 'EmptyState',
    props: {
        title: {
            type: String as PropType<string>,
            default: 'Nothing to see here'
        },
        description: {
            type: String as PropType<string>,
            default: 'Try searching for a movie, tv show, or actor'
        }
    }
});
</script>

<style lang="scss">
.empty-state-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 2rem;
    text-align: center;

    h3 {
        font-size: 2rem;
        font-weight: 700;
        color: #fff;
        margin-bottom: 1rem;
    }

    p {
        font-size: 1.5rem;
        font-weight: 400;
        color: #8ea9bd;
    }
}

</style>