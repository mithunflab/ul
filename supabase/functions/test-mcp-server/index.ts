import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

serve(async (req) => {
  console.log(`${req.method} ${req.url}`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Initialize Supabase client for auth verification
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { url, authorization_token } = await req.json();

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Test MCP server connection by making a simple request
    const testResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization_token && { 'Authorization': `Bearer ${authorization_token}` })
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!testResponse.ok) {
      return new Response(JSON.stringify({
        success: false,
        error: `Server responded with status ${testResponse.status}: ${testResponse.statusText}`
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Try to get server capabilities (if it's a proper MCP server)
    let tools = [];
    try {
      const serverData = await testResponse.text();
      // For now, we'll return a basic success response
      // In a real implementation, you would parse MCP server response to get available tools
      tools = [
        { name: 'example_tool', description: 'Example tool from server' }
      ];
    } catch (e) {
      console.log('Could not parse server response, but connection successful');
    }

    return new Response(JSON.stringify({
      success: true,
      tools: tools,
      message: 'Successfully connected to MCP server'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error testing MCP server:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to connect to MCP server'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}); 