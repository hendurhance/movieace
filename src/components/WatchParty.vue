<template>
  <div>
    <!-- Watch Party Button -->
    <button 
      class="watch-party-button" 
      :class="{ connected: isConnected }"
      @click="openModal"
      type="button"
      :title="isConnected ? `Connected to watch party (${roomMembers.length} members)` : 'Start or join a watch party'"
      :aria-label="isConnected ? `Connected to watch party with ${roomMembers.length} members. Click to manage.` : 'Start or join a watch party'"
    >
      <UsersIcon />
      <span class="button-text" :class="{ 'count-updated': memberCountUpdated }">
        {{ isConnected ? `Connected (${roomMembers.length})` : 'Watch Party' }}
      </span>
      <div v-if="isConnected" class="connection-indicator" aria-hidden="true"></div>
    </button>

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
          <!-- Connected State - Show only when connected -->
          <div v-if="isConnected" class="connected-section">
            <div class="connection-status">
              <div class="status-header">
                <CheckCircleIcon />
                <h3>Connected to Room</h3>
              </div>
              
              <div v-if="currentRoom" class="room-info">
                <div class="room-code-section">
                  <span class="room-code-label">Room Code</span>
                  <div class="room-code-display">
                    <span class="room-code">{{ currentRoom.room_code }}</span>
                    <button class="copy-btn" @click="copyRoomLink" :class="{ success: copySuccess }">
                      <CheckIcon v-if="copySuccess" />
                      <CopyIcon v-else />
                    </button>
                  </div>
                </div>
                
                <button class="share-btn" @click="copyRoomLink" :class="{ success: copySuccess }">
                  {{ copySuccess ? 'Copied!' : 'Share Invite Link' }}
                </button>
              </div>
            </div>

            <div class="members-section">
              <div class="members-header">
                <h4>Members</h4>
                <span class="member-count" :class="{ updated: memberCountUpdated }">
                  {{ isLoadingMembers ? '...' : roomMembers.length }}
                </span>
              </div>
              
              <div class="member-list">
                <div v-if="isLoadingMembers" class="member-loading">
                  <div class="spinner"></div>
                  <span>Updating member list...</span>
                </div>
                <div 
                  v-else
                  v-for="member in roomMembers" 
                  :key="member.id"
                  class="member-item"
                  :class="{ 
                    host: member.is_host, 
                    'current-user': member.id === currentMember?.id 
                  }"
                >
                  <div class="member-avatar">
                    <UsersIcon />
                  </div>
                  <div class="member-info">
                    <span class="member-name">{{ member.member_name }}</span>
                    <div class="member-badges">
                      <span v-if="member.id === currentMember?.id" class="you-badge">You</span>
                      <span v-if="member.is_host" class="host-badge">Host</span>
                      <span v-if="getMemberTimestamp(member.id) !== null" class="timestamp-badge">
                        {{ formatTimestamp(getMemberTimestamp(member.id)!) }}
                      </span>
                      <div 
                        class="online-indicator"
                        :class="{ online: member.is_online }"
                        :title="member.is_online ? 'Online' : 'Offline'"
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div v-if="!isLoadingMembers && roomMembers.length === 0" class="no-members">
                  <span>No members found</span>
                </div>
              </div>
            </div>

            <div class="connected-actions">
              <button class="sync-btn" @click="handleForceSync" :disabled="!isCurrentServerSupported">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 4v6h-6"/>
                  <path d="M1 20v-6h6"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10"/>
                  <path d="M3.51 15A9 9 0 0 0 18.36 18.36L23 14"/>
                </svg>
                Force Sync
              </button>
              <button class="leave-room-btn" @click="handleLeaveRoom">
                Leave Room
              </button>
            </div>
          </div>

          <!-- Not Connected State - Show intro and options -->
          <div v-else>
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
                <div v-if="!isCurrentServerSupported" class="server-warning">
                  <AlertTriangleIcon />
                  <p>Current server doesn't support watch party. Switch to VidLink, VidFast, or 111Movies first.</p>
                </div>
                <div class="form-group">
                  <label for="host-name">Your Name</label>
                  <input
                    id="host-name"
                    v-model="hostName"
                    type="text"
                    placeholder="Enter your name"
                    maxlength="20"
                    @keyup.enter="createWatchParty"
                    :disabled="!isCurrentServerSupported"
                  />
                </div>
                <button 
                  class="submit-btn create-btn" 
                  @click="createWatchParty"
                  :disabled="!hostName.trim() || isLoading || !isCurrentServerSupported"
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
          </div>

          <!-- Error Message -->
          <div v-if="error" class="error-message">
            <AlertTriangleIcon />
            <p>{{ error }}</p>
          </div>
        </div>
      </div>
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue';
import { useWatchParty, initializeWatchParty } from '../composables/useWatchParty';
import { currentStreamData, isWatchPartyEnabledServer } from '../composables/useStream';

// Import icons
import UsersIcon from './svg/outline/users.vue';
import PlusIcon from './svg/outline/plus.vue';
import LinkIcon from './svg/outline/link.vue';
import XIcon from './svg/outline/x.vue';
import CheckCircleIcon from './svg/outline/check-circle.vue';
import CheckIcon from './svg/outline/check.vue';
import CopyIcon from './svg/outline/copy.vue';
import AlertTriangleIcon from './svg/outline/alert-triangle.vue';

export default defineComponent({
  name: 'WatchParty',
  components: {
    UsersIcon,
    PlusIcon,
    LinkIcon,
    XIcon,
    CheckCircleIcon,
    CheckIcon,
    CopyIcon,
    AlertTriangleIcon,
  },
  props: {
    mediaId: {
      type: String,
      required: true
    },
    mediaType: {
      type: String as () => 'movie' | 'tv',
      required: true
    }
  },
  setup(props) {
    const { 
      currentRoom, 
      currentMember, 
      roomMembers, 
      isLoadingMembers,
      isConnected, 
      isHost,
      createRoom,
      joinRoom,
      leaveRoom,
      getMemberTimestamp,
      formatTimestamp,
      forceSync
    } = useWatchParty();

    // Local state
    const showModal = ref(false);
    const isLoading = ref(false);
    const mode = ref<'create' | 'join' | 'connected' | null>(null);
    const error = ref<string | null>(null);
    const copySuccess = ref(false);
    const memberCountUpdated = ref(false); // For visual feedback when count changes

    // Form data
    const hostName = ref('');
    const memberName = ref('');
    const joinCode = ref('');

    // Check if current server supports watch party
    const isCurrentServerSupported = computed(() => {
      return isWatchPartyEnabledServer(currentStreamData.value.currentServer);
    });

    // Generate shareable room link
    const shareableLink = computed(() => {
      if (!currentRoom.value) return '';
      return `${window.location.origin}${window.location.pathname}?watch-party=${currentRoom.value.room_code}`;
    });

    // Methods
    function openModal() {
      showModal.value = true;
      error.value = null;
      copySuccess.value = false;
      
      // Set mode based on connection status
      if (isConnected.value) {
        mode.value = 'connected';
      } else {
        mode.value = null; // Show intro and options
      }
    }

    function closeModal() {
      showModal.value = false;
      
      // Only reset form state if not connected to a room
      if (!isConnected.value) {
        mode.value = null;
        hostName.value = '';
        memberName.value = '';
        joinCode.value = '';
      }
      
      error.value = null;
      copySuccess.value = false;
    }

    async function createWatchParty() {
      if (!hostName.value.trim()) return;
      if (!isCurrentServerSupported.value) {
        error.value = 'Current server does not support watch party. Please switch to VidLink, VidFast, or 111Movies.';
        return;
      }

      isLoading.value = true;
      error.value = null;

      try {
        const response = await createRoom({
          hostName: hostName.value.trim(),
          mediaId: props.mediaId,
          mediaType: props.mediaType,
          serverIndex: currentStreamData.value.currentServer,
          season: props.mediaType === 'tv' ? currentStreamData.value.currentSeason : undefined,
          episode: props.mediaType === 'tv' ? currentStreamData.value.currentEpisode : undefined,
        });

        if (response.success && response.data) {
          // Automatically switch to connected mode after successful room creation
          mode.value = 'connected';
          hostName.value = '';
          
          // Small delay to allow real-time subscriptions to fully establish
          setTimeout(() => {
            // Room connection established
          }, 500);
        } else {
          error.value = response.error || 'Failed to create room';
        }
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to create room';
      } finally {
        isLoading.value = false;
      }
    }

    async function joinWatchParty() {
      if (!memberName.value.trim() || !joinCode.value.trim()) return;

      isLoading.value = true;
      error.value = null;

      try {
        const response = await joinRoom({
          roomCode: joinCode.value.trim().toUpperCase(),
          memberName: memberName.value.trim()
        });

        if (response.success && response.data) {
          mode.value = 'connected';
          memberName.value = '';
          joinCode.value = '';
          
          // Stream data sync is now handled automatically by the useWatchParty sync system

          // Emit event for stream pages to update
          window.dispatchEvent(new CustomEvent('watchparty:joined', {
            detail: response.data.roomData
          }));
        } else {
          error.value = response.error || 'Failed to join room';
        }
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to join room';
      } finally {
        isLoading.value = false;
      }
    }

    async function handleLeaveRoom() {
      try {
        await leaveRoom();
        mode.value = null;
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to leave room';
      }
    }

    async function handleForceSync() {
      await forceSync();
    }

    async function copyRoomLink() {
      try {
        await navigator.clipboard.writeText(shareableLink.value);
        copySuccess.value = true;
        setTimeout(() => {
          copySuccess.value = false;
        }, 2000);
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        error.value = 'Failed to copy link to clipboard';
      }
    }

    // Check for URL parameter to auto-join room
    function checkURLParams() {
      const urlParams = new URLSearchParams(window.location.search);
      const watchPartyCode = urlParams.get('watch-party');
      
      if (watchPartyCode && !isConnected.value) {
        joinCode.value = watchPartyCode;
        mode.value = 'join';
        showModal.value = true;
      }
    }

    // Handle timestamp updates for live display
    function handleTimestampUpdate() {
      // Force reactivity update by triggering a re-render
      // The timestamps are already stored in the composable, just need to trigger updates
    }

    // Initialize URL params check and restore connection
    onMounted(async () => {
      await initializeWatchParty();
      checkURLParams();
      
      // Set up event listeners for real-time member updates
      window.addEventListener('watchparty:member-joined', handleMemberJoined);
      window.addEventListener('watchparty:member-left', handleMemberLeft);
      window.addEventListener('watchparty:member-updated', handleMemberUpdated);
      window.addEventListener('watchparty:timestamp-update', handleTimestampUpdate);
    });

    // Add onUnmounted to clean up event listeners
    onUnmounted(() => {
      window.removeEventListener('watchparty:member-joined', handleMemberJoined);
      window.removeEventListener('watchparty:member-left', handleMemberLeft);
      window.removeEventListener('watchparty:member-updated', handleMemberUpdated);
      window.removeEventListener('watchparty:timestamp-update', handleTimestampUpdate);
    });

    // Handle member join events
    function handleMemberJoined() {
      // Trigger visual feedback for member count update
      triggerMemberCountUpdate();
    }

    // Handle member leave events
    function handleMemberLeft() {
      // Trigger visual feedback for member count update
      triggerMemberCountUpdate();
    }

    // Handle member status updates
    function handleMemberUpdated() {
      // No count change for status updates, so no visual feedback needed
    }


    // Trigger visual feedback for member count changes
    function triggerMemberCountUpdate() {
      memberCountUpdated.value = true;
      setTimeout(() => {
        memberCountUpdated.value = false;
      }, 1000); // Remove the class after 1 second
    }


    return {
      // State
      showModal,
      isLoading,
      isLoadingMembers,
      mode,
      error,
      copySuccess,
      memberCountUpdated,
      
      // Form data
      hostName,
      memberName,
      joinCode,
      
      // Computed
      isCurrentServerSupported,
      shareableLink,
      
      // Watch party state
      currentRoom,
      currentMember,
      roomMembers,
      isConnected,
      isHost,
      
      // Timestamp functions
      getMemberTimestamp,
      formatTimestamp,
      
      // Methods
      openModal,
      closeModal,
      createWatchParty,
      joinWatchParty,
      handleLeaveRoom,
      handleForceSync,
      copyRoomLink
    };
  }
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
  font-size: 0.875rem;
  transition: all 0.3s ease;
  position: relative;
  white-space: nowrap;
  min-height: 44px; // Better touch targets

  &:hover {
    background: rgba(255, 82, 82, 0.2);
    border-color: rgba(255, 82, 82, 0.5);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(255, 82, 82, 0.3);
  }

  &:active {
    transform: translateY(0) scale(0.98);
    background: rgba(255, 82, 82, 0.25);
  }

  &:focus-visible {
    outline: 2px solid #ff5252;
    outline-offset: 2px;
  }

  // Remove hover effects on touch devices
  @media (hover: none) and (pointer: coarse) {
    &:hover {
      transform: none;
      background: rgba(255, 82, 82, 0.1);
      border-color: rgba(255, 82, 82, 0.3);
      box-shadow: none;
    }
  }

  &.connected {
    background: rgba(76, 175, 80, 0.15);
    border-color: rgba(76, 175, 80, 0.4);
    color: #4caf50;
    animation: pulse 2s infinite;

    &:hover {
      background: rgba(76, 175, 80, 0.25);
      border-color: rgba(76, 175, 80, 0.6);
      box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
    }

    &:active {
      background: rgba(76, 175, 80, 0.3);
    }

    // Remove connected hover effects on touch devices
    @media (hover: none) and (pointer: coarse) {
      &:hover {
        background: rgba(76, 175, 80, 0.15);
        border-color: rgba(76, 175, 80, 0.4);
        box-shadow: none;
      }
    }
  }

  .connection-indicator {
    width: 8px;
    height: 8px;
    background: #4caf50;
    border-radius: 50%;
    animation: pulse 2s infinite;
    flex-shrink: 0;
  }

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  .button-text {
    transition: all 0.3s ease;
    font-weight: 500;
    
    &.count-updated {
      color: #4caf50;
      animation: buttonCountPulse 1s ease;
    }
  }

  // Mobile responsive adjustments
  @media (max-width: 768px) {
    padding: 0.625rem 0.875rem;
    font-size: 0.875rem;
    border-radius: 10px;
    gap: 0.375rem;

    .button-text {
      display: none; // Hide text on mobile, controlled by parent
    }
    
    svg {
      margin-right: 0;
      width: 20px;
      height: 20px;
    }

    .connection-indicator {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 12px;
      height: 12px;
      border: 2px solid rgba(15, 16, 22, 0.8);
    }
  }

  @media (max-width: 640px) {
    padding: 0.5rem;
    min-width: 44px;
    justify-content: center;
    
    svg {
      width: 18px;
      height: 18px;
    }

    .connection-indicator {
      width: 10px;
      height: 10px;
    }
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
  max-width: 520px;
  max-height: 85vh;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: slideUp 0.3s ease;
  display: flex;
  flex-direction: column;
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
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 82, 82, 0.3) transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 82, 82, 0.3);
    border-radius: 3px;

    &:hover {
      background: rgba(255, 82, 82, 0.5);
    }
  }
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
  margin-top: 1.5rem;
}

.create-form,
.join-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

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
      padding: 0.875rem 1rem;
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
        box-shadow: 0 0 0 3px rgba(255, 82, 82, 0.1);
      }

      &::placeholder {
        color: #666;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 0.5rem;

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
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(76, 175, 80, 0.15) 100%);
    border: 1px solid rgba(76, 175, 80, 0.4);
    color: #4caf50;

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, rgba(76, 175, 80, 0.3) 0%, rgba(76, 175, 80, 0.25) 100%);
      border-color: rgba(76, 175, 80, 0.6);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
    }
  }

  &.join-btn {
    background: linear-gradient(135deg, rgba(33, 150, 243, 0.2) 0%, rgba(33, 150, 243, 0.15) 100%);
    border: 1px solid rgba(33, 150, 243, 0.4);
    color: #2196f3;

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, rgba(33, 150, 243, 0.3) 0%, rgba(33, 150, 243, 0.25) 100%);
      border-color: rgba(33, 150, 243, 0.6);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(33, 150, 243, 0.2);
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

// Connected State
.connected-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  .connection-status {
    .status-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;

      svg {
        width: 32px;
        height: 32px;
        color: #4caf50;
      }

      h3 {
        color: #fff;
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
      }
    }

    .room-info {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.25rem;

      .room-code-section {
        margin-bottom: 1rem;

        .room-code-label {
          display: block;
          color: #b0b0b0;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .room-code-display {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;

          .room-code {
            flex: 1;
            color: #fff;
            font-family: 'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'Ubuntu Mono', monospace;
            font-size: 1.125rem;
            font-weight: 600;
            letter-spacing: 0.1em;
          }

          .copy-btn {
            background: none;
            border: none;
            color: #4eb5ff;
            cursor: pointer;
            padding: 0.25rem;
            border-radius: 4px;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;

            &:hover {
              background: rgba(78, 181, 255, 0.1);
              color: #fff;
            }

            &.success {
              color: #4caf50;
            }

            svg {
              width: 18px;
              height: 18px;
            }
          }
        }
      }

      .share-btn {
        width: 100%;
        padding: 0.75rem 1rem;
        background: rgba(78, 181, 255, 0.15);
        border: 1px solid rgba(78, 181, 255, 0.3);
        border-radius: 8px;
        color: #4eb5ff;
        cursor: pointer;
        font-size: 0.875rem;
        font-weight: 500;
        transition: all 0.3s;

        &:hover {
          background: rgba(78, 181, 255, 0.25);
          border-color: rgba(78, 181, 255, 0.5);
        }

        &.success {
          background: rgba(76, 175, 80, 0.15);
          border-color: rgba(76, 175, 80, 0.3);
          color: #4caf50;
        }
      }
    }
  }

  .members-section {
    .members-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;

      h4 {
        color: #fff;
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
      }

      .member-count {
        background: rgba(76, 175, 80, 0.2);
        color: #4caf50;
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        transition: all 0.3s ease;

        &.updated {
          background: rgba(76, 175, 80, 0.4);
          color: #4caf50;
          transform: scale(1.1);
          animation: memberCountPulse 1s ease;
        }
      }
    }

    .member-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-height: 200px;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: rgba(255, 82, 82, 0.3) transparent;

      &::-webkit-scrollbar {
        width: 4px;
      }

      &::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 2px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(255, 82, 82, 0.3);
        border-radius: 2px;
      }

      .member-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        padding: 1.5rem;
        color: #b0b0b0;

        .spinner {
          width: 16px;
          height: 16px;
        }

        span {
          font-size: 0.875rem;
        }
      }

      .no-members {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        color: #888;
        font-size: 0.875rem;
      }
    }

    .member-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      transition: all 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.08);
      }

      &.host {
        background: rgba(255, 82, 82, 0.1);
        border-color: rgba(255, 82, 82, 0.2);

        &:hover {
          background: rgba(255, 82, 82, 0.15);
        }
      }

      &.current-user {
        background: rgba(76, 175, 80, 0.1);
        border-color: rgba(76, 175, 80, 0.3);
        position: relative;

        &:hover {
          background: rgba(76, 175, 80, 0.15);
        }

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(to bottom, #4caf50, #66bb6a);
          border-radius: 0 2px 2px 0;
        }

        .member-avatar {
          background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
          box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.3);
        }

        .member-name {
          color: #4caf50;
          font-weight: 600;
        }
      }

      .member-avatar {
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #4eb5ff 0%, #6366f1 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        svg {
          width: 16px;
          height: 16px;
          color: #fff;
        }
      }

      .member-info {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .member-name {
          color: #e1e1e1;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .member-badges {
          display: flex;
          align-items: center;
          gap: 0.5rem;

          .host-badge {
            background: rgba(255, 82, 82, 0.2);
            color: #ff5252;
            padding: 0.15rem 0.4rem;
            border-radius: 4px;
            font-size: 0.7rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .you-badge {
            background: rgba(76, 175, 80, 0.2);
            color: #4caf50;
            padding: 0.15rem 0.4rem;
            border-radius: 4px;
            font-size: 0.7rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border: 1px solid rgba(76, 175, 80, 0.3);
          }

          .timestamp-badge {
            background: rgba(59, 130, 246, 0.2);
            color: #3b82f6;
            padding: 0.15rem 0.4rem;
            border-radius: 4px;
            font-size: 0.7rem;
            font-weight: 500;
            font-family: monospace;
            border: 1px solid rgba(59, 130, 246, 0.3);
            min-width: 38px;
            text-align: center;
          }

          .online-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #6b7280;
            transition: all 0.3s;

            &.online {
              background: #10b981;
              box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
            }
          }
        }
      }
    }
  }

  .connected-actions {
    display: flex;
    gap: 0.75rem;

    .sync-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem 1.5rem;
      background: rgba(59, 130, 246, 0.15);
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 8px;
      color: #3b82f6;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.875rem;
      transition: all 0.3s;

      &:hover:not(:disabled) {
        background: rgba(59, 130, 246, 0.25);
        border-color: rgba(59, 130, 246, 0.5);
        transform: translateY(-1px);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }

      svg {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }
    }

    .leave-room-btn {
      flex: 1;
      padding: 0.875rem 1.5rem;
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 8px;
      color: #ef4444;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.875rem;
      transition: all 0.3s;

      &:hover {
        background: rgba(239, 68, 68, 0.25);
        border-color: rgba(239, 68, 68, 0.5);
        transform: translateY(-1px);
      }
    }
  }
}

// Server Warning
.server-warning {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #ef4444;
  margin-bottom: 1rem;

  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  p {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.4;
  }
}

// Error Message
.error-message {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #ef4444;
  margin-top: 1rem;

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    margin-top: 0.1rem;
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

@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

// Animations
@keyframes memberCountPulse {
  0% {
    transform: scale(1);
    background: rgba(76, 175, 80, 0.2);
  }
  50% {
    transform: scale(1.15);
    background: rgba(76, 175, 80, 0.5);
  }
  100% {
    transform: scale(1);
    background: rgba(76, 175, 80, 0.2);
  }
}

@keyframes buttonCountPulse {
  0% {
    color: inherit;
  }
  50% {
    color: #4caf50;
    text-shadow: 0 0 8px rgba(76, 175, 80, 0.5);
  }
  100% {
    color: inherit;
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