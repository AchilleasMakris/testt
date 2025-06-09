
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user from the request
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { action, authCode, events } = await req.json()

    const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')

    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ error: 'Google OAuth credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'auth') {
      // Generate Google OAuth URL
      const origin = req.headers.get('origin') || req.headers.get('referer')?.replace(/\/$/, '') || 'https://dahpyftaxouvpeiowyiy.supabase.co'
      const redirectUri = `${origin}/calendar`
      console.log('Using redirect URI:', redirectUri)
      
      const scope = 'https://www.googleapis.com/auth/calendar'
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent`

      return new Response(
        JSON.stringify({ authUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'exchange' && authCode) {
      // Exchange authorization code for access token
      const origin = req.headers.get('origin') || req.headers.get('referer')?.replace(/\/$/, '') || 'https://dahpyftaxouvpeiowyiy.supabase.co'
      const redirectUri = `${origin}/calendar`
      console.log('Using redirect URI for token exchange:', redirectUri)
      
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code: authCode,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      })

      const tokenData = await tokenResponse.json()

      if (tokenData.error) {
        console.error('Token exchange error:', tokenData)
        return new Response(
          JSON.stringify({ error: 'Failed to exchange authorization code' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Store the access token securely (you might want to encrypt this)
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ 
          google_access_token: tokenData.access_token,
          google_refresh_token: tokenData.refresh_token 
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Error storing tokens:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to store access token' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Helper function to refresh access token
    const refreshAccessToken = async (refreshToken: string) => {
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      })

      const refreshData = await refreshResponse.json()
      
      if (refreshData.error) {
        console.error('Token refresh error:', refreshData)
        throw new Error('Failed to refresh access token')
      }

      // Update the stored access token
      await supabaseClient
        .from('profiles')
        .update({ google_access_token: refreshData.access_token })
        .eq('id', user.id)

      return refreshData.access_token
    }

    // Helper function to make authenticated Google API calls with token refresh
    const makeGoogleApiCall = async (url: string, options: any, accessToken: string, refreshToken: string) => {
      let response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      // If token expired, refresh and retry
      if (response.status === 401) {
        console.log('Access token expired, refreshing...')
        const newAccessToken = await refreshAccessToken(refreshToken)
        
        response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${newAccessToken}`,
          },
        })
      }

      return response
    }

    if (action === 'sync' && events) {
      // Get stored access token
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('google_access_token, google_refresh_token')
        .eq('id', user.id)
        .single()

      if (!profile?.google_access_token) {
        return new Response(
          JSON.stringify({ error: 'Google Calendar not connected' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (!profile?.google_refresh_token) {
        return new Response(
          JSON.stringify({ error: 'Google refresh token missing. Please reconnect Google Calendar.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get user's timezone (default to their local timezone or UTC)
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
      console.log('Using timezone:', userTimezone)

      // Sync events to Google Calendar
      const results = []
      for (const event of events) {
        try {
          // Format dates properly for Google Calendar
          const startDate = new Date(event.start_time)
          const endDate = new Date(event.end_time)
          
          const googleEvent = {
            summary: `📚 ${event.title}`,
            description: event.description ? `${event.description}\n\nSynced from Student Dashboard` : 'Task synced from Student Dashboard',
            start: {
              dateTime: startDate.toISOString(),
              timeZone: userTimezone,
            },
            end: {
              dateTime: endDate.toISOString(),
              timeZone: userTimezone,
            },
            location: event.location || '',
            colorId: '9', // Blue color for academic tasks
            reminders: {
              useDefault: false,
              overrides: [
                { method: 'popup', minutes: 60 }, // 1 hour before
                { method: 'popup', minutes: 15 }, // 15 minutes before
              ],
            },
          }

          console.log('Creating Google Calendar event:', googleEvent)

          const response = await makeGoogleApiCall(
            'https://www.googleapis.com/calendar/v3/calendars/primary/events',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(googleEvent),
            },
            profile.google_access_token,
            profile.google_refresh_token
          )

          const result = await response.json()
          
          if (response.ok) {
            console.log('Successfully created event:', result.id)
            results.push({ 
              eventId: event.id, 
              success: true, 
              googleEventId: result.id,
              googleEventLink: result.htmlLink 
            })
          } else {
            console.error('Google Calendar API error:', result)
            results.push({ 
              eventId: event.id, 
              success: false, 
              error: result.error?.message || 'Unknown error' 
            })
          }
        } catch (error) {
          console.error('Error syncing event:', error)
          results.push({ 
            eventId: event.id, 
            success: false, 
            error: error.message 
          })
        }
      }

      // Log summary
      const successful = results.filter(r => r.success).length
      const failed = results.filter(r => !r.success).length
      console.log(`Sync complete: ${successful} successful, ${failed} failed`)

      return new Response(
        JSON.stringify({ results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
