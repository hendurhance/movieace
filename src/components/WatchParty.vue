<template>
  <div>
    <!-- Watch Party Button -->
    <div class="watch-party-button" @click="openModal" :class="{ active: isConnected }">
      <UsersIcon />
      <span v-if="isConnected">{{ memberCount }} {{ memberCount === 1 ? 'viewer' : 'viewers' }}</span>
      <span v-else>Watch Party</span>
    </div>

    <!-- Watch Party Modal -->
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

        <!-- Connected State -->
        <div v-if="isConnected" class="connected-state">
          <div class="room-info">
            <div class="room-header">
              <h3>Room {{ roomCode }}</h3>
              <span class="live-indicator">
                <div class="pulse"></div>
                Live
              </span>
            </div>
            
            <div class="current-media" v-if="currentRoom?.current_media">
              <FilmIcon />
              <div>
                <h4>{{ currentRoom.current_media.title }}</h4>
                <p v-if="currentRoom.current_media.season">
                  Season {{ currentRoom.current_media.season }}, Episode {{ currentRoom.current_media.episode }}
                </p>
              </div>
            </div>
          </div>

          <div class="members-section">
            <h4>
              <UsersIcon />
              Members ({{ memberCount }})
            </h4>
            <div class="members-list">
              <div 
                v-for="member in members" 
                :key="member.id" 
                class="member-item"
                :class="{ host: member.is_host, you: member.id === currentMember?.id }"
              >
                <div class="member-avatar">
                  <UserIcon />
                </div>
                <div class="member-info">
                  <span class="member-name">
                    {{ member.name }}
                    <span v-if="member.is_host" class="host-badge">Host</span>
                    <span v-if="member.id === currentMember?.id" class="you-badge">You</span>
                  </span>
                  <span class="member-status" :class="{ online: member.is_online }">
                    {{ member.is_online ? 'Online' : 'Offline' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="room-actions">
            <button class="action-btn share-btn" @click="shareRoom">
              <ShareIcon />
              Share Room
            </button>
            <button class="action-btn leave-btn" @click="confirmLeave">
              <LogOutIcon />
              Leave Room
            </button>
          </div>
        </div>

        <!-- Not Connected State -->
        <div v-else class="disconnected-state">
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
          <div v-if="mode" class="form-section">
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

          <!-- Error Display -->
          <div v-if="error" class="error-message">
            <AlertTriangleIcon />
            <p>{{ error }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Share Modal -->
    <div v-if="showShareModal" class="share-modal" @click.self="showShareModal = false">
      <div class="share-content">
        <h3>Share Watch Party</h3>
        <div class="share-options">
          <div class="share-option">
            <label>Room Code</label>
            <div class="code-display">
              <span class="room-code">{{ roomCode }}</span>
              <button @click="copyCode" class="copy-btn">
                <CopyIcon />
              </button>
            </div>
          </div>
          <div class="share-option">
            <label>Shareable Link</label>
            <div class="link-display">
              <input :value="shareableLink" readonly />
              <button @click="copyLink" class="copy-btn">
                <CopyIcon />
              </button>
            </div>
          </div>
        </div>
        <button @click="showShareModal = false" class="close-share-btn">Close</button>
      </div>
    </div>

    <!-- Leave Confirmation -->
    <div v-if="showLeaveConfirm" class="leave-confirmation" @click.self="showLeaveConfirm = false">
      <div class="confirm-content">
        <h3>Leave Watch Party?</h3>
        <p>Are you sure you want to leave the watch party?</p>
        <div class="confirm-actions">
          <button @click="showLeaveConfirm = false" class="cancel-btn">Cancel</button>
          <button @click="leaveWatchParty" class="leave-btn">Leave</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useWatchPartySync, type MediaInfo } from '../composables/useWatchPartySync';
import { useWatchPartyRoom } from '../composables/useWatchPartyRoom';

// Import icons
import UsersIcon from './svg/outline/users.vue';
import UserIcon from './svg/outline/user.vue';
import FilmIcon from './svg/outline/film.vue';
import PlusIcon from './svg/outline/plus.vue';
import LinkIcon from './svg/outline/link.vue';
import ShareIcon from './svg/outline/share.vue';
import LogOutIcon from './svg/outline/log-out.vue';
import XIcon from './svg/outline/x.vue';
import CopyIcon from './svg/outline/copy.vue';
import AlertTriangleIcon from './svg/outline/alert-triangle.vue';

export default defineComponent({
  name: 'WatchParty',
  components: {
    UsersIcon,
    UserIcon,
    FilmIcon,
    PlusIcon,
    LinkIcon,
    ShareIcon,
    LogOutIcon,
    XIcon,
    CopyIcon,
    AlertTriangleIcon,
  },
  props: {
    mediaData: {
      type: Object as () => MediaInfo | null,
      default: null,
    },
    enableSync: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['sync-request', 'media-change'],
  setup(props, { emit }) {
    // Watch Party Sync composable
    const watchPartySync = useWatchPartySync();
    const {
      currentRoom,
      members,
      isConnected,
      isHost,
      memberCount,
      currentMedia,
      createRoom,
      joinRoom,
      leaveRoom,
      getRoomShareLink,
      checkAutoJoin,
      handleSyncRequest,
      setCurrentMedia,
    } = watchPartySync;

    // Get current member from the original composable
    const { currentMember } = useWatchPartyRoom();

    // Local state
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    // Modal state
    const showModal = ref(false);
    const showShareModal = ref(false);
    const showLeaveConfirm = ref(false);
    const mode = ref<'create' | 'join' | null>(null);

    // Form data
    const hostName = ref('');
    const memberName = ref('');
    const joinCode = ref('');

    // Computed
    const roomCode = computed(() => currentRoom.value?.room_code || '');
    const shareableLink = computed(() => getRoomShareLink());

    // Sync handler - proxy to parent component
    const onSyncRequest = (syncData: any) => {
      handleSyncRequest(syncData);
      emit('sync-request', syncData);
    };

    // Watch media data changes
    const updateMediaData = () => {
      if (props.mediaData) {
        console.log('Updating media data in WatchParty:', props.mediaData);
        setCurrentMedia(props.mediaData);
        emit('media-change', props.mediaData);
      }
    };

    // Methods
    function openModal() {
      showModal.value = true;
      if (!isConnected.value) {
        mode.value = null;
      }
    }

    function closeModal() {
      showModal.value = false;
      if (!isConnected.value) {
        mode.value = null;
        hostName.value = '';
        memberName.value = '';
        joinCode.value = '';
        error.value = null;
      }
    }

    async function createWatchParty() {
      if (!hostName.value.trim()) return;
      if (!props.mediaData) {
        error.value = 'No media data available';
        return;
      }

      isLoading.value = true;
      error.value = null;

      try {
        const roomCode = await createRoom(hostName.value.trim(), {
          type: props.mediaData.type,
          id: props.mediaData.id,
          title: props.mediaData.title,
          season: props.mediaData.season,
          episode: props.mediaData.episode,
          server_url: props.mediaData.streamUrl
        });

        if (roomCode) {
          console.log('Watch party room created:', roomCode);
          // Reset form
          hostName.value = '';
          mode.value = null;
        }
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to create room';
      } finally {
        isLoading.value = false;
      }
    }

    async function joinWatchParty() {
      if (!memberName.value.trim() || !joinCode.value.trim()) return;
      if (!props.mediaData) {
        error.value = 'No media data available';
        return;
      }

      isLoading.value = true;
      error.value = null;

      try {
        const success = await joinRoom(
          joinCode.value.trim(),
          memberName.value.trim(),
        );

        if (success) {
          console.log('Successfully joined watch party');
          // Reset form
          memberName.value = '';
          joinCode.value = '';
          mode.value = null;
        }
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to join room';
      } finally {
        isLoading.value = false;
      }
    }

    function shareRoom() {
      showShareModal.value = true;
    }

    function confirmLeave() {
      showLeaveConfirm.value = true;
    }

    async function leaveWatchParty() {
      await leaveRoom();
      showLeaveConfirm.value = false;
      showModal.value = false;
    }

    async function copyCode() {
      try {
        await navigator.clipboard.writeText(roomCode.value);
        // You could add a toast notification here
        console.log('Room code copied to clipboard');
      } catch (err) {
        console.error('Failed to copy code:', err);
      }
    }

    async function copyLink() {
      try {
        await navigator.clipboard.writeText(shareableLink.value);
        // You could add a toast notification here
        console.log('Share link copied to clipboard');
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }

    // Check for room code in URL on mount
    onMounted(() => {
      updateMediaData();

      const autoJoinCode = checkAutoJoin();
      if (autoJoinCode) {
        joinCode.value = autoJoinCode;
        mode.value = 'join';
        showModal.value = true;
      }
    });

    // Update media data when props change
    onMounted(() => {
      updateMediaData();
    });

    return {
      // Watch Party State
      currentRoom,
      members,
      currentMember,
      isConnected,
      isLoading,
      error,
      isHost,
      roomCode,
      memberCount,
      currentMedia,

      // Modal State
      showModal,
      showShareModal,
      showLeaveConfirm,
      mode,

      // Form Data
      hostName,
      memberName,
      joinCode,

      // Computed
      shareableLink,

      // Methods
      openModal,
      closeModal,
      createWatchParty,
      joinWatchParty,
      shareRoom,
      confirmLeave,
      leaveWatchParty,
      copyCode,
      copyLink,
      onSyncRequest,
      updateMediaData,
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
  transition: all 0.3s;
  font-size: 0.875rem;
  font-weight: 500;

  &:hover {
    background: rgba(255, 82, 82, 0.2);
    border-color: rgba(255, 82, 82, 0.5);
    transform: translateY(-1px);
  }

  &.active {
    background: rgba(76, 175, 80, 0.1);
    border-color: rgba(76, 175, 80, 0.3);
    color: #4caf50;

    &:hover {
      background: rgba(76, 175, 80, 0.2);
      border-color: rgba(76, 175, 80, 0.5);
    }
  }

  svg {
    width: 18px;
    height: 18px;
  }
}

// Modal Base Styles
.watch-party-modal,
.share-modal,
.leave-confirmation {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  z-index: 9999;
  animation: fadeIn 0.3s ease-out;
  margin: 0 !important;
  padding: 0 !important;
}

.modal-content,
.share-content,
.confirm-content {
  background: linear-gradient(135deg, rgba(20, 20, 30, 0.95), rgba(30, 30, 45, 0.95));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  max-width: 500px;
  width: 90vw;
  max-height: 75vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
  margin: 0 !important;
  position: relative;
  overflow: hidden;
}

// Modal Header
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;

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

// Connected State
.connected-state {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
}

.room-info {
  margin-bottom: 2rem;

  .room-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;

    h3 {
      margin: 0;
      color: #fff;
      font-size: 1.125rem;
      font-weight: 600;
    }

    .live-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #4caf50;
      font-size: 0.875rem;
      font-weight: 500;

      .pulse {
        width: 8px;
        height: 8px;
        background: #4caf50;
        border-radius: 50%;
        animation: pulse 2s infinite;
      }
    }
  }

  .current-media {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);

    svg {
      width: 24px;
      height: 24px;
      color: #ff5252;
      flex-shrink: 0;
    }

    h4 {
      margin: 0 0 0.25rem 0;
      color: #fff;
      font-size: 1rem;
      font-weight: 600;
    }

    p {
      margin: 0;
      color: #b0b0b0;
      font-size: 0.875rem;
    }
  }
}

// Members Section
.members-section {
  margin-bottom: 2rem;

  h4 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 1rem 0;
    color: #fff;
    font-size: 1rem;
    font-weight: 600;

    svg {
      width: 20px;
      height: 20px;
      color: #ff5252;
    }
  }
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &.host {
    background: rgba(255, 82, 82, 0.1);
    border-color: rgba(255, 82, 82, 0.3);
  }

  &.you {
    background: rgba(76, 175, 80, 0.1);
    border-color: rgba(76, 175, 80, 0.3);
  }

  .member-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    color: #b0b0b0;

    svg {
      width: 20px;
      height: 20px;
    }
  }

  .member-info {
    flex: 1;

    .member-name {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #fff;
      font-weight: 500;
      margin-bottom: 0.25rem;

      .host-badge,
      .you-badge {
        padding: 0.125rem 0.5rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 500;
      }

      .host-badge {
        background: rgba(255, 82, 82, 0.2);
        color: #ff5252;
      }

      .you-badge {
        background: rgba(76, 175, 80, 0.2);
        color: #4caf50;
      }
    }

    .member-status {
      color: #999;
      font-size: 0.8rem;

      &.online {
        color: #4caf50;
      }
    }
  }
}

// Room Actions
.room-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  border: none;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;

  svg {
    width: 18px;
    height: 18px;
  }

  &.share-btn {
    background: rgba(33, 150, 243, 0.1);
    border: 1px solid rgba(33, 150, 243, 0.3);
    color: #2196f3;

    &:hover {
      background: rgba(33, 150, 243, 0.2);
      border-color: rgba(33, 150, 243, 0.5);
    }
  }

  &.leave-btn {
    background: rgba(244, 67, 54, 0.1);
    border: 1px solid rgba(244, 67, 54, 0.3);
    color: #f44336;

    &:hover {
      background: rgba(244, 67, 54, 0.2);
      border-color: rgba(244, 67, 54, 0.5);
    }
  }
}

// Disconnected State
.disconnected-state {
  padding: 1.5rem 1.5rem 2.5rem 1.5rem;
  flex: 1;
  overflow-y: auto;
}

.intro-section {
  text-align: center;
  margin-bottom: 2rem;

  .intro-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    background: rgba(255, 82, 82, 0.1);
    border: 2px solid rgba(255, 82, 82, 0.3);
    border-radius: 50%;
    margin: 0 auto 1rem;

    svg {
      width: 40px;
      height: 40px;
      color: #ff5252;
    }
  }

  h3 {
    margin: 0 0 0.5rem 0;
    color: #fff;
    font-size: 1.5rem;
    font-weight: 600;
  }

  p {
    margin: 0;
    color: #b0b0b0;
    font-size: 1rem;
  }
}

// Action Cards
.action-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.action-card {
  padding: 1.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;

  &:hover,
  &.active {
    background: rgba(255, 82, 82, 0.1);
    border-color: rgba(255, 82, 82, 0.3);
    transform: translateY(-2px);
  }

  .card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    margin: 0 auto 1rem;

    svg {
      width: 24px;
      height: 24px;
      color: #ff5252;
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
    color: #b0b0b0;
    font-size: 0.875rem;
  }
}

// Form Section
.form-section {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
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
    padding: 0.875rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: #fff;
    font-size: 1rem;
    transition: all 0.3s;

    &::placeholder {
      color: #999;
    }

    &:focus {
      outline: none;
      border-color: #ff5252;
      background: rgba(255, 255, 255, 0.08);
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

// Error Message
.error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 12px;
  margin-top: 1rem;

  svg {
    width: 20px;
    height: 20px;
    color: #f44336;
    flex-shrink: 0;
  }

  p {
    margin: 0;
    color: #f44336;
    font-size: 0.875rem;
  }
}

// Share Modal
.share-content {
  padding: 1.5rem;

  h3 {
    margin: 0 0 1.5rem 0;
    color: #fff;
    font-size: 1.25rem;
    font-weight: 600;
    text-align: center;
  }
}

.share-options {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.share-option {
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #fff;
    font-weight: 500;
    font-size: 0.875rem;
  }

  .code-display,
  .link-display {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .room-code {
      flex: 1;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      color: #fff;
      font-size: 1.5rem;
      font-weight: 600;
      text-align: center;
      letter-spacing: 0.2em;
    }

    input {
      flex: 1;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      color: #fff;
      font-size: 0.875rem;
    }

    .copy-btn {
      padding: 1rem;
      background: rgba(33, 150, 243, 0.1);
      border: 1px solid rgba(33, 150, 243, 0.3);
      border-radius: 8px;
      color: #2196f3;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background: rgba(33, 150, 243, 0.2);
        border-color: rgba(33, 150, 243, 0.5);
      }

      svg {
        width: 20px;
        height: 20px;
      }
    }
  }
}

.close-share-btn {
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }
}

// Leave Confirmation
.confirm-content {
  padding: 2rem;
  text-align: center;

  h3 {
    margin: 0 0 1rem 0;
    color: #fff;
    font-size: 1.25rem;
    font-weight: 600;
  }

  p {
    margin: 0 0 2rem 0;
    color: #b0b0b0;
    font-size: 1rem;
  }

  .confirm-actions {
    display: flex;
    gap: 1rem;

    button {
      flex: 1;
      padding: 1rem;
      border: none;
      border-radius: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s;
    }

    .cancel-btn {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #fff;

      &:hover {
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.3);
      }
    }

    .leave-btn {
      background: rgba(244, 67, 54, 0.1);
      border: 1px solid rgba(244, 67, 54, 0.3);
      color: #f44336;

      &:hover {
        background: rgba(244, 67, 54, 0.2);
        border-color: rgba(244, 67, 54, 0.5);
      }
    }
  }
}

// Spinner Animation
.spinner {
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-left-color: currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

// Keyframe Animations
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
    transform: translateY(30px);
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
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

// Mobile Responsiveness
@media (max-width: 768px) {
  .modal-content,
  .share-content,
  .confirm-content {
    width: 95vw;
    max-height: 90vh;
  }

  .action-cards {
    grid-template-columns: 1fr;
  }

  .room-actions {
    flex-direction: column;
  }

  .confirm-actions {
    flex-direction: column;
  }
}

/* Watch Party Modal Styles */
.watch-party-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;

  .modal-content {
    background-color: #1a1b26;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
    overflow: hidden;

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: #fff;
      }

      .close-button {
        background: none;
        border: none;
        color: #999;
        cursor: pointer;
        padding: 5px;

        &:hover {
          color: #fff;
        }
      }
    }

    .modal-body {
      padding: 2rem;

      .loading-state,
      .error-state,
      .success-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        min-height: 200px;
        justify-content: center;

        p {
          margin-top: 1rem;
          color: #e1e1e1;
          font-size: 1.1rem;
        }
      }

      .error-state svg {
        color: #ff5252;
        margin-bottom: 1rem;
      }

      .success-state {
        .movie-confirmation {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 2rem;

          svg {
            color: #4CAF50;
            margin-bottom: 1rem;
          }

          h3 {
            font-size: 1.5rem;
            font-weight: 600;
            margin: 0;
            text-align: center;
          }
        }

        .quality-selection {
          margin-bottom: 1.5rem;
          width: 100%;

          label {
            display: block;
            margin-bottom: 0.5rem;
            color: #e1e1e1;
            font-weight: 500;
          }

          select {
            width: 100%;
            padding: 0.75rem;
            border-radius: 6px;
            background-color: #252632;
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #fff;
            font-size: 1rem;
            outline: none;
            cursor: pointer;

            &:focus {
              border-color: #ff5252;
            }

            option {
              background-color: #252632;
            }
          }
        }

        .subtitle-info {
          margin-bottom: 1.5rem;
          width: 100%;

          p {
            display: flex;
            align-items: center;
            color: #4CAF50;
            margin-bottom: 1rem;

            svg {
              margin-right: 0.5rem;
            }
          }

          .subtitle-download {
            margin-top: 0.75rem;

            label {
              display: block;
              margin-bottom: 0.5rem;
              color: #e1e1e1;
              font-weight: 500;
            }

            .subtitle-select-container {
              display: flex;
              gap: 0.5rem;

              a {
                background-color: #3a3c4e;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                color: #fff;
                font-size: 0.9rem;
                text-decoration: none;
                display: flex;
                align-items: center;
                transition: all 0.2s;

                &:hover {
                  background-color: #4a4c5e;
                }

                svg {
                  margin-right: 0.5rem;
                }
              }

              select {
                flex: 1;
                padding: 0.5rem;
                border-radius: 6px;
                background-color: #252632;
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #fff;
                font-size: 0.9rem;
                outline: none;

                &:focus {
                  border-color: #ff5252;
                }

                option {
                  background-color: #252632;
                }
              }
            }
          }
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;

          .start-party-button,
          .download-button {
            width: 100%;
            padding: 0.75rem;
            border-radius: 6px;
            color: #fff;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: all 0.2s;
            text-decoration: none;

            svg {
              margin-right: 0.5rem;
            }
          }

          .start-party-button {
            background-color: #ff5252;
            border: none;

            &:hover {
              background-color: #ff3333;
              transform: translateY(-2px);
            }
          }

          .download-button {
            background-color: #3a3c4e;
            border: none;

            &:hover {
              background-color: #4a4c5e;
            }

            &.subtitle {
              padding: 0.5rem;
              font-size: 0.9rem;
            }
          }
        }
      }
    }
  }
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top: 4px solid #ff5252;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
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
  .watch-party-button span {
    display: none;
  }
}
</style>