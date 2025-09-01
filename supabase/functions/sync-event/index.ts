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
    const { roomId, memberId, eventType, eventData } = await req.json()

    // Validate input
    if (!roomId || !memberId || !eventType || !eventData) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: roomId, memberId, eventType, eventData' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    const validEventTypes = ['play', 'pause', 'seek', 'server_change', 'episode_change'];
    if (!validEventTypes.includes(eventType)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Invalid eventType. Must be one of: ${validEventTypes.join(', ')}` 
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

    // Verify room and member exist
    const { data: member, error: memberError } = await supabase
      .from('watch_party_members')
      .select(`
        *,
        watch_party_rooms!inner (
          id,
          is_active
        )
      `)
      .eq('id', memberId)
      .eq('room_id', roomId)
      .eq('is_online', true)
      .single()

    if (memberError || !member) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Member not found or not in active room' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }

    // For certain events, only host can trigger them
    const hostOnlyEvents = ['server_change', 'episode_change'];
    if (hostOnlyEvents.includes(eventType) && !member.is_host) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Only the host can trigger this event' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403 
        }
      )
    }

    // Create sync event
    const { data: eventRecord, error: eventError } = await supabase
      .from('watch_party_events')
      .insert({
        room_id: roomId,
        member_id: memberId,
        event_type: eventType,
        event_data: eventData
      })
      .select()
      .single()

    if (eventError) {
      console.error('Error creating sync event:', eventError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to create sync event' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    // Update room state based on event type
    const updateData: any = { last_activity: new Date().toISOString() };

    switch (eventType) {
      case 'server_change':
        if (typeof eventData.serverIndex === 'number') {
          updateData.current_server_index = eventData.serverIndex;
        }
        break;
      
      case 'episode_change':
        if (typeof eventData.season === 'number') {
          updateData.current_season = eventData.season;
        }
        if (typeof eventData.episode === 'number') {
          updateData.current_episode = eventData.episode;
        }
        break;
      
      case 'play':
        updateData.is_playing = true;
        if (typeof eventData.currentTime === 'number') {
          updateData.current_time = eventData.currentTime;
        }
        break;
      
      case 'pause':
        updateData.is_playing = false;
        if (typeof eventData.currentTime === 'number') {
          updateData.current_time = eventData.currentTime;
        }
        break;
      
      case 'seek':
        if (typeof eventData.currentTime === 'number') {
          updateData.current_time = eventData.currentTime;
        }
        break;
    }

    // Update room state
    const { error: updateError } = await supabase
      .from('watch_party_rooms')
      .update(updateData)
      .eq('id', roomId)

    if (updateError) {
      console.error('Error updating room state:', updateError)
      // Don't fail the request, as the event was already created
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          eventId: eventRecord.id
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in sync-event function:', error)
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
