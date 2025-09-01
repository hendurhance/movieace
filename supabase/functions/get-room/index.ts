import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { roomCode } = await req.json()

    // Validate input
    if (!roomCode) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required field: roomCode' 
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

    // Find the room
    const { data: roomData, error: roomError } = await supabase
      .from('watch_party_rooms')
      .select('*')
      .eq('room_code', roomCode.toUpperCase())
      .eq('is_active', true)
      .single()

    if (roomError || !roomData) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Room not found or inactive' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }

    // Get all room members
    const { data: members, error: membersError } = await supabase
      .from('watch_party_members')
      .select('*')
      .eq('room_id', roomData.id)
      .order('joined_at')

    if (membersError) {
      console.error('Error fetching room members:', membersError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to fetch room members' 
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
          room: {
            id: roomData.id,
            roomCode: roomData.room_code,
            mediaId: roomData.media_id,
            mediaType: roomData.media_type,
            currentServerIndex: roomData.current_server_index,
            currentSeason: roomData.current_season,
            currentEpisode: roomData.current_episode,
            currentTime: roomData.current_time,
            isPlaying: roomData.is_playing
          },
          members: members.map(member => ({
            id: member.id,
            room_id: member.room_id,
            member_name: member.member_name,
            is_host: member.is_host,
            is_online: member.is_online,
            joined_at: member.joined_at,
            last_seen: member.last_seen
          }))
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in get-room function:', error)
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
