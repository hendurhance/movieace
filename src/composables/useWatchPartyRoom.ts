import { ref, computed, onUnmounted } from 'vue';
import { supabase, WatchPartyRoom, WatchPartyMember, WatchPartyEvent, watchPartyApi } from '../utils/supabase';

export function useWatchPartyRoom() {
  // State
  const currentRoom = ref<WatchPartyRoom | null>(null);
  const members = ref<WatchPartyMember[]>([]);
  const isConnected = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const currentMember = ref<WatchPartyMember | null>(null);

  // Realtime subscriptions
  let roomSubscription: any = null;
  let membersSubscription: any = null;
  let eventsSubscription: any = null;

  // State persistence keys
  const STORAGE_KEY = 'movieace_watch_party_state';

  // Load persisted state on initialization
  const loadPersistedState = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const state = JSON.parse(stored);
        if (state.currentRoom && state.currentMember) {
          currentRoom.value = state.currentRoom;
          currentMember.value = state.currentMember;
          isConnected.value = true;
          // Reconnect to room
          subscribeToRoom(state.currentRoom.id);
          loadMembers(state.currentRoom.id);
        }
      }
    } catch (err) {
      console.error('Failed to load persisted state:', err);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Save state to localStorage
  const saveState = () => {
    try {
      const state = {
        currentRoom: currentRoom.value,
        currentMember: currentMember.value,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error('Failed to save state:', err);
    }
  };

  // Clear persisted state
  const clearState = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  // Computed
  const isHost = computed(() => currentMember.value?.is_host || false);
  const roomCode = computed(() => currentRoom.value?.room_code || '');
  const memberCount = computed(() => members.value.length);

  // Create a new watch party room
  async function createRoom(hostName: string, mediaData?: any): Promise<string | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const { room, member } = await watchPartyApi.createRoom(hostName, mediaData);
      
      currentRoom.value = room;
      currentMember.value = member;
      members.value = [member];
      isConnected.value = true;

      // Save state for persistence
      saveState();

      // Subscribe to real-time updates
      subscribeToRoom(room.id);
      
      return room.room_code;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create room';
      console.error('Create room error:', err);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  // Join an existing watch party room
  async function joinRoom(roomCode: string, memberName: string): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      const { room, member } = await watchPartyApi.joinRoom(roomCode, memberName);
      
      currentRoom.value = room;
      currentMember.value = member;
      isConnected.value = true;

      // Load existing members
      await loadMembers(room.id);

      // Save state for persistence
      saveState();

      // Subscribe to real-time updates
      subscribeToRoom(room.id);
      
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to join room';
      console.error('Join room error:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  // Load room members
  async function loadMembers(roomId: string) {
    try {
      const membersList = await watchPartyApi.getRoomMembers(roomId);
      members.value = membersList;
      console.log('Loaded members:', membersList);
    } catch (err) {
      console.error('Failed to load members:', err);
    }
  }

  // Subscribe to room real-time updates
  function subscribeToRoom(roomId: string) {
    console.log('Subscribing to room:', roomId);
    
    // Clean up existing subscriptions first (but don't clear state)
    if (roomSubscription) {
      supabase.removeChannel(roomSubscription);
      roomSubscription = null;
    }
    if (membersSubscription) {
      supabase.removeChannel(membersSubscription);
      membersSubscription = null;
    }
    if (eventsSubscription) {
      supabase.removeChannel(eventsSubscription);
      eventsSubscription = null;
    }

    // Subscribe to room changes
    roomSubscription = supabase
      .channel(`room_${roomId}`)
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'watch_party_rooms',
          filter: `id=eq.${roomId}`
        }, 
        (payload) => {
          console.log('Room updated:', payload);
          currentRoom.value = payload.new as WatchPartyRoom;
        }
      )
      .subscribe((status) => {
        console.log('Room subscription status:', status);
      });

    // Subscribe to member changes
    membersSubscription = supabase
      .channel(`members_${roomId}`)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'watch_party_members',
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          console.log('Members changed:', payload);
          await loadMembers(roomId);
        }
      )
      .subscribe((status) => {
        console.log('Members subscription status:', status);
        
        // If subscription fails, set up polling as fallback
        if (status !== 'SUBSCRIBED') {
          console.log('Real-time subscription not active, using polling fallback');
          startMemberPolling(roomId);
        }
      });

    // Subscribe to playback events
    eventsSubscription = supabase
      .channel(`events_${roomId}`)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'watch_party_events',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          console.log('New event received:', payload);
          const event = payload.new as WatchPartyEvent;
          handleRealtimeEvent(event);
        }
      )
      .subscribe((status) => {
        console.log('Events subscription status:', status);
      });

    // Also start polling as a backup
    startMemberPolling(roomId);
  }

  // Polling fallback for member updates - smart polling
  let memberPollingInterval: NodeJS.Timeout | null = null;
  let lastMemberCount = 0;
  let pollingActive = false;
  
  function startMemberPolling(roomId: string) {
    if (pollingActive) {
      console.log('Polling already active, skipping duplicate start');
      return;
    }

    console.log('Starting smart member polling for room:', roomId);
    pollingActive = true;
    
    // Clear existing interval
    if (memberPollingInterval) {
      clearInterval(memberPollingInterval);
    }
    
    // Adaptive polling - more frequent when members are active
    let pollInterval = 3000; // Start with 3 seconds
    
    const doPoll = async () => {
      if (currentRoom.value?.id === roomId && isConnected.value) {
        try {
          const membersList = await watchPartyApi.getRoomMembers(roomId);
          const currentMemberCount = membersList.length;
          
          // Only update if there's actually a change
          if (currentMemberCount !== lastMemberCount || 
              JSON.stringify(membersList.map(m => m.id)) !== JSON.stringify(members.value.map(m => m.id))) {
            console.log('Member list changed:', { 
              before: lastMemberCount, 
              after: currentMemberCount,
              members: membersList.map(m => m.name)
            });
            members.value = membersList;
            lastMemberCount = currentMemberCount;
            
            // Speed up polling when there's activity
            pollInterval = 2000;
          } else {
            // Slow down polling when stable
            pollInterval = Math.min(pollInterval + 500, 10000); // Max 10 seconds
          }
        } catch (error) {
          console.error('Polling error:', error);
          // On error, slow down polling
          pollInterval = 10000;
        }
        
        // Schedule next poll with adaptive interval
        if (pollingActive) {
          memberPollingInterval = setTimeout(doPoll, pollInterval);
        }
      } else {
        // Stop polling if room changed or disconnected
        stopMemberPolling();
      }
    };
    
    // Start first poll immediately
    doPoll();
  }

  function stopMemberPolling() {
    console.log('Stopping member polling');
    pollingActive = false;
    
    if (memberPollingInterval) {
      clearTimeout(memberPollingInterval);
      memberPollingInterval = null;
    }
  }

  // Handle real-time events
  function handleRealtimeEvent(event: WatchPartyEvent) {
    console.log('Processing realtime event:', event);
    
    // Don't process events triggered by current member
    if (event.triggered_by === currentMember.value?.name) {
      console.log('Ignoring event from self:', event.triggered_by);
      return;
    }

    console.log('Emitting watch-party-event to window:', event);
    
    // Emit event to parent component for handling
    window.dispatchEvent(new CustomEvent('watch-party-event', {
      detail: event
    }));
  }

  // Sync playback state
  async function syncPlayback(eventType: string, eventData: any) {
    if (!currentRoom.value || !currentMember.value) {
      console.log('Cannot sync playback - no room or member');
      return;
    }

    console.log('Syncing playback:', { eventType, eventData, room: currentRoom.value.id, member: currentMember.value.name });

    try {
      await watchPartyApi.syncPlayback(
        currentRoom.value.id,
        eventType,
        eventData,
        currentMember.value.name
      );
      console.log('Playback sync successful');
    } catch (err) {
      console.error('Sync playback error:', err);
    }
  }

  // Leave the room
  async function leaveRoom() {
    if (!currentRoom.value || !currentMember.value) return;

    try {
      await watchPartyApi.leaveRoom(currentRoom.value.id, currentMember.value.id);
      
      // Clean up
      cleanup();
    } catch (err) {
      console.error('Leave room error:', err);
    }
  }

  // Clean up subscriptions
  function cleanup() {
    console.log('Cleaning up subscriptions');
    
    // Stop polling
    stopMemberPolling();
    
    if (roomSubscription) {
      supabase.removeChannel(roomSubscription);
      roomSubscription = null;
    }
    if (membersSubscription) {
      supabase.removeChannel(membersSubscription);
      membersSubscription = null;
    }
    if (eventsSubscription) {
      supabase.removeChannel(eventsSubscription);
      eventsSubscription = null;
    }

    currentRoom.value = null;
    currentMember.value = null;
    members.value = [];
    isConnected.value = false;
    error.value = null;

    // Clear persisted state
    clearState();
  }

  // Generate shareable link
  function getShareableLink(): string {
    if (!currentRoom.value) return '';
    
    const baseUrl = window.location.origin;
    const currentPath = window.location.pathname;
    return `${baseUrl}${currentPath}?room=${currentRoom.value.room_code}`;
  }

  // Generate shareable link (alias for compatibility)
  function generateShareableLink(): string {
    return getShareableLink();
  }

  // Auto cleanup on unmount
  onUnmounted(() => {
    cleanup();
  });

  // Initialize persisted state
  loadPersistedState();

  return {
    // State
    currentRoom,
    members,
    isConnected,
    isLoading,
    error,
    currentMember,
    
    // Computed
    isHost,
    roomCode,
    memberCount,
    
    // Methods
    createRoom,
    joinRoom,
    leaveRoom,
    syncPlayback,
    loadMembers,
    getShareableLink,
    generateShareableLink,
    cleanup
  };
}
