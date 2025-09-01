import { computed, ref } from 'vue';
import { useStorage } from '@vueuse/core';
import { supabase } from '../utils/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { currentStreamData, savePreferredServer, saveLastWatchedMetaData } from './useStream';

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
}

export interface WatchPartyEvent {
  id: string;
  room_id: string;
  member_id: string;
  event_type: 'play' | 'pause' | 'seek' | 'server_change' | 'episode_change';
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
      console.log('🔄 Fallback polling detected member count change - real-time may be failing');
      
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
  if (!currentRoom.value || !currentMember.value) return;
  
  // Don't process our own events
  if (event.member_id === currentMember.value.id) return;

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
    case 'pause':
    case 'seek':
      // These will be implemented in Phase 2
      default:
      // Future sync events can be implemented here
      break;
  }
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
  eventType: 'server_change' | 'episode_change',
  eventData: {
    serverIndex?: number;
    season?: number;
    episode?: number;
  }
): Promise<boolean> {
  if (!currentRoom.value || !currentMember.value || !isHost.value) {
    console.warn('Cannot send sync event: not host or not in room');
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

    if (error) throw error;
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
  console.log('=== Watch Party Debug Info ===');
  console.log('Current Room:', currentRoom.value);
  console.log('Current Member:', currentMember.value);
  console.log('Room Members Count:', roomMembers.value.length);
  console.log('Room Members:', roomMembers.value);
  
  // Check each member individually
  roomMembers.value.forEach((member, index) => {
    console.log(`Member ${index}:`, {
      id: member?.id,
      name: member?.member_name,
      isHost: member?.is_host,
      isOnline: member?.is_online,
      isCurrentUser: member?.id === currentMember.value?.id,
      fullObject: member
    });
  });
  
  console.log('Is Connected:', isConnected.value);
  console.log('Is Host:', isHost.value);
  console.log('Loading Members:', isLoadingMembers.value);
  console.log('Realtime Status:', realtimeStatus.value);
  
  // Check localStorage directly
  console.log('=== LocalStorage Direct Check ===');
  const rawRoom = localStorage.getItem('watchparty_current_room');
  const rawMember = localStorage.getItem('watchparty_current_member');  
  const rawMembers = localStorage.getItem('watchparty_room_members');
  
  console.log('watchparty_current_room (raw):', rawRoom);
  console.log('watchparty_current_member (raw):', rawMember);
  console.log('watchparty_room_members (raw):', rawMembers);
  
  // Try to parse localStorage data
  try {
    if (rawRoom) console.log('Parsed room:', JSON.parse(rawRoom));
  } catch (e) {
    console.error('Failed to parse room from localStorage:', e);
  }
  
  try {
    if (rawMember) console.log('Parsed member:', JSON.parse(rawMember));
  } catch (e) {
    console.error('Failed to parse member from localStorage:', e);
  }
  
  try {
    if (rawMembers) {
      const parsedMembers = JSON.parse(rawMembers);
      console.log('Parsed members:', parsedMembers);
      console.log('Parsed members count:', parsedMembers?.length);
    }
  } catch (e) {
    console.error('Failed to parse members from localStorage:', e);
  }
  
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
    console.error('No current room to refresh');
    return;
  }
  
  console.log('🧪 Testing manual member refresh...');
  const beforeCount = roomMembers.value.length;
  await fetchRoomMembers(currentRoom.value.id);
  const afterCount = roomMembers.value.length;
  
  console.log(`Member refresh test: ${beforeCount} → ${afterCount} members`);
  return { beforeCount, afterCount, members: roomMembers.value };
}

// Test function to create a simple subscription to all member events (for debugging)
export async function testSimpleSubscription() {
  if (!currentRoom.value?.id) {
    console.error('No current room for test subscription');
    return;
  }
  
  console.log('🧪 Creating test subscription to all member events...');
  
  const testChannel = supabase
    .channel(`test_member_subscription_${Date.now()}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'watch_party_members'
        // No filter - listen to all events
      },
      (payload) => {
        console.log('🧪 TEST SUBSCRIPTION - Any member event received:', {
          eventType: payload.eventType,
          roomId: (payload.new as any)?.room_id || (payload.old as any)?.room_id,
          expectedRoomId: currentRoom.value?.id,
          memberData: payload.new || payload.old
        });
      }
    )
    .subscribe((status, err) => {
      console.log('🧪 Test subscription status:', status, err);
    });
  
  // Store for cleanup
  if (typeof window !== 'undefined') {
    (window as any).testChannel = testChannel;
  }
  
  console.log('🧪 Test subscription created. Try joining a member now...');
  return testChannel;
}

// Advanced diagnostic function to check everything
export async function diagnoseMemberUpdates() {
  if (!currentRoom.value?.id) {
    console.error('❌ No current room for diagnosis');
    return;
  }

  console.log('🔍 === MEMBER UPDATE DIAGNOSIS ===');
  console.log('Room ID:', currentRoom.value.id);
  console.log('Current Member Count:', roomMembers.value.length);
  console.log('Real-time Status:', realtimeStatus.value);

  // Test 1: Check if we can fetch members manually
  console.log('\n🧪 Test 1: Manual member fetch...');
  const beforeCount = roomMembers.value.length;
  await fetchRoomMembers(currentRoom.value.id);
  const afterCount = roomMembers.value.length;
  console.log(`Manual fetch result: ${beforeCount} → ${afterCount} members`);

  // Test 2: Create diagnostic subscription
  console.log('\n🧪 Test 2: Creating diagnostic subscription...');
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
      (payload) => {
        console.log('🚨 DIAGNOSTIC - Filtered event received:', {
          eventType: payload.eventType,
          timestamp: new Date().toISOString(),
          payload: payload,
          isForCurrentRoom: true
        });
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'watch_party_members'
        // No filter - catch all events
      },
      (payload) => {
        console.log('🌍 DIAGNOSTIC - Any member event:', {
          eventType: payload.eventType,
          roomId: (payload.new as any)?.room_id || (payload.old as any)?.room_id,
          expectedRoomId: currentRoom.value?.id,
          isForCurrentRoom: ((payload.new as any)?.room_id || (payload.old as any)?.room_id) === currentRoom.value?.id
        });
      }
    )
    .subscribe((status, err) => {
      console.log('🔍 Diagnostic subscription status:', status, err);
    });

  // Store for cleanup
  if (typeof window !== 'undefined') {
    (window as any).diagChannel = diagChannel;
  }

  console.log('\n✅ Diagnostic setup complete.');
  console.log('📋 Next steps:');
  console.log('1. Join a member from another browser/tab');
  console.log('2. Watch for diagnostic logs (🚨 and 🌍 prefixes)');
  console.log('3. Run diagnoseMemberUpdates() again to see member count changes');
  console.log('4. Clean up with: supabase.removeChannel(window.diagChannel)');

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
    sendSyncEvent
  };
}
