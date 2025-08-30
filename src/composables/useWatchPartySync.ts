import { ref, onMounted, onUnmounted } from 'vue';
import { useWatchPartyRoom } from './useWatchPartyRoom';

export interface MediaInfo {
  type: 'movie' | 'tv';
  id: number;
  title: string;
  season?: number;
  episode?: number;
  streamUrl?: string;
  posterUrl?: string;
  year?: number;
}

export interface SyncEvent {
  eventType: string;
  eventData: {
    currentTime?: number;
    duration?: number;
    timestamp?: number;
    [key: string]: any;
  };
}

export function useWatchPartySync() {
  // Get watch party room functionality
  const watchPartyRoom = useWatchPartyRoom();
  
  const {
    currentRoom,
    isConnected,
    members,
    memberCount,
    syncPlayback,
    currentMember
  } = watchPartyRoom;

  // State
  const currentMedia = ref<MediaInfo | null>(null);
  const isHost = ref(false);
  const lastSyncTime = ref(0);

  // Handle incoming sync events from other members
  const handleWatchPartyEvent = (event: Event) => {
    const customEvent = event as CustomEvent;
    const syncEvent = customEvent.detail;
    
    console.log('Received watch party sync event:', syncEvent);
    
    // Don't process our own events
    if (syncEvent.triggered_by === currentMember.value?.name) {
      console.log('Ignoring own event');
      return;
    }

    // Apply sync to video player
    applySyncToPlayer(syncEvent);
  };

  // Apply sync event to the video player
  const applySyncToPlayer = (syncEvent: any) => {
    const { event_type, event_data } = syncEvent;
    
    console.log('Applying sync to player:', { event_type, event_data });
    
    try {
      // Get the global sync function from VideoPlayer
      const syncFunction = (window as any).syncVideoPlayer;
      
      if (typeof syncFunction === 'function') {
        const command = {
          type: event_type,
          data: event_data
        };
        
        console.log('Sending sync command to player:', command);
        syncFunction(command);
      } else {
        console.warn('Video player sync function not available');
      }
    } catch (error) {
      console.error('Error applying sync to player:', error);
    }
  };

  // Handle sync requests from VideoPlayer
  const handleSyncRequest = async (syncData: SyncEvent) => {
    if (!isConnected.value || !currentRoom.value) {
      console.log('Not connected to watch party, ignoring sync request');
      return;
    }

    const now = Date.now();
    
    // Debounce sync events
    if (now - lastSyncTime.value < 500) {
      console.log('Debouncing sync request');
      return;
    }
    
    lastSyncTime.value = now;
    
    console.log('Processing sync request:', syncData);
    
    try {
      await syncPlayback(
        syncData.eventType,
        {
          ...syncData.eventData,
          media: currentMedia.value,
          timestamp: now
        }
      );
      
      console.log('Sync request sent successfully');
    } catch (error) {
      console.error('Failed to send sync request:', error);
    }
  };

  // Set current media information
  const setCurrentMedia = (mediaInfo: MediaInfo) => {
    console.log('Setting current media:', mediaInfo);
    currentMedia.value = mediaInfo;
    
    // Update host status
    isHost.value = currentMember.value?.is_host || false;
  };

  // Get embed URL for the video player
  const getEmbedUrl = (): string | null => {
    return currentMedia.value?.streamUrl || null;
  };

  // Initialize watch party for media
  const initializeWatchParty = async (mediaInfo: MediaInfo, hostName?: string) => {
    console.log('Initializing watch party for media:', mediaInfo);
    
    setCurrentMedia(mediaInfo);
    
    // If not connected and host name provided, create a room
    if (!isConnected.value && hostName) {
      console.log('Creating watch party room...');
      
      const roomCode = await watchPartyRoom.createRoom(hostName, {
        type: mediaInfo.type,
        id: mediaInfo.id,
        title: mediaInfo.title,
        season: mediaInfo.season,
        episode: mediaInfo.episode,
        server_url: mediaInfo.streamUrl
      });
      
      if (roomCode) {
        console.log('Watch party room created:', roomCode);
      }
    }
  };

  // Join watch party with media
  const joinWatchParty = async (roomCode: string, memberName: string, mediaInfo: MediaInfo) => {
    console.log('Joining watch party:', { roomCode, memberName, mediaInfo });
    
    const success = await watchPartyRoom.joinRoom(roomCode, memberName);
    
    if (success) {
      setCurrentMedia(mediaInfo);
      console.log('Successfully joined watch party');
    }
    
    return success;
  };

  // Get shareable room link (custom implementation to avoid conflicts)
  const getRoomShareLink = (): string => {
    if (!currentRoom.value) return '';
    
    const baseUrl = window.location.origin;
    const currentPath = window.location.pathname;
    return `${baseUrl}${currentPath}?room=${currentRoom.value.room_code}`;
  };

  // Check if auto-join should happen (from URL parameters)
  const checkAutoJoin = (): string | null => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('room');
  };

  // Lifecycle
  onMounted(() => {
    // Listen for watch party sync events
    window.addEventListener('watch-party-event', handleWatchPartyEvent as EventListener);
    
    console.log('WatchPartySync initialized');
  });

  onUnmounted(() => {
    // Cleanup event listeners
    window.removeEventListener('watch-party-event', handleWatchPartyEvent as EventListener);
    
    console.log('WatchPartySync cleanup');
  });

  return {
    // State
    currentMedia,
    currentRoom,
    isConnected,
    members,
    memberCount,
    isHost,
    
    // Methods
    handleSyncRequest,
    setCurrentMedia,
    getEmbedUrl,
    initializeWatchParty,
    joinWatchParty,
    getRoomShareLink,
    checkAutoJoin,
    
    // Watch party room methods (selected to avoid conflicts)
    createRoom: watchPartyRoom.createRoom,
    joinRoom: watchPartyRoom.joinRoom,
    leaveRoom: watchPartyRoom.leaveRoom,
    cleanup: watchPartyRoom.cleanup
  };
}
