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
    const { roomId, memberId } = await req.json()

    // Validate input
    if (!roomId || !memberId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: roomId, memberId' 
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

    // Get member info to check if they're the host
    const { data: member, error: memberError } = await supabase
      .from('watch_party_members')
      .select('*')
      .eq('id', memberId)
      .eq('room_id', roomId)
      .single()

    if (memberError || !member) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Member not found in room' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }

    // Remove member from room
    const { error: deleteMemberError } = await supabase
      .from('watch_party_members')
      .delete()
      .eq('id', memberId)

    if (deleteMemberError) {
      console.error('Error removing member from room:', deleteMemberError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to leave room' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    let roomClosed = false;

    // If the member was the host, check if there are other members
    if (member.is_host) {
      const { data: remainingMembers, error: remainingError } = await supabase
        .from('watch_party_members')
        .select('id')
        .eq('room_id', roomId)
        .eq('is_online', true)

      if (remainingError) {
        console.error('Error checking remaining members:', remainingError)
      } else if (remainingMembers && remainingMembers.length === 0) {
        // No members left, close the room
        await supabase
          .from('watch_party_rooms')
          .update({ is_active: false })
          .eq('id', roomId)
        
        roomClosed = true;
      } else if (remainingMembers && remainingMembers.length > 0) {
        // Transfer host to the oldest remaining member
        const { data: oldestMember, error: oldestError } = await supabase
          .from('watch_party_members')
          .select('*')
          .eq('room_id', roomId)
          .eq('is_online', true)
          .order('joined_at', { ascending: true })
          .limit(1)
          .single()

        if (!oldestError && oldestMember) {
          await supabase
            .from('watch_party_members')
            .update({ is_host: true })
            .eq('id', oldestMember.id)
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          message: roomClosed ? 'Left room and room was closed' : 'Successfully left room',
          roomClosed: roomClosed
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in leave-room function:', error)
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
