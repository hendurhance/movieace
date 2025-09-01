import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Generate a 6-character room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Ensure room code is unique
async function generateUniqueRoomCode(supabase: any): Promise<string> {
  let code: string;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    code = generateRoomCode();
    const { data } = await supabase
      .from('watch_party_rooms')
      .select('room_code')
      .eq('room_code', code)
      .eq('is_active', true)
      .single();
    
    if (!data) break; // Code is unique
    attempts++;
  } while (attempts < maxAttempts);

  if (attempts >= maxAttempts) {
    throw new Error('Unable to generate unique room code');
  }

  return code;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { hostName, mediaId, mediaType, serverIndex, season, episode } = await req.json()

    // Validate input
    if (!hostName || !mediaId || !mediaType || serverIndex === undefined) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: hostName, mediaId, mediaType, serverIndex' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    if (!['movie', 'tv'].includes(mediaType)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid mediaType. Must be "movie" or "tv"' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    if (mediaType === 'tv' && (!season || !episode)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Season and episode are required for TV shows' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Generate unique room code
    const roomCode = await generateUniqueRoomCode(supabase);

    // Create room
    const { data: roomData, error: roomError } = await supabase
      .from('watch_party_rooms')
      .insert({
        room_code: roomCode,
        host_name: hostName.trim(),
        media_id: mediaId.toString(),
        media_type: mediaType,
        current_server_index: parseInt(serverIndex),
        current_season: mediaType === 'tv' ? parseInt(season) : null,
        current_episode: mediaType === 'tv' ? parseInt(episode) : null,
        current_time: 0,
        is_playing: false,
        is_active: true
      })
      .select()
      .single()

    if (roomError) {
      console.error('Error creating room:', roomError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to create room' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    // Add host as first member
    const { data: memberData, error: memberError } = await supabase
      .from('watch_party_members')
      .insert({
        room_id: roomData.id,
        member_name: hostName.trim(),
        is_host: true,
        is_online: true
      })
      .select()
      .single()

    if (memberError) {
      console.error('Error adding host member:', memberError)
      // Try to clean up the room
      await supabase
        .from('watch_party_rooms')
        .delete()
        .eq('id', roomData.id)

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to add host to room' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          roomId: roomData.id,
          roomCode: roomCode,
          hostMemberId: memberData.id
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in create-room function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
