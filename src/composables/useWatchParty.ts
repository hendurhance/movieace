import { computed, ref } from 'vue';
import { useStorage } from '@vueuse/core';
import { supabase } from '../utils/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { currentStreamData, savePreferredServer, saveLastWatchedMetaData, buildStreamUrl } from './useStream';
import { useToast } from './useToast';
import { debounce } from 'lodash';

export interface WatchPartyRoom {
  id: string;
  room_code: string;
  host_name: string;
  media_id: string;
  media_type: 'movie' | 'tv';
  current_server_index: number;
  current_season?: number;
  current_episode?: number;
  current_time: number;
  is_playing: boolean;
  created_at: string;
  last_activity: string;
  is_active: boolean;
}

export interface WatchPartyMember {
  id: string;
  room_id: string;
  member_name: string;
  is_host: boolean;
  joined_at: string;
  last_seen: string;
  is_online: boolean;
  current_time?: number;
  timestamp_updated_at?: string;
}

export interface WatchPartyEvent {
  id: string;
  room_id: string;
  member_id: string;
  event_type: 'play' | 'pause' | 'seek' | 'server_change' | 'episode_change' | 'force_sync';
  event_data: {
    currentTime?: number;
    serverIndex?: number;
    season?: number;
    episode?: number;
    duration?: number;
  };
  created_at: string;
}

export interface CreateRoomRequest {
  hostName: string;
  mediaId: string;
  mediaType: 'movie' | 'tv';
  serverIndex: number;
  season?: number;
  episode?: number;
}

export interface JoinRoomRequest {
  roomCode: string;
  memberName: string;
}

export interface CreateRoomResponse {
  success: boolean;
  data?: {
    roomId: string;
    roomCode: string;
    hostMemberId: string;
  };
  error?: string;
}

export interface JoinRoomResponse {
  success: boolean;
  data?: {
    roomId: string;
    memberId: string;
    roomData: {
      mediaId: string;
      mediaType: 'movie' | 'tv';
      currentServerIndex: number;
      currentSeason?: number;
      currentEpisode?: number;
      currentTime: number;
      isPlaying: boolean;
    };
    members: WatchPartyMember[];
  };
  error?: string;
}

// Reactive state with persistence
const currentRoom = useStorage<WatchPartyRoom | null>('watchparty_current_room', null, undefined, {
  serializer: {
    read: (v: any) => {
      try {
        return v ? JSON.parse(v) : null;
      } catch {
        return null;
      }
    },
    write: (v: any) => JSON.stringify(v)
  }
});

const currentMember = useStorage<WatchPartyMember | null>('watchparty_current_member', null, undefined, {
  serializer: {
    read: (v: any) => {
      try {
        return v ? JSON.parse(v) : null;
      } catch {
        return null;
      }
    },
    write: (v: any) => JSON.stringify(v)
  }
});

const roomMembers = useStorage<WatchPartyMember[]>('watchparty_room_members', [], undefined, {
  serializer: {
    read: (v: any) => {
      try {
        return v ? JSON.parse(v) : [];
      } catch {
        return [];
      }
    },
    write: (v: any) => JSON.stringify(v)
  }
});
const isLoadingMembers = ref(false);
const isConnected = computed(() => currentRoom.value !== null && currentMember.value !== null);
const isHost = computed(() => currentMember.value?.is_host || false);

// Real-time connection status tracking
const realtimeStatus = ref({
  roomChannel: 'disconnected',
  memberChannel: 'disconnected',
  eventChannel: 'disconnected'
});

// Member timestamp tracking
const memberTimestamps = ref<Map<string, { time: number; updatedAt: Date }>>(new Map());

// Toast notifications
const { addToast } = useToast();

// Timestamp tracking functions
const updateMemberTimestamp = (memberId: string, currentTime: number) => {
  memberTimestamps.value.set(memberId, {
    time: currentTime,
    updatedAt: new Date()
  });
};

const getMemberTimestamp = (memberId: string): number | null => {
  const data = memberTimestamps.value.get(memberId);
  return data ? data.time : null;
};

const formatTimestamp = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Debounced timestamp broadcast to avoid too many updates
const debouncedTimestampBroadcast = debounce((memberId: string, currentTime: number, eventType: string) => {
  updateMemberTimestamp(memberId, currentTime);
  
  // Emit timestamp update event
  window.dispatchEvent(new CustomEvent('watchparty:timestamp-update', {
    detail: { 
      memberId,
      currentTime,
      eventType,
      formattedTime: formatTimestamp(currentTime)
    }
  }));
}, 1000); // Update timestamps every 1 second max

// Force sync function - reloads player with current room timestamp
export async function forceSync(): Promise<boolean> {
  if (!currentRoom.value || !currentMember.value) {
    addToast('Not connected to a watch party', 'error', 5000);
    return false;
  }

  const currentTime = currentRoom.value.current_time;
  const mediaId = currentRoom.value.media_id;
  const mediaType = currentRoom.value.media_type;
  const serverIndex = currentRoom.value.current_server_index;
  const season = currentRoom.value.current_season;
  const episode = currentRoom.value.current_episode;

  // Build new URL with timestamp for local use
  const syncUrl = buildStreamUrl(
    mediaId,
    mediaType,
    serverIndex,
    season,
    episode,
    currentTime
  );

  // Emit local event to reload our own player
  window.dispatchEvent(new CustomEvent('watchparty:force-sync', {
    detail: { 
      syncUrl,
      currentTime,
      mediaId,
      mediaType,
      serverIndex,
      season,
      episode
    }
  }));

  // Send force_sync event to other members via websocket
  const syncSuccess = await sendSyncEvent('force_sync', {
    currentTime,
    serverIndex,
    season,
    episode
  });

  if (syncSuccess) {
    addToast(
      `Force synced all members to ${formatTimestamp(currentTime)}`,
      'success',
      5000
    );
  } else {
    addToast(
      `Local sync to ${formatTimestamp(currentTime)} - websocket sync failed`,
      'warning',
      5000
    );
  }

  return syncSuccess;
}

// Sync watch party room state with existing stream data system
function syncWithStreamData(roomData: WatchPartyRoom) {
  if (!roomData) return;

  // Update the current stream data to match watch party state
  currentStreamData.value = {
    ...currentStreamData.value,
    currentServer: roomData.current_server_index,
    currentType: roomData.media_type,
    currentSeason: roomData.current_season || 1,
    currentEpisode: roomData.current_episode || 1
  };

  // Save to localStorage using the proper stream data system
  try {
    savePreferredServer(
      roomData.media_id,
      roomData.current_server_index,
      roomData.media_type
    );

    if (roomData.media_type === 'tv' && roomData.current_season && roomData.current_episode) {
      saveLastWatchedMetaData(
        roomData.media_id,
        roomData.media_type,
        {
          season: roomData.current_season,
          episode: roomData.current_episode
        }
      );
    }
  } catch (error) {
    console.error('❌ Failed to sync with stream data:', error);
  }
}

const isRealtimeConnected = computed(() => 
  realtimeStatus.value.memberChannel === 'SUBSCRIBED'
);

// Track if real-time events are actually working (not just subscribed)
const realtimeWorking = ref({
  memberEvents: false,
  roomEvents: false,
  lastEventTime: null as Date | null
});

const isRealtimeActuallyWorking = computed(() =>
  realtimeWorking.value.memberEvents && 
  realtimeWorking.value.lastEventTime &&
  (Date.now() - realtimeWorking.value.lastEventTime.getTime()) < 30000 // Last event within 30 seconds
);

// Debounce helper for member fetching to prevent rapid successive calls
let memberFetchTimeout: NodeJS.Timeout | null = null;
function debouncedFetchRoomMembers(roomId: string, delay = 500, eventType?: 'INSERT' | 'DELETE', memberData?: any) {
  if (memberFetchTimeout) {
    clearTimeout(memberFetchTimeout);
  }
  
  memberFetchTimeout = setTimeout(async () => {
    await fetchRoomMembers(roomId);
    
    // Dispatch event after refresh if provided
    if (eventType) {
      const eventName = eventType === 'INSERT' ? 'watchparty:member-joined' : 'watchparty:member-left';
      window.dispatchEvent(new CustomEvent(eventName, {
        detail: { 
          member: memberData,
          totalMembers: roomMembers.value.length,
          source: 'realtime-subscription'
        }
      }));
    }
  }, delay);
}

// Realtime channels
let roomChannel: RealtimeChannel | null = null;
let memberChannel: RealtimeChannel | null = null;
let eventChannel: RealtimeChannel | null = null;
let memberPollingInterval: NodeJS.Timeout | null = null;

// Create a new watch party room
export async function createRoom(request: CreateRoomRequest): Promise<CreateRoomResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('create-room', {
      body: request
    });

    if (error) {
      throw error;
    }

    const response = data as CreateRoomResponse;
    
    if (response.success && response.data) {
      // Set up local state after successful room creation
      const roomData = {
        id: response.data.roomId,
        room_code: response.data.roomCode,
        host_name: request.hostName,
        media_id: request.mediaId,
        media_type: request.mediaType,
        current_server_index: request.serverIndex,
        current_season: request.season,
        current_episode: request.episode,
        current_time: 0,
        is_playing: false,
        created_at: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        is_active: true
      };

      const memberData = {
        id: response.data.hostMemberId,
        room_id: response.data.roomId,
        member_name: request.hostName,
        is_host: true,
        joined_at: new Date().toISOString(),
        last_seen: new Date().toISOString(),
        is_online: true
      };

      currentRoom.value = roomData;
      currentMember.value = memberData;
      roomMembers.value = [memberData];

      // Sync with existing stream data system
      if (currentRoom.value) {
        syncWithStreamData(currentRoom.value);
      }

      // Set up realtime subscriptions
      await setupRealtimeSubscriptions(response.data.roomId);
    }

    return response;
  } catch (error) {
    console.error('Error creating room:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create room'
    };
  }
}

// Join an existing watch party room
export async function joinRoom(request: JoinRoomRequest): Promise<JoinRoomResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('join-room', {
      body: request
    });

    if (error) {
      throw error;
    }

    const response = data as JoinRoomResponse;
    
    if (response.success && response.data) {
      // Update local state with complete room data
      const rawMembers = response.data.members as any[]; // Use any[] to handle different API formats
      
      currentRoom.value = {
        id: response.data.roomId,
        room_code: request.roomCode,
        host_name: rawMembers.find((m: any) => m.is_host || m.isHost)?.member_name || 
                   rawMembers.find((m: any) => m.is_host || m.isHost)?.memberName || '',
        media_id: response.data.roomData.mediaId,
        media_type: response.data.roomData.mediaType,
        current_server_index: response.data.roomData.currentServerIndex,
        current_season: response.data.roomData.currentSeason,
        current_episode: response.data.roomData.currentEpisode,
        current_time: response.data.roomData.currentTime,
        is_playing: response.data.roomData.isPlaying,
        created_at: '',
        last_activity: new Date().toISOString(),
        is_active: true
      };

      // Transform API response members to match frontend interface
      const transformedMembers: WatchPartyMember[] = rawMembers.map((member: any) => ({
        id: member.id,
        room_id: member.room_id || response.data!.roomId,
        member_name: member.member_name || member.memberName, // Handle both formats
        is_host: member.is_host ?? member.isHost,
        is_online: member.is_online ?? member.isOnline,
        joined_at: member.joined_at || member.joinedAt || '',
        last_seen: member.last_seen || member.lastSeen || ''
      }));

      currentMember.value = transformedMembers.find(m => m.id === response.data!.memberId) || null;
      roomMembers.value = transformedMembers;

      // Sync with existing stream data system
      if (currentRoom.value) {
        syncWithStreamData(currentRoom.value);
      }

      // Set up realtime subscriptions
      await setupRealtimeSubscriptions(response.data.roomId);
    }

    return response;
  } catch (error) {
    console.error('Error joining room:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to join room'
    };
  }
}

// Clean up realtime subscriptions
async function cleanupSubscriptions() {
  if (roomChannel) {
    await supabase.removeChannel(roomChannel);
    roomChannel = null;
  }
  if (memberChannel) {
    await supabase.removeChannel(memberChannel);
    memberChannel = null;
  }
  if (eventChannel) {
    await supabase.removeChannel(eventChannel);
    eventChannel = null;
  }
  
  if (memberPollingInterval) {
    clearInterval(memberPollingInterval);
    memberPollingInterval = null;
  }

  // Clean up player event listeners
  cleanupPlayerEventListeners();
}

// Set up realtime subscriptions for room updates
async function setupRealtimeSubscriptions(roomId: string) {
  // Clean up existing subscriptions
  await cleanupSubscriptions();

  // Subscribe to room state changes
  roomChannel = supabase
    .channel(`watch_party_room_${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'watch_party_rooms',
        filter: `id=eq.${roomId}`
      },
      (payload) => {
        if (payload.new && currentRoom.value) {
          // Update room state
          const updatedRoom = { ...currentRoom.value, ...payload.new };
          currentRoom.value = updatedRoom;
          
          // Sync with existing stream data system
          syncWithStreamData(updatedRoom);
        }
      }
    )
    .subscribe((status, err) => {
      realtimeStatus.value.roomChannel = status;
      if (err) {
        console.error('Room channel subscription error:', err);
      }
    });

  // Subscribe to member changes
  const memberChannelName = `watch_party_members_${roomId}_${Date.now()}`;
  
  memberChannel = supabase
    .channel(memberChannelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'watch_party_members',
        filter: `room_id=eq.${roomId}`
      },
      async (payload) => {
        // Verify the event is for our room
        const eventRoomId = (payload.new as any)?.room_id || (payload.old as any)?.room_id;
        if (eventRoomId !== roomId) {
          return;
        }
        
        // Handle different member events
        if (payload.eventType === 'INSERT') {
          // Mark real-time as working
          realtimeWorking.value.memberEvents = true;
          realtimeWorking.value.lastEventTime = new Date();
          
          // Refresh member list and dispatch event (debounced to prevent rapid calls)
          debouncedFetchRoomMembers(roomId, 200, 'INSERT', payload.new);
        } else if (payload.eventType === 'DELETE') {
          // Mark real-time as working
          realtimeWorking.value.memberEvents = true;
          realtimeWorking.value.lastEventTime = new Date();
          
          // Refresh member list and dispatch event (debounced to prevent rapid calls)
          debouncedFetchRoomMembers(roomId, 200, 'DELETE', payload.old);
        } else if (payload.eventType === 'UPDATE') {
          // Mark real-time as working
          realtimeWorking.value.memberEvents = true;
          realtimeWorking.value.lastEventTime = new Date();
          
          // Refresh for status changes (online/offline) - debounced
          debouncedFetchRoomMembers(roomId, 200);
          
          // Emit custom event for status updates (not debounced as it's just an event)
          window.dispatchEvent(new CustomEvent('watchparty:member-updated', {
            detail: { 
              member: payload.new,
              totalMembers: roomMembers.value.length,
              source: 'realtime-subscription'
            }
          }));
        }
      }
    )
    .subscribe((status, err) => {
      realtimeStatus.value.memberChannel = status;
      if (err) {
        console.error('❌ Member channel subscription error:', err);
      }
    });

  // Subscribe to sync events
  eventChannel = supabase
    .channel(`watch_party_events_${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'watch_party_events',
        filter: `room_id=eq.${roomId}`
      },
      (payload) => {
        handleSyncEvent(payload.new as WatchPartyEvent);
      }
    )
    .subscribe((status, err) => {
      realtimeStatus.value.eventChannel = status;
      if (err) {
        console.error('❌ Event channel subscription error:', err);
      }
    });

  // Wait a moment for subscriptions to be fully established
  await new Promise(resolve => setTimeout(resolve, 500));

  // Set up player event listeners for Phase 2
  setupPlayerEventListeners();

  // Set up fallback polling as backup
  if (memberPollingInterval) {
    clearInterval(memberPollingInterval);
  }
  
  memberPollingInterval = setInterval(async () => {
    // Skip polling if real-time is actually working
    if (isRealtimeActuallyWorking.value) {
      return;
    }

    const beforeCount = roomMembers.value.length;
    await fetchRoomMembers(roomId);
    const afterCount = roomMembers.value.length;
    
    if (beforeCount !== afterCount) {
      // Emit events as if they came from real-time
      if (afterCount > beforeCount) {
        window.dispatchEvent(new CustomEvent('watchparty:member-joined', {
          detail: { 
            totalMembers: afterCount,
            source: 'fallback-polling'
          }
        }));
      } else if (afterCount < beforeCount) {
        window.dispatchEvent(new CustomEvent('watchparty:member-left', {
          detail: { 
            totalMembers: afterCount,
            source: 'fallback-polling'
          }
        }));
      }
    }
  }, 5000);
}

// Handle incoming sync events
function handleSyncEvent(event: WatchPartyEvent) {
  if (!currentRoom.value || !currentMember.value) {
    return;
  }
  
  // Don't process our own events
  if (event.member_id === currentMember.value.id) {
    return;
  }

  // Find the member who sent this event
  const sendingMember = roomMembers.value.find(m => m.id === event.member_id);
  const memberName = sendingMember?.member_name || 'A member';

  // Update timestamp for the member who sent the event
  if (event.event_data.currentTime !== undefined) {
    debouncedTimestampBroadcast(event.member_id, event.event_data.currentTime, event.event_type);
  }

  // Emit a general sync event for timestamp tracking
  if (event.event_data.currentTime !== undefined) {
    window.dispatchEvent(new CustomEvent('watchparty:sync', {
      detail: { 
        memberId: event.member_id,
        currentTime: event.event_data.currentTime,
        eventType: event.event_type,
        duration: event.event_data.duration 
      }
    }));
  }

  switch (event.event_type) {
    case 'server_change':
      if (event.event_data.serverIndex !== undefined) {
        currentRoom.value.current_server_index = event.event_data.serverIndex;
        // Emit event for components to handle
        window.dispatchEvent(new CustomEvent('watchparty:server-change', {
          detail: { serverIndex: event.event_data.serverIndex }
        }));
      }
      break;
    
    case 'episode_change':
      if (event.event_data.season !== undefined && event.event_data.episode !== undefined) {
        currentRoom.value.current_season = event.event_data.season;
        currentRoom.value.current_episode = event.event_data.episode;
        // Emit event for components to handle
        window.dispatchEvent(new CustomEvent('watchparty:episode-change', {
          detail: { 
            season: event.event_data.season, 
            episode: event.event_data.episode 
          }
        }));
      }
      break;

    case 'play':
      if (event.event_data.currentTime !== undefined) {
        currentRoom.value.current_time = event.event_data.currentTime;
        currentRoom.value.is_playing = true;
        
        // Show toast notification for play event (with unique key to prevent duplicates)
        const playToastMessage = `${memberName} resumed playback at ${formatTimestamp(event.event_data.currentTime)}`;
        addToast(
          playToastMessage,
          'info',
          8000
        );
        
        // Emit event for video player to handle
        window.dispatchEvent(new CustomEvent('watchparty:play', {
          detail: { 
            currentTime: event.event_data.currentTime,
            duration: event.event_data.duration,
            memberName
          }
        }));
      }
      break;

    case 'pause':
      if (event.event_data.currentTime !== undefined) {
        currentRoom.value.current_time = event.event_data.currentTime;
        currentRoom.value.is_playing = false;
        
        // Show toast notification for pause event (with unique key to prevent duplicates)
        const pauseToastMessage = `${memberName} paused playback at ${formatTimestamp(event.event_data.currentTime)}`;
        addToast(
          pauseToastMessage,
          'warning',
          8000
        );
        
        // Emit event for video player to handle
        window.dispatchEvent(new CustomEvent('watchparty:pause', {
          detail: { 
            currentTime: event.event_data.currentTime,
            duration: event.event_data.duration,
            memberName
          }
        }));
      }
      break;

    case 'seek':
      if (event.event_data.currentTime !== undefined) {
        currentRoom.value.current_time = event.event_data.currentTime;
        
        // Show toast notification for seek event (with unique key to prevent duplicates)
        const seekToastMessage = `${memberName} jumped to ${formatTimestamp(event.event_data.currentTime)}`;
        addToast(
          seekToastMessage,
          'info',
          8000
        );
        
        // Emit event for video player to handle
        window.dispatchEvent(new CustomEvent('watchparty:seek', {
          detail: { 
            currentTime: event.event_data.currentTime,
            duration: event.event_data.duration,
            memberName
          }
        }));
      }
      break;

    case 'force_sync':
      if (event.event_data.currentTime !== undefined) {
        currentRoom.value.current_time = event.event_data.currentTime;
        
        // Show toast notification for force sync
        addToast(
          `${memberName} force synced to ${formatTimestamp(event.event_data.currentTime)}`,
          'success',
          10000
        );
        
        // Build sync URL for this member
        const syncUrl = buildStreamUrl(
          currentRoom.value.media_id,
          currentRoom.value.media_type,
          event.event_data.serverIndex || currentRoom.value.current_server_index,
          event.event_data.season || currentRoom.value.current_season,
          event.event_data.episode || currentRoom.value.current_episode,
          event.event_data.currentTime
        );
        
        // Emit event to reload player with sync URL
        window.dispatchEvent(new CustomEvent('watchparty:force-sync', {
          detail: { 
            syncUrl,
            currentTime: event.event_data.currentTime,
            mediaId: currentRoom.value.media_id,
            mediaType: currentRoom.value.media_type,
            serverIndex: event.event_data.serverIndex || currentRoom.value.current_server_index,
            season: event.event_data.season || currentRoom.value.current_season,
            episode: event.event_data.episode || currentRoom.value.current_episode
          }
        }));
      }
      break;

    default:
      // Future sync events can be implemented here
      break;
  }
}

// Handle player events and sync with other members
function handlePlayerEvent(event: Event) {
  if (!currentRoom.value || !currentMember.value) {
    // Not in a room, don't sync
    return;
  }

  const customEvent = event as CustomEvent;
  const { event: eventType, currentTime, duration } = customEvent.detail;
  
  // Debounce rapid events (prevent duplicate events within 1000ms at same time)
  const now = Date.now();
  if (lastPlayerEvent && 
      lastPlayerEvent.type === eventType && 
      Math.abs(lastPlayerEvent.time - currentTime) < 1.0 && // Less than 1 second difference
      (now - lastPlayerEvent.timestamp) < 1000) { // Less than 1000ms ago
    return; // Skip this duplicate event
  }

  // Update last event tracking
  lastPlayerEvent = {
    type: eventType,
    time: currentTime,
    timestamp: now
  };
  
  // Only sync if we're connected to a watch party
  if (eventType === 'play' || eventType === 'pause') {
    // Update our own timestamp
    updateMemberTimestamp(currentMember.value.id, currentTime);
    
    // Send sync event to other members
    sendSyncEvent(eventType, { 
      currentTime, 
      duration 
    });
    
    // Show toast for our own action (reduced frequency)
    const action = eventType === 'play' ? 'resumed' : 'paused';
    const toastMessage = `You ${action} playback at ${formatTimestamp(currentTime)}`;
    addToast(
      toastMessage,
      eventType === 'play' ? 'success' : 'warning',
      8000
    );
    
    // Update local room state
    currentRoom.value.current_time = currentTime;
    currentRoom.value.is_playing = eventType === 'play';
  } else if (eventType === 'timeupdate') {
    // Update our own timestamp for continuous tracking (debounced)
    debouncedTimestampBroadcast(currentMember.value.id, currentTime, eventType);
  }
}

let playerEventListenersSetup = false;
let lastPlayerEvent: { type: string; time: number; timestamp: number } | null = null;
let handleTimeUpdate: ((event: Event) => void) | null = null;

// Set up player event listeners
function setupPlayerEventListeners() {
  if (playerEventListenersSetup) {
    return;
  }
  
  // Handle timeupdate events for continuous timestamp tracking
  handleTimeUpdate = (event: Event) => {
    if (!currentRoom.value || !currentMember.value) return;
    
    const customEvent = event as CustomEvent;
    const { currentTime } = customEvent.detail;
    
    if (typeof currentTime === 'number') {
      debouncedTimestampBroadcast(currentMember.value.id, currentTime, 'timeupdate');
    }
  };
  
  // Listen for player events from VideoPlayer component
  window.addEventListener('player:event', handlePlayerEvent);
  window.addEventListener('watchparty:timeupdate', handleTimeUpdate);
  playerEventListenersSetup = true;
}

// Clean up player event listeners  
function cleanupPlayerEventListeners() {
  window.removeEventListener('player:event', handlePlayerEvent);
  if (handleTimeUpdate) {
    window.removeEventListener('watchparty:timeupdate', handleTimeUpdate);
    handleTimeUpdate = null;
  }
  playerEventListenersSetup = false;
}

// Fetch room members
// Fetch room members and update local state
async function fetchRoomMembers(roomId: string) {
  try {
    isLoadingMembers.value = true;
    
    const { data, error } = await supabase
      .from('watch_party_members')
      .select('*')
      .eq('room_id', roomId)
      .eq('is_online', true)
      .order('joined_at');

    if (error) throw error;
    
    roomMembers.value = data || [];
  } catch (error) {
    console.error('Error fetching room members:', error);
  } finally {
    isLoadingMembers.value = false;
  }
}

// Get complete room data including members
export async function getRoomData(): Promise<{ success: boolean; error?: string }> {
  try {
    // We need the room code, not room ID for the get-room API
    if (!currentRoom.value?.room_code) {
      return {
        success: false,
        error: 'No room code available'
      };
    }

    const { data, error } = await supabase.functions.invoke('get-room', {
      body: { roomCode: currentRoom.value.room_code }
    });

    if (error) {
      console.error('getRoomData API error:', error);
      throw error;
    }

    if (data.success && data.data) {
      // Update room data
      if (currentRoom.value) {
        const updatedRoomData = {
          ...currentRoom.value,
          media_id: data.data.room.mediaId,
          media_type: data.data.room.mediaType,
          current_server_index: data.data.room.currentServerIndex,
          current_season: data.data.room.currentSeason,
          current_episode: data.data.room.currentEpisode,
          current_time: data.data.room.currentTime,
          is_playing: data.data.room.isPlaying,
          last_activity: new Date().toISOString()
        };
        
        currentRoom.value = updatedRoomData;
        
        // Sync with existing stream data system after updating room data
        syncWithStreamData(updatedRoomData);
      }
      
      // Transform API response to match frontend interface
      const transformedMembers: WatchPartyMember[] = (data.data.members || []).map((member: any) => ({
        id: member.id,
        room_id: member.room_id || currentRoom.value?.id || '',
        member_name: member.memberName || member.member_name, // Transform camelCase to snake_case
        is_host: member.isHost ?? member.is_host,
        is_online: member.isOnline ?? member.is_online,
        joined_at: member.joinedAt || member.joined_at || '',
        last_seen: member.lastSeen || member.last_seen || ''
      }));

      // Update members
      // Filter out any null or undefined members and validate structure  
      const validMembers = transformedMembers.filter((member: WatchPartyMember) => {
        const isValid = member && 
          typeof member === 'object' && 
          member.id && 
          member.member_name &&
          typeof member.is_host === 'boolean' &&
          typeof member.is_online === 'boolean';
        
        if (!isValid) {
          console.warn('Invalid member object detected:', member);
        }
        
        return isValid;
      });
      
      roomMembers.value = validMembers;
    }

    return { success: data.success };
  } catch (error) {
    console.error('Error getting room data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get room data'
    };
  }
}

// Initialize persistent connection on page load
export async function initializeWatchParty(): Promise<void> {
  if (currentRoom.value && currentMember.value) {
    try {
      // Refresh room data to get latest state
      const result = await getRoomData();
      if (!result.success) {
        await disconnect();
        return;
      }
      
      // Re-establish real-time subscriptions
      await setupRealtimeSubscriptions(currentRoom.value.id);
    } catch (error) {
      console.error('Failed to restore watch party connection:', error);
      await disconnect();
    }
  }
}

// Send sync event to other room members
export async function sendSyncEvent(
  eventType: 'server_change' | 'episode_change' | 'play' | 'pause' | 'seek' | 'force_sync',
  eventData: {
    serverIndex?: number;
    season?: number;
    episode?: number;
    currentTime?: number;
    duration?: number;
  }
): Promise<boolean> {
  if (!currentRoom.value || !currentMember.value) {
    console.warn('Cannot send sync event: not in room');
    return false;
  }

  // Only host can trigger server and episode changes
  const hostOnlyEvents = ['server_change', 'episode_change'];
  if (hostOnlyEvents.includes(eventType) && !isHost.value) {
    console.warn('Cannot send sync event: not host');
    return false;
  }

  try {
    const { data, error } = await supabase.functions.invoke('sync-event', {
      body: {
        roomId: currentRoom.value.id,
        memberId: currentMember.value.id,
        eventType,
        eventData
      }
    });

    if (error) {
      console.error('Supabase sync event error:', error);
      throw error;
    }
    
    // Emit event for our own timestamp tracking
    if (eventData.currentTime !== undefined) {
      window.dispatchEvent(new CustomEvent('watchparty:sync', {
        detail: { 
          memberId: currentMember.value.id,
          currentTime: eventData.currentTime,
          eventType,
          duration: eventData.duration 
        }
      }));
    }
    
    return data?.success || false;
  } catch (error) {
    console.error('Error sending sync event:', error);
    return false;
  }
}

// Leave the current room
export async function leaveRoom(): Promise<void> {
  if (!currentRoom.value || !currentMember.value) {
    console.warn('Cannot leave room: missing room or member data', {
      hasRoom: !!currentRoom.value,
      hasMember: !!currentMember.value,
      roomData: currentRoom.value,
      memberData: currentMember.value
    });
    return;
  }

  try {
    const { error } = await supabase.functions.invoke('leave-room', {
      body: {
        roomId: currentRoom.value.id,
        memberId: currentMember.value.id
      }
    });

    if (error) {
      console.error('Leave room API error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error leaving room:', error);
    throw error; // Re-throw to allow UI to handle the error
  } finally {
    await disconnect();
  }
}

// Disconnect from watch party
export async function disconnect(): Promise<void> {
  await cleanupSubscriptions();
  currentRoom.value = null;
  currentMember.value = null;
  roomMembers.value = [];
}

// Debug function for console access
export function debugWatchParty() {
  return {
    room: currentRoom.value,
    member: currentMember.value,
    members: roomMembers.value,
    isConnected: isConnected.value,
    isHost: isHost.value,
    realtimeStatus: realtimeStatus.value
  };
}

// Test function to manually trigger a member refresh
export async function testMemberRefresh() {
  if (!currentRoom.value?.id) {
    return;
  }
  
  const beforeCount = roomMembers.value.length;
  await fetchRoomMembers(currentRoom.value.id);
  const afterCount = roomMembers.value.length;
  
  return { beforeCount, afterCount, members: roomMembers.value };
}

// Test function to create a simple subscription to all member events (for debugging)
export async function testSimpleSubscription() {
  if (!currentRoom.value?.id) {
    return;
  }
  
  const testChannel = supabase
    .channel(`test_member_subscription_${Date.now()}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'watch_party_members'
      },
      () => {
        // Event received
      }
    )
    .subscribe(() => {
      // Subscription status updated
    });
  
  // Store for cleanup
  if (typeof window !== 'undefined') {
    (window as any).testChannel = testChannel;
  }
  
  return testChannel;
}

// Advanced diagnostic function to check everything
export async function diagnoseMemberUpdates() {
  if (!currentRoom.value?.id) {
    return;
  }

  await fetchRoomMembers(currentRoom.value.id);

  const diagChannel = supabase
    .channel(`diagnosis_${Date.now()}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'watch_party_members',
        filter: `room_id=eq.${currentRoom.value.id}`
      },
      () => {
        // Diagnostic event received
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'watch_party_members'
      },
      () => {
        // Any member event received
      }
    )
    .subscribe(() => {
      // Diagnostic subscription status updated
    });

  // Store for cleanup
  if (typeof window !== 'undefined') {
    (window as any).diagChannel = diagChannel;
  }

  return { diagChannel, currentCount: roomMembers.value.length };
}

// Make debug function globally available
if (typeof window !== 'undefined') {
  (window as any).debugWatchParty = debugWatchParty;
  (window as any).testMemberRefresh = testMemberRefresh;
  (window as any).testSimpleSubscription = testSimpleSubscription;
  (window as any).diagnoseMemberUpdates = diagnoseMemberUpdates;
}

// Export reactive state
export function useWatchParty() {
  // Set up player event listeners as soon as composable is used
  // This ensures player events are captured even if not in a room yet
  setupPlayerEventListeners();
  
  return {
    currentRoom: computed(() => currentRoom.value),
    currentMember: computed(() => currentMember.value),
    roomMembers: computed(() => roomMembers.value),
    isLoadingMembers: computed(() => isLoadingMembers.value),
    isConnected: computed(() => isConnected.value),
    isRealtimeConnected,
    realtimeStatus: computed(() => realtimeStatus.value),
    isHost,
    createRoom,
    joinRoom,
    leaveRoom,
    disconnect,
    sendSyncEvent,
    getMemberTimestamp,
    formatTimestamp,
    memberTimestamps: computed(() => memberTimestamps.value),
    forceSync
  };
}
