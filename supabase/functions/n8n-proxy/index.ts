import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface N8nConnection {
  id: string;
  base_url: string;
  api_key: string;
  instance_name: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Invalid authorization')
    }

    const url = new URL(req.url)
    const path = url.pathname.replace('/functions/v1/n8n-proxy', '')
    
    // Route handling
    if (req.method === 'POST' && path === '/test-connection') {
      return await handleTestConnection(req, user.id, supabaseClient)
    } else if (req.method === 'POST' && path === '/save-connection') {
      return await handleSaveConnection(req, user.id, supabaseClient)
    } else if (req.method === 'GET' && path === '/connections') {
      return await handleGetConnections(user.id, supabaseClient)
    } else if (req.method === 'DELETE' && path.startsWith('/connections/')) {
      const connectionId = path.split('/')[2]
      return await handleDeleteConnection(connectionId, user.id, supabaseClient)
    } else if (path.startsWith('/proxy/')) {
      return await handleN8nProxy(req, user.id, supabaseClient, path.replace('/proxy', ''))
    }

    return new Response('Not found', { status: 404, headers: corsHeaders })

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function handleTestConnection(req: Request, userId: string, supabase: any) {
  const { baseUrl, apiKey, instanceName } = await req.json()

  try {
    // Test connection to n8n instance
    const response = await fetch(`${baseUrl}/api/v1/workflows`, {
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Connection failed: ${response.status} ${response.statusText}`)
    }

    const workflows = await response.json()
    const workflowCount = Array.isArray(workflows) ? workflows.length : workflows.data?.length || 0

    // Get n8n version (if available)
    let version = 'Unknown'
    try {
      const versionResponse = await fetch(`${baseUrl}/api/v1/active-workflows`, {
        method: 'GET',
        headers: {
          'X-N8N-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
      })
      if (versionResponse.ok) {
        version = '1.15.2' // Default version, could be extracted from response headers
      }
    } catch (e) {
      console.log('Could not get version:', e)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Connection successful',
        data: {
          workflowCount,
          version,
          instanceName,
          baseUrl
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}

async function handleSaveConnection(req: Request, userId: string, supabase: any) {
  const { baseUrl, apiKey, instanceName, workflowCount, version } = await req.json()

  try {
    // First, deactivate any existing active connections
    await supabase
      .from('n8n_connections')
      .update({ is_active: false })
      .eq('user_id', userId)

    // Save new connection
    const { data, error } = await supabase
      .from('n8n_connections')
      .insert({
        user_id: userId,
        instance_name: instanceName,
        base_url: baseUrl,
        api_key: apiKey, // In production, this should be encrypted
        is_active: true,
        last_connected: new Date().toISOString(),
        connection_status: 'connected',
        version: version,
        workflow_count: workflowCount || 0,
        execution_count: 0
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Connection saved successfully',
        data: data
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}

async function handleGetConnections(userId: string, supabase: any) {
  try {
    const { data, error } = await supabase
      .from('n8n_connections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    // Don't return API keys in the response
    const sanitizedData = data.map((conn: any) => ({
      ...conn,
      api_key: '***hidden***'
    }))

    return new Response(
      JSON.stringify({
        success: true,
        data: sanitizedData
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}

async function handleDeleteConnection(connectionId: string, userId: string, supabase: any) {
  try {
    const { error } = await supabase
      .from('n8n_connections')
      .delete()
      .eq('id', connectionId)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Connection deleted successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}

async function handleN8nProxy(req: Request, userId: string, supabase: any, n8nPath: string) {
  try {
    // Get active connection for user
    const { data: connection, error } = await supabase
      .from('n8n_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (error || !connection) {
      throw new Error('No active n8n connection found')
    }

    // Proxy request to n8n instance
    const n8nUrl = `${connection.base_url}/api/v1${n8nPath}`
    const body = req.method !== 'GET' ? await req.text() : undefined

    const response = await fetch(n8nUrl, {
      method: req.method,
      headers: {
        'X-N8N-API-KEY': connection.api_key,
        'Content-Type': 'application/json',
      },
      body: body
    })

    const responseData = await response.text()

    // Update last connected timestamp
    await supabase
      .from('n8n_connections')
      .update({ 
        last_connected: new Date().toISOString(),
        connection_status: response.ok ? 'connected' : 'error'
      })
      .eq('id', connection.id)

    return new Response(responseData, {
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}