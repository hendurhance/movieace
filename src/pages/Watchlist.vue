<template>
  <div class="watchlist-page">
    <BaseHeader />
    
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="hero-overlay"></div>
      </div>
      <div class="container">
        <div class="hero-content">
          <div class="hero-icon">
            <Bookmark stroke="currentColor" width="48" height="48" />
          </div>
          <h1 class="hero-title">Your Watchlist</h1>
          <p class="hero-subtitle" v-if="watchlist.length">
            {{ watchlist.length }} {{ watchlist.length === 1 ? 'item' : 'items' }} saved for later
          </p>
          <p class="hero-subtitle" v-else>
            Your personal collection awaits
          </p>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="main-content">
      <div class="container">
        <!-- Filters and Sort -->
        <div v-if="watchlist.length" class="controls-section">
          <div class="filter-tabs">
            <button 
              class="filter-tab" 
              :class="{ active: activeFilter === 'all' }" 
              @click="setFilter('all')"
            >
              All ({{ watchlist.length }})
            </button>
            <button 
              class="filter-tab" 
              :class="{ active: activeFilter === 'movie' }" 
              @click="setFilter('movie')"
            >
              Movies ({{ movieCount }})
            </button>
            <button 
              class="filter-tab" 
              :class="{ active: activeFilter === 'tv' }" 
              @click="setFilter('tv')"
            >
              TV Shows ({{ tvCount }})
            </button>
          </div>
          
          <div class="sort-controls">
            <select v-model="sortBy" class="sort-select">
              <option value="recent">Recently Added</option>
              <option value="title">Title A-Z</option>
              <option value="rating">Highest Rated</option>
            </select>
            <button class="view-toggle" @click="toggleView" :class="{ grid: viewMode === 'grid' }">
              <Grid3x3 v-if="viewMode === 'list'" width="20" height="20" />
              <List v-else width="20" height="20" />
            </button>
          </div>
        </div>

        <!-- Content Grid -->
        <div v-if="filteredWatchlist.length" class="content-wrapper">
          <div class="content-grid" :class="viewMode">
            <div class="grid-item" v-for="item in filteredWatchlist" :key="`wl-${item.type}-${item.id}`">
              <MovieItem
                :title="item.title"
                :movie-id="item.id"
                :image="item.image || undefined"
                :rating="item.rating"
                :categories="item.categories"
                :adult="item.adult"
                :type="item.type"
                :size="viewMode === 'grid' ? 'large' : 'small'"
              />
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="watchlist.length && !filteredWatchlist.length" class="empty-filter">
          <div class="empty-filter-content">
            <div class="empty-icon">🔍</div>
            <h3>No {{ activeFilter === 'all' ? '' : activeFilter === 'movie' ? 'movies' : 'TV shows' }} found</h3>
            <p>Try adjusting your filters</p>
            <button class="reset-filter-btn" @click="setFilter('all')">
              Show All Items
            </button>
          </div>
        </div>

        <!-- Main Empty State -->
        <div v-else class="main-empty-state">
          <div class="empty-state-card">
            <div class="empty-illustration">
              <div class="empty-circle">
                <Bookmark stroke="currentColor" width="64" height="64" />
              </div>
            </div>
            <div class="empty-content">
              <h2>Start Building Your Watchlist</h2>
              <p>Discover and save movies and TV shows you want to watch later. Your personal collection is just a click away!</p>
              <div class="empty-actions">
                <router-link to="/movies" class="cta-button primary">
                  <Film width="20" height="20" />
                  Browse Movies
                </router-link>
                <router-link to="/tv-shows" class="cta-button secondary">
                  <Tv width="20" height="20" />
                  Browse TV Shows
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <BaseFooter />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import BaseHeader from '../components/base/BaseHeader.vue';
import BaseFooter from '../components/base/BaseFooter.vue';
import MovieItem from '../components/layout/MovieItem.vue';
import { useWatchlist } from '../composables/useWatchlist';
import Bookmark from '../components/svg/outline/bookmark.vue';
import Grid3x3 from '../components/svg/outline/grid.vue';
import List from '../components/svg/outline/list.vue';
import Film from '../components/svg/outline/film.vue';
import Tv from '../components/svg/outline/tv.vue';

export default defineComponent({
  name: 'Watchlist',
  components: {
    BaseHeader,
    BaseFooter,
    MovieItem,
    Bookmark,
    Grid3x3,
    List,
    Film,
    Tv,
  },
  setup() {
    const { watchlist } = useWatchlist();
    const activeFilter = ref<'all' | 'movie' | 'tv'>('all');
    const sortBy = ref<'recent' | 'title' | 'rating'>('recent');
    const viewMode = ref<'grid' | 'list'>('grid');

    const movieCount = computed(() => 
      watchlist.value.filter(item => item.type === 'movie').length
    );

    const tvCount = computed(() => 
      watchlist.value.filter(item => item.type === 'tv').length
    );

    const filteredWatchlist = computed(() => {
      let filtered = watchlist.value;

      // Apply filter
      if (activeFilter.value !== 'all') {
        filtered = filtered.filter(item => item.type === activeFilter.value);
      }

      // Apply sort
      filtered = [...filtered].sort((a, b) => {
        switch (sortBy.value) {
          case 'title':
            return a.title.localeCompare(b.title);
          case 'rating':
            return b.rating - a.rating;
          case 'recent':
          default:
            return 0; // Keep original order (most recent first)
        }
      });

      return filtered;
    });

    const setFilter = (filter: 'all' | 'movie' | 'tv') => {
      activeFilter.value = filter;
    };

    const toggleView = () => {
      viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid';
    };

    return {
      watchlist,
      activeFilter,
      sortBy,
      viewMode,
      movieCount,
      tvCount,
      filteredWatchlist,
      setFilter,
      toggleView
    };
  }
});
</script>

<style lang="scss" scoped>
.watchlist-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 100%);
  color: #fff;
}

.hero-section {
  position: relative;
  padding: 6rem 0 4rem;
  overflow: hidden;

  .hero-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(241, 183, 34, 0.1) 0%, rgba(241, 183, 34, 0.05) 100%);

    .hero-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(ellipse at center, transparent 0%, rgba(10, 14, 26, 0.3) 100%);
    }
  }

  .container {
    position: relative;
    z-index: 2;
  }

  .hero-content {
    text-align: center;
    max-width: 600px;
    margin: 0 auto;

    .hero-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      background: rgba(241, 183, 34, 0.1);
      border: 2px solid rgba(241, 183, 34, 0.3);
      border-radius: 50%;
      margin-bottom: 2rem;
      color: #f1b722;

      svg {
        filter: drop-shadow(0 0 10px rgba(241, 183, 34, 0.3));
      }
    }

    .hero-title {
      font-size: 3rem;
      font-weight: 800;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, #fff 0%, #f1b722 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1.2;
    }

    .hero-subtitle {
      font-size: 1.2rem;
      color: rgba(255, 255, 255, 0.7);
      margin: 0;
      font-weight: 400;
    }
  }
}

.main-content {
  padding: 2rem 0 4rem;

  .controls-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 3rem;
    flex-wrap: wrap;
    gap: 1.5rem;

    .filter-tabs {
      display: flex;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.05);
      padding: 0.5rem;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);

      .filter-tab {
        padding: 0.75rem 1.25rem;
        border: none;
        background: transparent;
        color: rgba(255, 255, 255, 0.7);
        border-radius: 8px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.9rem;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        &.active {
          background: rgba(241, 183, 34, 0.2);
          color: #f1b722;
          box-shadow: 0 2px 8px rgba(241, 183, 34, 0.2);
        }
      }
    }

    .sort-controls {
      display: flex;
      align-items: center;
      gap: 1rem;

      .sort-select {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        padding: 0.75rem 1rem;
        color: #fff;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.3s ease;

        &:focus {
          outline: none;
          border-color: rgba(241, 183, 34, 0.5);
          box-shadow: 0 0 0 3px rgba(241, 183, 34, 0.1);
        }

        option {
          background: #1a1f2e;
          color: #fff;
        }
      }

      .view-toggle {
        width: 40px;
        height: 40px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        &.grid {
          background: rgba(241, 183, 34, 0.2);
          color: #f1b722;
          border-color: rgba(241, 183, 34, 0.3);
        }
      }
    }
  }

  .content-wrapper {
    .content-grid {
      &.grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 2rem;
      }

      &.list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1.5rem;
      }
    }
  }

  .empty-filter {
    text-align: center;
    padding: 4rem 2rem;

    .empty-filter-content {
      max-width: 400px;
      margin: 0 auto;

      .empty-icon {
        font-size: 4rem;
        margin-bottom: 1.5rem;
      }

      h3 {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
        color: #fff;
      }

      p {
        color: rgba(255, 255, 255, 0.6);
        margin-bottom: 2rem;
      }

      .reset-filter-btn {
        background: rgba(241, 183, 34, 0.2);
        border: 1px solid rgba(241, 183, 34, 0.3);
        color: #f1b722;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 500;

        &:hover {
          background: rgba(241, 183, 34, 0.3);
          transform: translateY(-2px);
        }
      }
    }
  }

  .main-empty-state {
    display: flex;
    justify-content: center;
    padding: 4rem 2rem;

    .empty-state-card {
      background: rgba(255, 255, 255, 0.02);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 4rem 3rem;
      text-align: center;
      max-width: 600px;
      width: 100%;

      .empty-illustration {
        margin-bottom: 3rem;

        .empty-circle {
          width: 120px;
          height: 120px;
          background: rgba(241, 183, 34, 0.1);
          border: 2px solid rgba(241, 183, 34, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          color: #f1b722;

          svg {
            filter: drop-shadow(0 0 20px rgba(241, 183, 34, 0.3));
          }
        }
      }

      .empty-content {
        h2 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: #fff;
        }

        p {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          margin-bottom: 2.5rem;
        }

        .empty-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;

          .cta-button {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 1rem 2rem;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
            min-width: 160px;
            justify-content: center;

            &.primary {
              background: linear-gradient(135deg, #f1b722 0%, #d4a10a 100%);
              color: #000;
              box-shadow: 0 4px 20px rgba(241, 183, 34, 0.3);

              &:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 30px rgba(241, 183, 34, 0.4);
              }
            }

            &.secondary {
              background: rgba(255, 255, 255, 0.1);
              color: #fff;
              border: 1px solid rgba(255, 255, 255, 0.2);

              &:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateY(-3px);
              }
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 4rem 0 3rem;

    .hero-content {
      .hero-title {
        font-size: 2.5rem;
      }

      .hero-subtitle {
        font-size: 1.1rem;
      }
    }
  }

  .main-content {
    .controls-section {
      flex-direction: column;
      align-items: stretch;

      .filter-tabs {
        justify-content: center;
      }

      .sort-controls {
        justify-content: space-between;
      }
    }

    .content-wrapper {
      .content-grid {
        &.grid {
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        &.list {
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1rem;
        }
      }
    }

    .main-empty-state {
      .empty-state-card {
        padding: 3rem 2rem;

        .empty-content {
          .empty-actions {
            flex-direction: column;
            align-items: center;

            .cta-button {
              width: 100%;
              max-width: 250px;
            }
          }
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .hero-section {
    .hero-content {
      .hero-title {
        font-size: 2rem;
      }
    }
  }

  .main-content {
    .controls-section {
      .filter-tabs {
        .filter-tab {
          padding: 0.625rem 1rem;
          font-size: 0.85rem;
        }
      }
    }

    .content-wrapper {
      .content-grid {
        &.grid {
          grid-template-columns: 1fr;
        }

        &.list {
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        }
      }
    }
  }
}
</style>