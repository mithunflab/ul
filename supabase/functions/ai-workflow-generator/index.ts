
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('AI Workflow Generator received request:', body);

    const { message, action, chatHistory } = body;

    // Simple response based on action type
    let response = '';
    
    switch (action) {
      case 'chat':
        response = `I received your message: "${message}". This is a placeholder response while the AI service is being configured.`;
        break;
      case 'generate':
        response = `Generating workflow for: "${message}". Please configure your preferred AI service (OpenAI, Claude, etc.) for full functionality.`;
        break;
      case 'analyze':
        response = `Analyzing workflow: "${message}". AI analysis will be available once you configure your AI service.`;
        break;
      default:
        response = `Processing request: "${message}". Please configure your AI service for enhanced responses.`;
    }

    return new Response(JSON.stringify({ 
      content: response,
      type: 'text'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-workflow-generator function:', error);
    return new Response(JSON.stringify({ 
      error: 'AI service temporarily unavailable',
      content: 'The AI service is currently being set up. Please try again in a moment.'
    }), {
      status: 200, // Return 200 to avoid frontend errors
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
