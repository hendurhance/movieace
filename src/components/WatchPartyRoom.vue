<template>
  <div>
    <!-- Watch Party Button -->
    <div class="watch-party-button" @click="showModal = true">
      <UsersIcon />
      <span>Watch Party</span>
      <span v-if="memberCount > 0" class="member-count">{{ memberCount }}</span>
    </div>

    <!-- Watch Party Modal -->
    <div class="watch-party-modal" v-if="showModal" @click.self="closeModal">
      <div class="modal-content">
        <!-- Modal Header -->
        <div class="modal-header">
          <h2>Watch Party</h2>
          <button class="close-button" @click="closeModal">
            <X />
          </button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body">
          <!-- Create/Join Room -->
          <div v-if="!isConnected" class="room-setup">
            <div class="setup-tabs">
              <button 
                :class="['tab-btn', { active: activeTab === 'create' }]"
                @click="activeTab = 'create'"
              >
                <PlusIcon />
                Create Room
              </button>
              <button 
                :class="['tab-btn', { active: activeTab === 'join' }]"
                @click="activeTab = 'join'"
              >
                <UserIcon />
                Join Room
              </button>
            </div>

            <!-- Create Room -->
            <div v-if="activeTab === 'create'" class="create-room">
              <div class="input-group">
                <label>Your Name</label>
                <input 
                  v-model="hostName" 
                  placeholder="Enter your name"
                  @keyup.enter="handleCreateRoom"
                  :disabled="isLoading"
                />
              </div>
              <button 
                class="action-btn primary"
                @click="handleCreateRoom"
                :disabled="!hostName.trim() || isLoading"
              >
                <div v-if="isLoading" class="spinner"></div>
                <PlusIcon v-else />
                Create Watch Party
              </button>
            </div>

            <!-- Join Room -->
            <div v-if="activeTab === 'join'" class="join-room">
              <div class="input-group">
                <label>Room Code</label>
                <input 
                  v-model="joinCode" 
                  placeholder="Enter room code"
                  @keyup.enter="handleJoinRoom"
                  :disabled="isLoading"
                />
              </div>
              <div class="input-group">
                <label>Your Name</label>
                <input 
                  v-model="memberName" 
                  placeholder="Enter your name"
                  @keyup.enter="handleJoinRoom"
                  :disabled="isLoading"
                />
              </div>
              <button 
                class="action-btn primary"
                @click="handleJoinRoom"
                :disabled="!joinCode.trim() || !memberName.trim() || isLoading"
              >
                <div v-if="isLoading" class="spinner"></div>
                <UserIcon v-else />
                Join Room
              </button>
            </div>
          </div>

          <!-- Room Connected -->
          <div v-else class="room-connected">
            <!-- Room Info -->
            <div class="room-info">
              <div class="room-header">
                <h3>
                  <UsersIcon />
                  Room {{ roomCode }}
                </h3>
                <button 
                  class="share-btn"
                  @click="shareRoom"
                  title="Share room link"
                >
                  <ShareIcon />
                </button>
              </div>
              
              <div class="member-count">
                {{ memberCount }} {{ memberCount === 1 ? 'member' : 'members' }} online
              </div>
            </div>

            <!-- Members List -->
            <div class="members-list">
              <h4>Members</h4>
              <div class="members">
                <div 
                  v-for="member in members" 
                  :key="member.id"
                  :class="['member-item', { host: member.is_host }]"
                >
                  <div class="member-info">
                    <UserIcon />
                    <span>{{ member.name }}</span>
                    <span v-if="member.is_host" class="host-badge">Host</span>
                  </div>
                  <div class="member-status online">●</div>
                </div>
              </div>
            </div>

            <!-- Debug Controls (Host Only) -->
            <div v-if="isHost" class="debug-section">
              <h4>Sync Controls</h4>
              <div class="debug-buttons">
                <button class="debug-btn" @click="testPlayEvent">
                  <PlayIcon />
                  Test Play
                </button>
                <button class="debug-btn" @click="testPauseEvent">
                  <PauseIcon />
                  Test Pause
                </button>
                <button class="debug-btn" @click="testSeekEvent">
                  <SkipForwardIcon />
                  Test Seek
                </button>
              </div>
            </div>

            <!-- Room Actions -->
            <div class="room-actions">
              <button class="action-btn secondary" @click="leaveRoom">
                <LogOutIcon />
                Leave Room
              </button>
            </div>
          </div>

          <!-- Error State -->
          <div v-if="error" class="error-state">
            <AlertTriangleIcon />
            <p>{{ error }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Share Modal -->
    <div class="share-modal" v-if="showShareModal" @click.self="showShareModal = false">
      <div class="share-content">
        <h3>Share Watch Party</h3>
        <div class="share-link">
          <input 
            ref="shareLinkInput"
            :value="shareLink"
            readonly
          />
          <button class="copy-btn" @click="copyShareLink">
            <CopyIcon />
            {{ copiedLink ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <p class="share-help">Send this link to friends so they can join your watch party</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, nextTick, PropType } from 'vue';
import { useWatchPartyRoom } from '../composables/useWatchPartyRoom';

// Icons
import UsersIcon from './svg/outline/users.vue';
import UserIcon from './svg/outline/user.vue';
import PlusIcon from './svg/outline/plus.vue';
import X from './svg/outline/x.vue';
import ShareIcon from './svg/outline/share.vue';
import CopyIcon from './svg/outline/copy.vue';
import LogOutIcon from './svg/outline/log-out.vue';
import AlertTriangleIcon from './svg/outline/alert-triangle.vue';
import PlayIcon from './svg/outline/play.vue';
import PauseIcon from './svg/outline/play.vue'; // Using play icon for pause too
import SkipForwardIcon from './svg/outline/arrow-right.vue';
import LinkIcon from './svg/outline/link.vue';

export default defineComponent({
  name: 'WatchPartyRoom',
  components: {
    UsersIcon,
    UserIcon,
    PlusIcon,
    X,
    ShareIcon,
    CopyIcon,
    LogOutIcon,
    AlertTriangleIcon,
    PlayIcon,
    PauseIcon,
    SkipForwardIcon,
    LinkIcon
  },
  props: {
    mediaData: {
      type: Object as PropType<any>,
      default: null
    }
  },
  setup(props, { emit }) {
    const {
      currentRoom,
      members,
      isConnected,
      isLoading,
      error,
      currentMember,
      isHost,
      roomCode,
      memberCount,
      createRoom,
      joinRoom,
      leaveRoom: leaveRoomAction,
      syncPlayback,
      getShareableLink
    } = useWatchPartyRoom();

    // Modal state
    const showModal = ref(false);
    const showShareModal = ref(false);
    const activeTab = ref<'create' | 'join'>('create');

    // Form data
    const hostName = ref('');
    const joinCode = ref('');
    const memberName = ref('');
    const copiedLink = ref(false);
    const shareLinkInput = ref<HTMLInputElement>();

    // Share functionality
    const shareLink = ref('');
    
    const shareRoom = () => {
      shareLink.value = getShareableLink();
      showShareModal.value = true;
      
      nextTick(() => {
        if (shareLinkInput.value) {
          shareLinkInput.value.select();
        }
      });
    };

    const copyShareLink = async () => {
      try {
        await navigator.clipboard.writeText(shareLink.value);
        copiedLink.value = true;
        setTimeout(() => {
          copiedLink.value = false;
        }, 2000);
      } catch (error) {
        console.error('Failed to copy link:', error);
        // Fallback selection
        if (shareLinkInput.value) {
          shareLinkInput.value.select();
        }
      }
    };

    // Room actions
    const handleCreateRoom = async () => {
      if (!hostName.value.trim()) return;
      
      const roomCode = await createRoom(hostName.value, props.mediaData);
      if (roomCode) {
        console.log('Room created:', roomCode);
        emit('room-created', { roomCode, isHost: true });
      }
    };

    const handleJoinRoom = async () => {
      if (!joinCode.value.trim() || !memberName.value.trim()) return;
      
      const success = await joinRoom(joinCode.value, memberName.value);
      if (success) {
        console.log('Joined room successfully');
        emit('room-joined', { roomCode: joinCode.value, isHost: false });
      }
    };

    const leaveRoom = async () => {
      await leaveRoomAction();
      showModal.value = false;
      emit('room-left');
    };

    const closeModal = () => {
      showModal.value = false;
      showShareModal.value = false;
    };

    // Debug functions for testing
    const testPlayEvent = async () => {
      if (!currentRoom.value) return;
      console.log('Testing play event');
      await syncPlayback('play', { currentTime: 0 });
    };

    const testPauseEvent = async () => {
      if (!currentRoom.value) return;
      console.log('Testing pause event');
      await syncPlayback('pause', { currentTime: 0 });
    };

    const testSeekEvent = async () => {
      if (!currentRoom.value) return;
      console.log('Testing seek event');
      await syncPlayback('seek', { time: 30 });
    };

    // Check for room code in URL on mount
    onMounted(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room');
      
      if (roomParam && !isConnected.value) {
        joinCode.value = roomParam;
        activeTab.value = 'join';
        showModal.value = true;
      }
    });

    return {
      // State
      showModal,
      showShareModal,
      activeTab,
      hostName,
      joinCode,
      memberName,
      copiedLink,
      shareLinkInput,
      shareLink,
      
      // Watch party state
      currentRoom,
      members,
      isConnected,
      isLoading,
      error,
      isHost,
      roomCode,
      memberCount,
      
      // Actions
      handleCreateRoom,
      handleJoinRoom,
      leaveRoom,
      closeModal,
      shareRoom,
      copyShareLink,
      
      // Debug
      testPlayEvent,
      testPauseEvent,
      testSeekEvent
    };
  }
});
</script>

<style lang="scss" scoped>
.watch-party-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #ff5252 0%, #ff7979 100%);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s;

  svg {
    width: 18px;
    height: 18px;
  }

  .member-count {
    background: rgba(255, 255, 255, 0.2);
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 82, 82, 0.3);
  }
}

.watch-party-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);

  .modal-content {
    background: linear-gradient(135deg, rgba(31, 33, 48, 0.95) 0%, rgba(44, 47, 69, 0.9) 100%);
    border-radius: 16px;
    padding: 2rem;
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
    border: 1px solid rgba(255, 255, 255, 0.1);

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      h2 {
        margin: 0;
        color: #fff;
        font-size: 1.5rem;
      }

      .close-button {
        background: none;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 4px;
        
        &:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.1);
        }

        svg {
          width: 20px;
          height: 20px;
        }
      }
    }

    .modal-body {
      .room-setup {
        .setup-tabs {
          display: flex;
          margin-bottom: 2rem;
          gap: 1rem;

          .tab-btn {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.75rem 1rem;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: #9ca3af;
            cursor: pointer;
            transition: all 0.3s;

            &.active {
              background: rgba(255, 82, 82, 0.2);
              border-color: #ff5252;
              color: #fff;
            }

            svg {
              width: 16px;
              height: 16px;
            }
          }
        }

        .input-group {
          margin-bottom: 1.5rem;

          label {
            display: block;
            margin-bottom: 0.5rem;
            color: #e1e1e1;
            font-weight: 500;
          }

          input {
            width: 100%;
            padding: 0.875rem 1rem;
            background: rgba(31, 33, 48, 0.8);
            border: 2px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: #fff;
            font-size: 1rem;
            transition: all 0.3s;

            &:focus {
              outline: none;
              border-color: #ff5252;
              box-shadow: 0 0 0 3px rgba(255, 82, 82, 0.1);
            }

            &::placeholder {
              color: #9ca3af;
            }
          }
        }
      }

      .room-connected {
        .room-info {
          .room-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;

            h3 {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              margin: 0;
              color: #fff;
              font-size: 1.25rem;

              svg {
                width: 20px;
                height: 20px;
                color: #ff5252;
              }
            }

            .share-btn {
              background: rgba(255, 255, 255, 0.1);
              border: none;
              border-radius: 6px;
              padding: 0.5rem;
              color: #9ca3af;
              cursor: pointer;
              transition: all 0.3s;

              &:hover {
                background: rgba(255, 255, 255, 0.15);
                color: #fff;
              }

              svg {
                width: 16px;
                height: 16px;
              }
            }
          }

          .member-count {
            color: #9ca3af;
            font-size: 0.875rem;
            margin-bottom: 2rem;
          }
        }

        .members-list {
          margin-bottom: 2rem;

          h4 {
            margin: 0 0 1rem 0;
            color: #e1e1e1;
            font-size: 1rem;
          }

          .members {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;

            .member-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 0.875rem 1rem;
              background: rgba(255, 255, 255, 0.05);
              border-radius: 8px;
              border: 1px solid rgba(255, 255, 255, 0.1);

              &.host {
                border-color: rgba(255, 82, 82, 0.3);
                background: rgba(255, 82, 82, 0.1);
              }

              .member-info {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                color: #fff;

                svg {
                  width: 16px;
                  height: 16px;
                  color: #9ca3af;
                }

                .host-badge {
                  background: #ff5252;
                  color: #fff;
                  padding: 0.25rem 0.5rem;
                  border-radius: 12px;
                  font-size: 0.75rem;
                  font-weight: 600;
                }
              }

              .member-status {
                &.online {
                  color: #10b981;
                  font-size: 1.2rem;
                }
              }
            }
          }
        }

        .debug-section {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 8px;

          h4 {
            margin: 0 0 1rem 0;
            color: #60a5fa;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .debug-buttons {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;

            .debug-btn {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              padding: 0.5rem 1rem;
              background: rgba(59, 130, 246, 0.2);
              border: 1px solid rgba(59, 130, 246, 0.3);
              border-radius: 6px;
              color: #60a5fa;
              cursor: pointer;
              font-size: 0.875rem;
              transition: all 0.3s;

              &:hover {
                background: rgba(59, 130, 246, 0.3);
                border-color: #60a5fa;
              }

              svg {
                width: 14px;
                height: 14px;
              }
            }
          }
        }
      }

      .action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        width: 100%;
        padding: 0.875rem 1.5rem;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s;

        &.primary {
          background: linear-gradient(135deg, #ff5252 0%, #ff7979 100%);
          color: #fff;

          &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(255, 82, 82, 0.3);
          }

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }

        &.secondary {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #e1e1e1;

          &:hover {
            background: rgba(255, 255, 255, 0.15);
          }
        }

        svg {
          width: 18px;
          height: 18px;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top: 2px solid #fff;
          animation: spin 1s linear infinite;
        }
      }

      .error-state {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.2);
        border-radius: 8px;
        color: #fca5a5;
        margin-bottom: 1rem;

        svg {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        p {
          margin: 0;
        }
      }
    }
  }
}

.share-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;

  .share-content {
    background: linear-gradient(135deg, rgba(31, 33, 48, 0.95) 0%, rgba(44, 47, 69, 0.9) 100%);
    border-radius: 16px;
    padding: 2rem;
    width: 90%;
    max-width: 500px;
    border: 1px solid rgba(255, 255, 255, 0.1);

    h3 {
      margin: 0 0 1.5rem 0;
      color: #fff;
      text-align: center;
    }

    .share-link {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1rem;

      input {
        flex: 1;
        padding: 0.875rem 1rem;
        background: rgba(31, 33, 48, 0.8);
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        color: #fff;
        font-size: 0.875rem;
        
        &:focus {
          outline: none;
          border-color: #ff5252;
        }
      }

      .copy-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.875rem 1rem;
        background: #ff5252;
        border: none;
        border-radius: 8px;
        color: #fff;
        cursor: pointer;
        font-size: 0.875rem;
        transition: all 0.3s;

        &:hover {
          background: #ff4444;
        }

        svg {
          width: 16px;
          height: 16px;
        }
      }
    }

    .share-help {
      margin: 0;
      color: #9ca3af;
      font-size: 0.875rem;
      text-align: center;
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .watch-party-modal .modal-content {
    width: 95%;
    padding: 1.5rem;
    margin: 1rem;
  }

  .share-modal .share-content {
    width: 95%;
    padding: 1.5rem;
    margin: 1rem;

    .share-link {
      flex-direction: column;
    }
  }
}
</style>
