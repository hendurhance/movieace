<template>
  <div>
    <!-- Watch Party Button -->
    <div class="watch-party-button" @click="openModal">
      <UsersIcon />
      <span>Watch Party</span>
    </div>

    <!-- Watch Party Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="watch-party-modal" @click.self="closeModal">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header">
          <h2>
            <UsersIcon />
            Watch Party
          </h2>
          <button class="close-button" @click="closeModal">
            <XIcon />
          </button>
        </div>

        <!-- Modal Content -->
        <div class="modal-body">
          <div class="intro-section">
            <div class="intro-icon">
              <UsersIcon />
            </div>
            <h3>Watch Together</h3>
            <p>Synchronize your viewing experience with friends and family</p>
          </div>

          <div class="action-cards">
            <!-- Create Room Card -->
            <div class="action-card" :class="{ active: mode === 'create' }" @click="mode = 'create'">
              <div class="card-icon">
                <PlusIcon />
              </div>
              <h4>Create Room</h4>
              <p>Start a new watch party</p>
            </div>

            <!-- Join Room Card -->
            <div class="action-card" :class="{ active: mode === 'join' }" @click="mode = 'join'">
              <div class="card-icon">
                <LinkIcon />
              </div>
              <h4>Join Room</h4>
              <p>Join an existing party</p>
            </div>
          </div>

          <!-- Form Section -->
          <div v-if="mode !== null" class="form-section">
            <div v-if="mode === 'create'" class="create-form">
              <div class="form-group">
                <label for="host-name">Your Name</label>
                <input
                  id="host-name"
                  v-model="hostName"
                  type="text"
                  placeholder="Enter your name"
                  maxlength="20"
                  @keyup.enter="createWatchParty"
                />
              </div>
              <button 
                class="submit-btn create-btn" 
                @click="createWatchParty"
                :disabled="!hostName.trim() || isLoading"
              >
                <div v-if="isLoading" class="spinner"></div>
                <PlusIcon v-else />
                {{ isLoading ? 'Creating...' : 'Create Room' }}
              </button>
            </div>

            <div v-else-if="mode === 'join'" class="join-form">
              <div class="form-group">
                <label for="member-name">Your Name</label>
                <input
                  id="member-name"
                  v-model="memberName"
                  type="text"
                  placeholder="Enter your name"
                  maxlength="20"
                />
              </div>
              <div class="form-group">
                <label for="room-code">Room Code</label>
                <input
                  id="room-code"
                  v-model="joinCode"
                  type="text"
                  placeholder="Enter room code"
                  maxlength="6"
                  @keyup.enter="joinWatchParty"
                />
              </div>
              <button 
                class="submit-btn join-btn" 
                @click="joinWatchParty"
                :disabled="!memberName.trim() || !joinCode.trim() || isLoading"
              >
                <div v-if="isLoading" class="spinner"></div>
                <LinkIcon v-else />
                {{ isLoading ? 'Joining...' : 'Join Room' }}
              </button>
            </div>
          </div>

          <!-- Info Message -->
          <div class="info-message">
            <AlertTriangleIcon />
            <p>This is a demo interface. Watch party functionality is not connected to a backend.</p>
          </div>
        </div>
      </div>
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

// Import icons
import UsersIcon from './svg/outline/users.vue';
import PlusIcon from './svg/outline/plus.vue';
import LinkIcon from './svg/outline/link.vue';
import XIcon from './svg/outline/x.vue';
import AlertTriangleIcon from './svg/outline/alert-triangle.vue';

export default defineComponent({
  name: 'WatchParty',
  components: {
    UsersIcon,
    PlusIcon,
    LinkIcon,
    XIcon,
    AlertTriangleIcon,
  },
  setup() {
    // Local state
    const showModal = ref(false);
    const isLoading = ref(false);
    const mode = ref<'create' | 'join' | null>(null);

    // Form data
    const hostName = ref('');
    const memberName = ref('');
    const joinCode = ref('');

    // Methods
    function openModal() {
      showModal.value = true;
      mode.value = null;
      // Also reset form data
      hostName.value = '';
      memberName.value = '';
      joinCode.value = '';
    }

    function closeModal() {
      showModal.value = false;
      mode.value = null;
      hostName.value = '';
      memberName.value = '';
      joinCode.value = '';
    }

    async function createWatchParty() {
      if (!hostName.value.trim()) return;

      isLoading.value = true;

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const name = hostName.value.trim();
        
        // Reset form
        hostName.value = '';
        mode.value = null;
        
        alert(`Demo: Room would be created for ${name}`);
      } catch (err) {
        alert('Demo: This is just a UI demo');
      } finally {
        isLoading.value = false;
      }
    }

    async function joinWatchParty() {
      if (!memberName.value.trim() || !joinCode.value.trim()) return;

      isLoading.value = true;

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const name = memberName.value.trim();
        const code = joinCode.value.trim();
        
        // Reset form
        memberName.value = '';
        joinCode.value = '';
        mode.value = null;
        
        alert(`Demo: ${name} would join room ${code}`);
      } catch (err) {
        alert('Demo: This is just a UI demo');
      } finally {
        isLoading.value = false;
      }
    }

    return {
      showModal,
      isLoading,
      mode,
      hostName,
      memberName,
      joinCode,
      openModal,
      closeModal,
      createWatchParty,
      joinWatchParty,
    };
  },
});
</script>

<style scoped lang="scss">
// Watch Party Button
.watch-party-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: rgba(255, 82, 82, 0.1);
  border: 1px solid rgba(255, 82, 82, 0.3);
  border-radius: 8px;
  color: #ff5252;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 82, 82, 0.2);
    border-color: rgba(255, 82, 82, 0.5);
    transform: translateY(-2px);
  }

  svg {
    width: 18px;
    height: 18px;
  }
}

// Watch Party Modal
.watch-party-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: linear-gradient(135deg, #1f2130 0%, #2c2f45 100%);
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  h2 {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 0;
    color: #fff;
    font-size: 1.25rem;
    font-weight: 600;

    svg {
      width: 24px;
      height: 24px;
      color: #ff5252;
    }
  }

  .close-button {
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: all 0.3s;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    svg {
      width: 20px;
      height: 20px;
    }
  }
}

.modal-body {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
}

// Intro Section
.intro-section {
  text-align: center;
  margin-bottom: 2rem;

  .intro-icon {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #ff5252 0%, #ff7979 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;

    svg {
      width: 32px;
      height: 32px;
      color: #fff;
    }
  }

  h3 {
    margin: 0 0 0.5rem 0;
    color: #fff;
    font-size: 1.5rem;
    font-weight: 700;
  }

  p {
    margin: 0;
    color: #b0b0b0;
    font-size: 1rem;
    line-height: 1.5;
  }
}

// Action Cards
.action-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.action-card {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 82, 82, 0.3);
    transform: translateY(-2px);
  }

  &.active {
    background: rgba(255, 82, 82, 0.1);
    border-color: rgba(255, 82, 82, 0.5);
  }

  .card-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #ff5252 0%, #ff7979 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;

    svg {
      width: 24px;
      height: 24px;
      color: #fff;
    }
  }

  h4 {
    margin: 0 0 0.5rem 0;
    color: #fff;
    font-size: 1rem;
    font-weight: 600;
  }

  p {
    margin: 0;
    color: #888;
    font-size: 0.875rem;
  }
}

// Form Section
.form-section {
  margin-bottom: 1.5rem;
}

.create-form,
.join-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #fff;
    font-weight: 500;
    font-size: 0.875rem;
  }

  input {
    width: 100%;
    padding: 0.875rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: #fff;
    font-size: 1rem;
    transition: all 0.3s;

    &:focus {
      outline: none;
      border-color: #ff5252;
      background: rgba(255, 255, 255, 0.08);
    }

    &::placeholder {
      color: #666;
    }
  }
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  svg,
  .spinner {
    width: 20px;
    height: 20px;
  }

  &.create-btn {
    background: rgba(76, 175, 80, 0.2);
    border: 1px solid rgba(76, 175, 80, 0.3);
    color: #4caf50;

    &:hover:not(:disabled) {
      background: rgba(76, 175, 80, 0.3);
      border-color: rgba(76, 175, 80, 0.5);
      transform: translateY(-2px);
    }
  }

  &.join-btn {
    background: rgba(33, 150, 243, 0.2);
    border: 1px solid rgba(33, 150, 243, 0.3);
    color: #2196f3;

    &:hover:not(:disabled) {
      background: rgba(33, 150, 243, 0.3);
      border-color: rgba(33, 150, 243, 0.5);
      transform: translateY(-2px);
    }
  }
}

// Info Message
.info-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  color: #ffc107;

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  p {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.4;
  }
}

// Spinner animation
.spinner {
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 2px solid currentColor;
  animation: spin 1s linear infinite;
}

// Animations
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// Mobile Responsiveness
@media (max-width: 768px) {
  .modal-content {
    width: 95vw;
    max-height: 90vh;
  }

  .action-cards {
    grid-template-columns: 1fr;
  }
}
</style>