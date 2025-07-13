
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface MasterAuthRequest {
  action: 'signin' | 'verify';
  email?: string;
  password?: string;
  token?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, email, password, token }: MasterAuthRequest = await req.json();

    if (action === 'signin') {
      if (!email || !password) {
        return new Response(
          JSON.stringify({ error: 'Email and password are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Query master_users table directly
      const { data: user, error: userError } = await supabaseClient
        .from('master_users')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (userError || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // In a real implementation, you would hash and compare passwords
      // For now, we'll do a simple comparison (NOT SECURE - for demo only)
      const passwordMatch = password === 'admin123'; // This should use bcrypt or similar

      if (!passwordMatch) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update last login
      await supabaseClient
        .from('master_users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', user.id);

      // Create a simple JWT-like token (in production, use proper JWT)
      const authToken = btoa(JSON.stringify({
        userId: user.id,
        email: user.email,
        role: user.role,
        exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      }));

      // Log the authentication
      await supabaseClient
        .from('system_audit_logs')
        .insert({
          master_user_id: user.id,
          action: 'master_login',
          resource_type: 'authentication',
          details: { email: user.email },
          ip_address: req.headers.get('x-forwarded-for') || 'unknown'
        });

      return new Response(
        JSON.stringify({
          token: authToken,
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            is_active: user.is_active,
            last_login_at: user.last_login_at
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'verify') {
      if (!token) {
        return new Response(
          JSON.stringify({ error: 'Token is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      try {
        const decoded = JSON.parse(atob(token));
        
        // Check if token is expired
        if (decoded.exp < Date.now()) {
          return new Response(
            JSON.stringify({ error: 'Token expired' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Verify user still exists and is active
        const { data: user, error: userError } = await supabaseClient
          .from('master_users')
          .select('*')
          .eq('id', decoded.userId)
          .eq('is_active', true)
          .single();

        if (userError || !user) {
          return new Response(
            JSON.stringify({ error: 'Invalid token' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            user: {
              id: user.id,
              email: user.email,
              full_name: user.full_name,
              role: user.role,
              is_active: user.is_active,
              last_login_at: user.last_login_at
            }
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: 'Invalid token format' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Master auth error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
