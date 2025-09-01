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
  
  console.log('🔄 Syncing watch party state with stream data:', {
    roomServer: roomData.current_server_index,
    roomSeason: roomData.current_season,
    roomEpisode: roomData.current_episode,
    currentStreamServer: currentStreamData.value.currentServer
  });

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
    
    console.log('✅ Successfully synced watch party state with stream data');
  } catch (error) {
    console.error('❌ Failed to sync with stream data:', error);
  }
}

const isRealtimeConnected = computed(() => 
  realtimeStatus.value.memberChannel === 'SUBSCRIBED'
);

// Realtime channels
let roomChannel: RealtimeChannel | null = null;
let memberChannel: RealtimeChannel | null = null;
let eventChannel: RealtimeChannel | null = null;

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

      console.log('Setting room data:', roomData);
      console.log('Setting member data:', memberData);

      currentRoom.value = roomData;
      currentMember.value = memberData;
      roomMembers.value = [memberData];

      console.log('Stored data after assignment:', {
        room: currentRoom.value,
        member: currentMember.value,
        members: roomMembers.value
      });

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

      console.log('Setting initial room members:', {
        totalMembers: transformedMembers.length,
        rawMembersFromAPI: rawMembers,
        transformedMembers: transformedMembers,
        membersAfterAssignment: roomMembers.value,
        currentMemberSet: currentMember.value,
        members: transformedMembers.map(m => ({
          id: m?.id,
          name: m?.member_name,
          isHost: m?.is_host,
          isOnline: m?.is_online,
          fullObject: m
        }))
      });

      // Sync with existing stream data system
      if (currentRoom.value) {
        syncWithStreamData(currentRoom.value);
      }

      // Set up realtime subscriptions
      await setupRealtimeSubscriptions(response.data.roomId);
      
      console.log('Successfully joined room:', {
        roomCode: request.roomCode,
        memberCount: roomMembers.value.length,
        currentMember: currentMember.value?.member_name,
        allMembers: roomMembers.value.map(m => ({ name: m.member_name, isHost: m.is_host }))
      });

      // Force a member refresh after a longer delay to ensure real-time subscriptions are working
      // This also helps test if the subscription is properly established
      setTimeout(async () => {
        console.log('⏰ Triggering member refresh after join to verify subscription...');
        await fetchRoomMembers(response.data!.roomId);
        console.log('🔄 Post-join member refresh completed. Member count:', roomMembers.value.length);
      }, 2000); // Increased delay to ensure subscriptions are established
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

// Set up realtime subscriptions for room updates
async function setupRealtimeSubscriptions(roomId: string) {
  console.log('Setting up real-time subscriptions for room:', roomId);
  
  // Clean up existing subscriptions
  await cleanupSubscriptions();

  // Subscribe to room state changes
  console.log('Creating room channel subscription...');
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
        console.log('Room update received:', payload);
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
      console.log('Room channel subscription status:', status, err);
      realtimeStatus.value.roomChannel = status;
      if (err) {
        console.error('Room channel subscription error:', err);
      }
    });

  // Subscribe to member changes
  console.log('Creating member channel subscription...');
  memberChannel = supabase
    .channel(`watch_party_members_${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'watch_party_members',
        filter: `room_id=eq.${roomId}`
      },
      async (payload) => {
        console.log('🔥 Member update received:', {
          eventType: payload.eventType,
          payload: payload,
          timestamp: new Date().toISOString(),
          roomId: roomId,
          payloadRoomId: (payload.new as any)?.room_id || (payload.old as any)?.room_id
        });
        console.log('Event type:', payload.eventType);
        console.log('Current member count before update:', roomMembers.value.length);
        
        // Verify the event is for our room
        const eventRoomId = (payload.new as any)?.room_id || (payload.old as any)?.room_id;
        if (eventRoomId !== roomId) {
          console.log('🚫 Event not for our room, ignoring:', { eventRoomId, expectedRoomId: roomId });
          return;
        }
        
        // Handle different member events
        if (payload.eventType === 'INSERT') {
          console.log('🎉 New member joined:', payload.new);
          // Refresh member list immediately to get updated count
          await fetchRoomMembers(roomId);
          
          // Emit custom event for UI components to react
          window.dispatchEvent(new CustomEvent('watchparty:member-joined', {
            detail: { 
              member: payload.new,
              totalMembers: roomMembers.value.length
            }
          }));
          console.log('✅ Dispatched member-joined event');
        } else if (payload.eventType === 'DELETE') {
          console.log('👋 Member left:', payload.old);
          // Refresh member list immediately
          await fetchRoomMembers(roomId);
          
          // Emit custom event for UI components to react
          window.dispatchEvent(new CustomEvent('watchparty:member-left', {
            detail: { 
              member: payload.old,
              totalMembers: roomMembers.value.length
            }
          }));
          console.log('✅ Dispatched member-left event');
        } else if (payload.eventType === 'UPDATE') {
          console.log('🔄 Member updated:', payload.new);
          // Refresh for status changes (online/offline)
          await fetchRoomMembers(roomId);
          
          // Emit custom event for status updates
          window.dispatchEvent(new CustomEvent('watchparty:member-updated', {
            detail: { 
              member: payload.new,
              totalMembers: roomMembers.value.length
            }
          }));
          console.log('✅ Dispatched member-updated event');
        }
        
        // Log the update for debugging
        console.log('Updated member count after refresh:', roomMembers.value.length);
        console.log('Current members:', roomMembers.value.map(m => ({
          name: m.member_name,
          isHost: m.is_host,
          isOnline: m.is_online
        })));
      }
    )
    .subscribe((status, err) => {
      console.log('Member channel subscription status:', status, err);
      realtimeStatus.value.memberChannel = status;
      if (err) {
        console.error('Member channel subscription error:', err);
      } else if (status === 'SUBSCRIBED') {
        console.log('✅ Successfully subscribed to member changes for room:', roomId);
      }
    });

  // Subscribe to sync events
  console.log('Creating event channel subscription...');
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
        console.log('Sync event received:', payload);
        handleSyncEvent(payload.new as WatchPartyEvent);
      }
    )
    .subscribe((status, err) => {
      console.log('Event channel subscription status:', status, err);
      realtimeStatus.value.eventChannel = status;
      if (err) {
        console.error('Event channel subscription error:', err);
      }
    });

  console.log('✅ All real-time subscriptions set up for room:', roomId);
  
  // Wait a moment for subscriptions to be fully established
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('🎯 Real-time subscriptions should now be ready to receive events');
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
      console.log(`Sync event ${event.event_type} received, will be implemented in Phase 2`);
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
    
    const previousCount = roomMembers.value.length;
    roomMembers.value = data || [];
    
    console.log(`Member list updated: ${previousCount} → ${roomMembers.value.length} members`);
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
      console.warn('getRoomData called without room code');
      return {
        success: false,
        error: 'No room code available'
      };
    }

    console.log('Getting room data for code:', currentRoom.value.room_code);

    const { data, error } = await supabase.functions.invoke('get-room', {
      body: { roomCode: currentRoom.value.room_code }
    });

    if (error) {
      console.error('getRoomData API error:', error);
      throw error;
    }

    console.log('getRoomData API response:', data);

    if (data.success && data.data) {
      console.log('API response data.data:', data.data);
      console.log('API response data.data.members:', data.data.members);
      
      // Log each member object structure
      if (data.data.members && Array.isArray(data.data.members)) {
        data.data.members.forEach((member: any, index: number) => {
          console.log(`Member ${index}:`, member);
          console.log(`Member ${index} keys:`, Object.keys(member || {}));
        });
      }

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
        
        console.log('Updating room data:', {
          before: {
            server: currentRoom.value.current_server_index,
            season: currentRoom.value.current_season,
            episode: currentRoom.value.current_episode
          },
          after: {
            server: updatedRoomData.current_server_index,
            season: updatedRoomData.current_season,
            episode: updatedRoomData.current_episode
          }
        });
        
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
      const previousMemberCount = roomMembers.value.length;
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
      
      console.log('Room data refreshed:', {
        roomCode: currentRoom.value?.room_code,
        memberCount: roomMembers.value.length,
        previousCount: previousMemberCount,
        rawMembersCount: (data.data.members || []).length,
        validMembersCount: validMembers.length,
        transformedMembers: transformedMembers,
        members: roomMembers.value.map(m => ({ 
          id: m?.id,
          name: m?.member_name, 
          isHost: m?.is_host,
          fullObject: m
        }))
      });
    }

    return data;
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
  // Check if we have stored connection data
  console.log('Initializing watch party. Checking stored data...', {
    hasRoom: !!currentRoom.value,
    hasMember: !!currentMember.value,
    roomData: currentRoom.value,
    memberData: currentMember.value,
    memberCount: roomMembers.value.length
  });

  if (currentRoom.value && currentMember.value) {
    console.log('Restoring watch party connection:', {
      roomCode: currentRoom.value.room_code,
      memberName: currentMember.value.member_name,
      roomId: currentRoom.value.id
    });

    try {
      // Refresh room data to get latest state
      const result = await getRoomData();
      if (!result.success) {
        console.warn('Failed to refresh room data, clearing stored data:', result.error);
        await disconnect();
        return;
      }
      
      // Re-establish real-time subscriptions
      await setupRealtimeSubscriptions(currentRoom.value.id);
      
      console.log('Watch party connection restored successfully:', {
        memberCount: roomMembers.value.length,
        members: roomMembers.value.map(m => ({
          id: m?.id,
          name: m?.member_name,
          isHost: m?.is_host,
          isOnline: m?.is_online,
          fullMemberObject: m
        }))
      });
    } catch (error) {
      console.error('Failed to restore watch party connection:', error);
      await disconnect();
    }
  } else {
    console.log('No stored watch party connection found');
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

  console.log('Leaving room with parameters:', {
    roomId: currentRoom.value.id,
    memberId: currentMember.value.id
  });

  try {
    const { data, error } = await supabase.functions.invoke('leave-room', {
      body: {
        roomId: currentRoom.value.id,
        memberId: currentMember.value.id
      }
    });

    if (error) {
      console.error('Leave room API error:', error);
      throw error;
    }

    console.log('Leave room response:', data);
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

// Clean up realtime subscriptions
async function cleanupSubscriptions() {
  console.log('🧹 Cleaning up existing real-time subscriptions...');
  
  if (roomChannel) {
    console.log('Removing room channel...');
    await supabase.removeChannel(roomChannel);
    roomChannel = null;
  }
  if (memberChannel) {
    console.log('Removing member channel...');
    await supabase.removeChannel(memberChannel);
    memberChannel = null;
  }
  if (eventChannel) {
    console.log('Removing event channel...');
    await supabase.removeChannel(eventChannel);
    eventChannel = null;
  }
  
  console.log('✅ All subscriptions cleaned up');
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

// Make debug function globally available
if (typeof window !== 'undefined') {
  (window as any).debugWatchParty = debugWatchParty;
  (window as any).testMemberRefresh = testMemberRefresh;
  (window as any).testSimpleSubscription = testSimpleSubscription;
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
