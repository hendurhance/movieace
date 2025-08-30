<template>
  <div class="server-selection">
    <div class="section-header" @click="toggleMobileCollapse">
      <h3>
        <span class="icon">🌐</span>
        Select Server
      </h3>
      <div class="header-controls">
        <div class="current-server-mobile" v-if="!isMobileExpanded">
          <span class="current-server-name">{{ servers[activeServerIndex]?.name || 'Server' }}</span>
        </div>
        <div class="server-count">{{ servers.length }} available</div>
        <button class="mobile-toggle" :class="{ expanded: isMobileExpanded }">
          <ChevronDown />
        </button>
      </div>
    </div>
    
    <div class="server-content" :class="{ collapsed: !isMobileExpanded }">
      <div class="server-grid">
        <div 
          v-for="(server, index) in servers" 
          :key="index"
          :class="['server-card', { active: activeServerIndex === index, loading: loadingServer === index }]" 
          @click="changeServer(index)"
          :title="`Server ${index + 1}: ${server.name}`"
        >
          <div class="server-indicator">
            <div :class="['status-dot', getServerStatus(index)]"></div>
          </div>
          
          <div class="server-info">
            <div class="server-name">{{ server.name }}</div>
            <div class="server-label">Server {{ index + 1 }}</div>
          </div>
          
          <div class="server-meta">
            <div v-if="activeServerIndex === index" class="active-badge">
              <CheckIcon />
              Active
            </div>
            <div v-else-if="loadingServer === index" class="loading-spinner"></div>
          </div>
        </div>
      </div>
      
      <div class="server-tips">
        <p>💡 Try switching servers if video doesn't load or buffers frequently</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, onMounted, onUnmounted } from 'vue';
import CheckIcon from './svg/outline/check.vue';
import ChevronDown from './svg/outline/chevron-down.vue';

interface Server {
  name: string;
}

export default defineComponent({
  name: 'ServerSelection',
  components: {
    CheckIcon,
    ChevronDown
  },
  props: {
    servers: {
      type: Array as PropType<Server[]>,
      required: true
    },
    activeServerIndex: {
      type: Number,
      required: true
    }
  },
  emits: ['server-change'],
  setup(props, { emit }) {
    const loadingServer = ref<number | null>(null);
    const isMobileExpanded = ref<boolean>(false);
    const isMobile = ref<boolean>(false);

    const checkMobile = () => {
      isMobile.value = window.innerWidth <= 768;
      if (!isMobile.value) {
        isMobileExpanded.value = true; // Always expanded on desktop
      } else {
        // Default to collapsed on mobile
        isMobileExpanded.value = false;
      }
    };

    const toggleMobileCollapse = () => {
      if (isMobile.value) {
        isMobileExpanded.value = !isMobileExpanded.value;
      }
    };

    const changeServer = async (serverIndex: number) => {
      if (serverIndex === props.activeServerIndex) return;
      
      loadingServer.value = serverIndex;
      emit('server-change', serverIndex);
      
      // Auto-collapse on mobile after server selection
      if (isMobile.value) {
        setTimeout(() => {
          isMobileExpanded.value = false;
        }, 1500);
      }
      
      // Clear loading state after a brief delay
      setTimeout(() => {
        loadingServer.value = null;
      }, 1000);
    };

    const getServerStatus = (index: number): string => {
      if (loadingServer.value === index) return 'loading';
      if (props.activeServerIndex === index) return 'active';
      return 'available';
    };

    onMounted(() => {
      checkMobile();
      window.addEventListener('resize', checkMobile);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', checkMobile);
    });

    return {
      loadingServer,
      isMobileExpanded,
      isMobile,
      toggleMobileCollapse,
      changeServer,
      getServerStatus
    };
  }
});
</script>

<style lang="scss" scoped>
.server-selection {
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, rgba(31, 33, 48, 0.8) 0%, rgba(44, 47, 69, 0.6) 100%);
  border-radius: 12px;
  margin: 1rem 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    cursor: pointer;

    @media (max-width: 768px) {
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 12px;
      transition: background-color 0.3s;

      &:hover {
        background: rgba(255, 255, 255, 0.05);
      }
    }

    @media (min-width: 769px) {
      cursor: default;
    }

    h3 {
      display: flex;
      align-items: center;
      margin: 0;
      font-weight: 600;
      font-size: 1.25rem;
      color: #fff;

      .icon {
        margin-right: 0.75rem;
        font-size: 1.125rem;
      }
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .current-server-mobile {
      display: none;
      background: rgba(255, 82, 82, 0.15);
      color: #ff5252;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      border: 1px solid rgba(255, 82, 82, 0.3);

      @media (max-width: 768px) {
        display: block;
      }

      .current-server-name {
        max-width: 80px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: inline-block;
      }
    }

    .server-count {
      background: rgba(255, 255, 255, 0.1);
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.875rem;
      color: #b0b0b0;
    }

    .mobile-toggle {
      background: none;
      border: none;
      color: #b0b0b0;
      cursor: pointer;
      padding: 0.25rem;
      display: none;
      transition: all 0.3s;

      @media (max-width: 768px) {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      svg {
        width: 20px;
        height: 20px;
        transition: transform 0.3s;
      }

      &.expanded svg {
        transform: rotate(180deg);
      }

      &:hover {
        color: #fff;
      }
    }
  }

  .server-content {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

    @media (max-width: 768px) {
      &.collapsed {
        max-height: 0;
        opacity: 0;
        overflow: hidden;
        margin-bottom: -1.5rem;
      }

      &:not(.collapsed) {
        max-height: 1000px;
        opacity: 1;
      }
    }
  }

  .server-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }
  }

  .server-card {
    display: flex;
    align-items: center;
    padding: 1rem 1.25rem;
    background: rgba(31, 33, 48, 0.9);
    border: 2px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.03) 50%, transparent 70%);
      transform: translateX(-100%);
      transition: transform 0.6s;
    }

    &:hover {
      transform: translateY(-2px);
      border-color: rgba(255, 82, 82, 0.3);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 82, 82, 0.1);

      &::before {
        transform: translateX(100%);
      }

      .server-name {
        color: #fff;
      }
    }

    &.active {
      background: linear-gradient(135deg, rgba(255, 82, 82, 0.15) 0%, rgba(255, 82, 82, 0.08) 100%);
      border-color: #ff5252;
      box-shadow: 0 4px 20px rgba(255, 82, 82, 0.2);

      .server-name {
        color: #fff;
        font-weight: 600;
      }

      .server-label {
        color: #ff9999;
      }

      .status-dot {
        background: linear-gradient(45deg, #ff5252, #ff7979);
        box-shadow: 0 0 10px rgba(255, 82, 82, 0.5);
      }
    }

    &.loading {
      .status-dot {
        background: linear-gradient(45deg, #f1c40f, #f39c12);
        animation: pulse 2s infinite;
      }
    }

    .server-indicator {
      margin-right: 1rem;

      .status-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: linear-gradient(45deg, #2ecc71, #27ae60);
        transition: all 0.3s;

        &.loading {
          background: linear-gradient(45deg, #f1c40f, #f39c12);
          animation: pulse 2s infinite;
        }

        &.active {
          background: linear-gradient(45deg, #ff5252, #ff7979);
          box-shadow: 0 0 10px rgba(255, 82, 82, 0.5);
        }

        &.available {
          background: linear-gradient(45deg, #2ecc71, #27ae60);
        }
      }
    }

    .server-info {
      flex: 1;
      min-width: 0;

      .server-name {
        font-weight: 500;
        font-size: 1rem;
        color: #e1e1e1;
        margin-bottom: 0.25rem;
        transition: color 0.3s;
      }

      .server-label {
        font-size: 0.875rem;
        color: #9ca3af;
        transition: color 0.3s;
      }
    }

    .server-meta {
      .active-badge {
        display: flex;
        align-items: center;
        background: rgba(255, 82, 82, 0.15);
        color: #ff5252;
        padding: 0.375rem 0.75rem;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.025em;

        svg {
          width: 14px;
          height: 14px;
          margin-right: 0.375rem;
        }
      }

      .loading-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid rgba(241, 196, 15, 0.3);
        border-radius: 50%;
        border-top: 2px solid #f1c40f;
        animation: spin 1s linear infinite;
      }
    }
  }

  .server-tips {
    margin-top: 1rem;
    padding: 1rem;
    background: rgba(74, 144, 226, 0.1);
    border: 1px solid rgba(74, 144, 226, 0.2);
    border-radius: 8px;

    p {
      margin: 0;
      font-size: 0.875rem;
      color: #94a3b8;
      line-height: 1.5;
    }
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .server-selection {
    margin: 1rem;
    padding: 1.25rem;

    .section-header {
      padding: 0.75rem;
      margin-bottom: 0;

      h3 {
        font-size: 1.125rem;
        
        .icon {
          font-size: 1rem;
        }
      }

      .header-controls {
        gap: 0.5rem;
        flex-shrink: 0;
      }

      .current-server-mobile {
        max-width: 100px;

        .current-server-name {
          max-width: 70px;
        }
      }

      .server-count {
        font-size: 0.75rem;
        padding: 0.2rem 0.5rem;
      }

      .mobile-toggle {
        padding: 0.375rem;

        svg {
          width: 18px;
          height: 18px;
        }
      }
    }

    .server-content {
      margin-top: 1rem;

      &.collapsed {
        margin-top: 0;
        transform: translateY(-10px);
      }

      &:not(.collapsed) {
        animation: expandContent 0.4s ease-out;
      }
    }

    .server-grid {
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }

    .server-card {
      padding: 0.875rem 1rem;

      .server-info .server-name {
        font-size: 0.925rem;
      }

      .server-meta .active-badge {
        padding: 0.25rem 0.625rem;
        font-size: 0.7rem;
      }
    }

    .server-tips {
      margin-top: 1rem;
      padding: 0.875rem;

      p {
        font-size: 0.8rem;
      }
    }
  }
}

@keyframes expandContent {
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    max-height: 1000px;
    transform: translateY(0);
  }
}
</style>