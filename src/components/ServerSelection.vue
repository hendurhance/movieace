<template>
  <div class="server-selection">
    <h3>Select Server</h3>
    <div class="server-buttons">
      <button 
        v-for="(server, index) in servers" 
        :key="index"
        :class="{ active: activeServerIndex === index }" 
        @click="changeServer(index)"
      >
        {{ server.name }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

interface Server {
  name: string;
}

export default defineComponent({
  name: 'ServerSelection',
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
  setup(_props, { emit }) {
    const changeServer = (serverIndex: number) => {
      emit('server-change', serverIndex);
    };

    return {
      changeServer
    };
  }
});
</script>

<style lang="scss" scoped>
.server-selection {
  padding: 1.5rem 2rem;

  h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-weight: 500;
    font-size: 1.2rem;
  }

  .server-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;

    button {
      padding: 0.75rem 1.5rem;
      background-color: #1f2130;
      border: none;
      border-radius: 6px;
      color: #e1e1e1;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 500;

      &:hover {
        background-color: #2c2f45;
      }

      &.active {
        background-color: #ff5252;
        color: #fff;
      }
    }
  }
}

@media (max-width: 768px) {
  .server-selection .server-buttons button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}
</style>