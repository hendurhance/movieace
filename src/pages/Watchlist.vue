<template>
  <div>
    <BaseHeader />
    <section>
      <div class="container">
        <h1 class="page-title">Your Watchlist</h1>
        <div v-if="watchlist.length" class="movie-meta-grid">
          <div class="movie-item-grid">
            <MovieItem
              v-for="item in watchlist"
              :key="`wl-${item.type}-${item.id}`"
              :title="item.title"
              :movie-id="item.id"
              :image="item.image || undefined"
              :rating="item.rating"
              :categories="item.categories"
              :adult="item.adult"
              :type="item.type"
              :size="'large'"
            />
          </div>
        </div>
        <EmptyState
          v-else
          title="No items in your watchlist"
          description="Add some movies or TV shows to see them here"
          icon="🎬"
          :show-reset-button="false"
        />
      </div>
    </section>
    <BaseFooter />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseHeader from '../components/base/BaseHeader.vue';
import BaseFooter from '../components/base/BaseFooter.vue';
import MovieItem from '../components/layout/MovieItem.vue';
import EmptyState from '../containers/EmptyState.vue';
import { useWatchlist } from '../composables/useWatchlist';

export default defineComponent({
  name: 'Watchlist',
  components: {
    BaseHeader,
    BaseFooter,
    MovieItem,
    EmptyState
  },
  setup() {
    const { watchlist } = useWatchlist();
    return { watchlist };
  }
});
</script>

<style lang="scss" scoped>
.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
}
</style>
