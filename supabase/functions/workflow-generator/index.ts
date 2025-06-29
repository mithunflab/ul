import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};
// Claude API configuration
const CLAUDE_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
// Default model that supports web search
const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

// n8n node templates for different services
const nodeTemplates = {
  webhook: {
    type: "n8n-nodes-base.webhook",
    name: "Webhook",
    parameters: {
      httpMethod: "POST",
      path: "",
      options: {}
    }
  },
  http: {
    type: "n8n-nodes-base.httpRequest",
    name: "HTTP Request",
    parameters: {
      url: "",
      requestMethod: "GET",
      options: {}
    }
  },
  function: {
    type: "n8n-nodes-base.function",
    name: "Function",
    parameters: {
      functionCode: `// Add your JavaScript code here
return items.map(item => {
  return {
    json: {
      ...item.json,
      processed: true,
      timestamp: new Date().toISOString()
    }
  };
});`
    }
  },
  slack: {
    type: "n8n-nodes-base.slack",
    name: "Slack",
    parameters: {
      channel: "#general",
      text: "",
      username: "n8n-bot"
    }
  },
  gmail: {
    type: "n8n-nodes-base.gmail",
    name: "Gmail",
    parameters: {
      operation: "send",
      email: "",
      subject: "",
      message: ""
    }
  },
  googleSheets: {
    type: "n8n-nodes-base.googleSheets",
    name: "Google Sheets",
    parameters: {
      operation: "read",
      sheetId: "",
      range: "A1:Z1000"
    }
  },
  hubspot: {
    type: "n8n-nodes-base.hubspot",
    name: "HubSpot",
    parameters: {
      resource: "contact",
      operation: "get"
    }
  },
  airtable: {
    type: "n8n-nodes-base.airtable",
    name: "Airtable",
    parameters: {
      operation: "list",
      application: "",
      table: ""
    }
  },
  stripe: {
    type: "n8n-nodes-base.stripe",
    name: "Stripe",
    parameters: {
      resource: "charge",
      operation: "getAll"
    }
  }
};
serve(async (req)=>{
  console.log(`${req.method} ${req.url}`);
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({
      error: 'Method not allowed'
    }), {
      status: 405,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
  try {
    // Initialize Supabase client for auth verification
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    // Get user from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(JSON.stringify({
        error: 'No authorization header'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      console.error('Invalid authorization:', authError?.message);
      return new Response(JSON.stringify({
        error: 'Invalid authorization'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    if (!CLAUDE_API_KEY) {
      console.error('Claude API key not configured');
      return new Response(JSON.stringify({
        error: 'AI service not properly configured'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
          
        }
      });
    }
    const requestBody = await req.json();
    console.log('Request body:', requestBody);
    const { message, chatHistory = [], selectedWorkflow, action, workflowContext, credentials } = requestBody;
    if (!message) {
      return new Response(JSON.stringify({
        error: 'Message is required'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Fetch user's MCP servers
    const { data: mcpServers, error: mcpError } = await supabaseClient
      .from('mcp_servers')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'connected');

    if (mcpError) {
      console.error('Error fetching MCP servers:', mcpError);
    }

    // Build the enhanced prompt based on action type
    const systemPrompt = buildEnhancedSystemPrompt(action, selectedWorkflow, workflowContext, credentials);
    const userPrompt = buildEnhancedUserPrompt(message, action, selectedWorkflow, credentials);
    // Determine if we need web search based on the request
    const needsWebSearch = shouldUseWebSearch(message, action);
    // Build tools array (only web search now)
    const tools: any[] = [];
    if (needsWebSearch) {
      tools.push({
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 3
      });
    }

    // Prepare MCP servers for Claude API
    const mcpServersForClaude = (mcpServers || [])
      .filter(server => server.tool_configuration?.enabled !== false)
      .map(server => ({
        type: "url",
        url: server.url,
        name: server.name,
        authorization_token: server.authorization_token,
        tool_configuration: server.tool_configuration
      }));
    // Prepare messages for Claude
    const messages = [
      ...chatHistory.map((msg)=>({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
      {
        role: "user",
        content: userPrompt
      }
    ];
    console.log('Calling Claude API with tools:', tools.map((t)=>t.name));
    // Call Claude API with streaming and web search tool
    const claudeResponse = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        "anthropic-beta": "mcp-client-2025-04-04"
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        max_tokens: 8000,
        system: systemPrompt,
        messages: messages,
        stream: true,
        temperature: 0.3,
        tools: tools.length > 0 ? tools : undefined,
        mcp_servers: mcpServersForClaude.length > 0 ? mcpServersForClaude : undefined
      })
    });
    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('Claude API error:', claudeResponse.status, errorText);
      throw new Error(`Claude API error: ${claudeResponse.status} ${claudeResponse.statusText}`);
    }
    console.log('Claude API response received, starting stream');
    // Create a readable stream to handle Claude's streaming response with web search
    const readable = new ReadableStream({
      start (controller) {
        const reader = claudeResponse.body?.getReader();
        if (!reader) {
          console.error('No reader available from Claude response');
          controller.close();
          return;
        }
        const decoder = new TextDecoder();
        let buffer = '';
        let fullContent = '';
        let currentToolUse = null;
        const pump = async ()=>{
          try {
            const { done, value } = await reader.read();
            if (done) {
              console.log('Claude stream finished, full content length:', fullContent.length);
              // Try to extract workflow from full content before closing
              const workflowData = extractWorkflowFromContent(fullContent);
              if (workflowData) {
                const chunk = new TextEncoder().encode(`data: ${JSON.stringify({
                  type: 'workflow',
                  content: workflowData
                })}\n\n`);
                controller.enqueue(chunk);
              }
              controller.close();
              return;
            }
            buffer += decoder.decode(value, {
              stream: true
            });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines){
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                if (data === '[DONE]') {
                  console.log('Received [DONE] from Claude');
                  controller.close();
                  return;
                }
                try {
                  const parsed = JSON.parse(data);
                  // Handle regular text content
                  if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                    const textContent = parsed.delta.text;
                    fullContent += textContent;
                    // Send the text chunk
                    const chunk = new TextEncoder().encode(`data: ${JSON.stringify({
                      type: 'text',
                      content: textContent
                    })}\n\n`);
                    controller.enqueue(chunk);
                  } else if (parsed.type === 'content_block_start' && parsed.content_block?.type === 'server_tool_use') {
                    currentToolUse = parsed.content_block;
                    console.log('Tool use started:', currentToolUse?.name);
                    // Send tool use start indicator
                    if (currentToolUse && currentToolUse?.name && currentToolUse?.id) {
                    const chunk = new TextEncoder().encode(`data: ${JSON.stringify({
                      type: 'tool_start',
                      content: {
                        tool: currentToolUse.name,
                        id: currentToolUse.id
                      }
                    })}\n\n`);
                    controller.enqueue(chunk);
                    }
                  } else if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'input_json_delta') {
                    // Send tool input update
                    const chunk = new TextEncoder().encode(`data: ${JSON.stringify({
                      type: 'tool_input',
                      content: parsed.delta.partial_json
                    })}\n\n`);
                    controller.enqueue(chunk);
                  } else if (parsed.type === 'content_block_start' && parsed.content_block?.type === 'web_search_tool_result') {
                    console.log('Web search result received');
                    const chunk = new TextEncoder().encode(`data: ${JSON.stringify({
                      type: 'tool_result',
                      content: {
                        tool: 'web_search',
                        result: parsed.content_block.content
                      }
                    })}\n\n`);
                    controller.enqueue(chunk);
                  } else if (parsed.type === 'message_stop') {
                    console.log('Message stopped, extracting workflow from content');
                    const workflowData = extractWorkflowFromContent(fullContent);
                    if (workflowData) {
                      const chunk = new TextEncoder().encode(`data: ${JSON.stringify({
                        type: 'workflow',
                        content: workflowData
                      })}\n\n`);
                      controller.enqueue(chunk);
                    }
                    controller.close();
                    return;
                  } else if (parsed.type === 'error') {
                    console.error('Claude API error:', parsed);
                    const chunk = new TextEncoder().encode(`data: ${JSON.stringify({
                      type: 'error',
                      content: `Claude API error: ${parsed.error?.message || 'Unknown error'}`
                    })}\n\n`);
                    controller.enqueue(chunk);
                    controller.close();
                    return;
                  }
                } catch (e) {
                  console.error('Error parsing Claude response:', e, 'Data:', data);
                // Don't break the stream for parsing errors
                }
              }
            }
            return pump();
          } catch (error) {
            console.error('Streaming error:', error);
            const chunk = new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'error',
              content: `Streaming error: ${error.message}`
            })}\n\n`);
            controller.enqueue(chunk);
            controller.close();
          }
        };
        pump();
      }
    });
    return new Response(readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('Error in AI workflow generator:', error);
    return new Response(JSON.stringify({
      error: error.message,
      details: 'Check the edge function logs for more information'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});





function buildEnhancedSystemPrompt(action, selectedWorkflow, workflowContext, credentials) {
  const basePrompt = `You are WorkFlow AI, an expert n8n automation engineer. Your job is to create production-ready workflows FAST.

# CORE BEHAVIOR:
- Generate working n8n JSON immediately - NO explanations unless asked
- Start responses with "Here's your automation:" then provide JSON
- Use web search ONLY when you need current API docs or integration details
- Be direct, efficient, focused on delivery

# RESPONSE FORMAT:
Always respond with:
"Here's your automation:

\`\`\`json
{your workflow JSON here}
\`\`\`"

Only add explanations if user explicitly asks "explain" or "how does this work"

# N8N WORKFLOW STRUCTURE:
Generate complete JSON with this exact structure:

\`\`\`json
{
  "name": "Clear Workflow Name",
  "nodes": [
    {
      "parameters": {
        // Node-specific configuration
      },
      "id": "node-1",
      "name": "Descriptive Node Name", 
      "type": "n8n-nodes-base.webhook|httpRequest|function|slack|gmail|googleSheets|etc",
      "typeVersion": 1,
      "position": [x, y],
      "continueOnFail": false,
      "retryOnFail": true,
      "maxTries": 3
    }
  ],
  "connections": {
    "Node Name": {
      "main": [[{"node": "Next Node", "type": "main", "index": 0}]]
    }
  },
  "active": false,
  "settings": {
    "saveExecutionProgress": true,
    "saveManualExecutions": true,
    "executionOrder": "v1"
  },
  "staticData": {},
  "tags": ["automation", "ai-generated"]
}
\`\`\`

# OPTIMIZATION RULES:
1. **Credentials**: Use \`\{\{$credentials.CredentialName\}\}\` format
2. **Environment Variables**: Use \`\{\{$env.VARIABLE_NAME\}\}\`
3. **Node IDs**: Sequential (node-1, node-2, etc.)
4. **Positions**: Logical flow (start at [300, 300], space by [200, 0])
5. **Error Handling**: Always include retryOnFail: true, maxTries: 3
6. **Connections**: Proper main connections between nodes

# COMMON NODE PATTERNS:

**Webhook Trigger:**
\`\`\`json
{
  "parameters": {
    "httpMethod": "POST",
    "path": "webhook-path",
    "responseMode": "onReceived"
  },
  "type": "n8n-nodes-base.webhook"
}
\`\`\`

**HTTP Request:**
\`\`\`json
{
  "parameters": {
    "url": "https://api.example.com/endpoint",
    "requestMethod": "GET",
    "options": {}
  },
  "type": "n8n-nodes-base.httpRequest"
}
\`\`\`

**Function Node:**
\`\`\`json
{
  "parameters": {
    "functionCode": "return items.map(item => ({\\n  json: {\\n    ...item.json,\\n    processed: true\\n  }\\n}));"
  },
  "type": "n8n-nodes-base.function"
}
\`\`\`

**Slack:**
\`\`\`json
{
  "parameters": {
    "resource": "message",
    "operation": "post",
    "channel": "#general",
    "text": "Alert: {{$json.message}}",
    "username": "n8n-alert"
  },
  "type": "n8n-nodes-base.slack"
}
\`\`\`

**Gmail:**
\`\`\`json
{
  "parameters": {
    "operation": "send",
    "email": "{{$json.recipient}}",
    "subject": "{{$json.subject}}",
    "message": "{{$json.body}}"
  },
  "type": "n8n-nodes-base.gmail"
}
\`\`\`

# WHEN TO SEARCH:
Use web search if user mentions:
- "latest API", "current documentation"  
- "new integration", "updated method"
- "best practices", "recommended approach"
- Specific service APIs you're uncertain about

${credentials ? `# AVAILABLE CREDENTIALS:
${Object.keys(credentials).map(key => `- ${key}: Ready to use`).join('\n')}` : ''}

# TASK-SPECIFIC BEHAVIOR:`;

  switch(action) {
    case 'generate':
      return basePrompt + `
Generate n8n workflow JSON for the user's automation request.
- Search for current docs if needed for APIs/integrations
- Respond: "Here's your automation:" + JSON
- No explanations unless user asks`;

    case 'analyze':
      return basePrompt + `
Analyze this workflow and provide concise insights:

\`\`\`json
${JSON.stringify(selectedWorkflow, null, 2)}
\`\`\`

Focus on:
- Performance optimization opportunities  
- Error handling improvements
- Missing connections or logic
- Security considerations`;

    case 'edit':
      return basePrompt + `
Modify this workflow based on user request:

\`\`\`json
${JSON.stringify(selectedWorkflow, null, 2)}
\`\`\`

Return complete modified workflow JSON with "Here's your updated automation:"`;

    default:
      return basePrompt + `
Help with n8n automation. Generate working JSON workflows immediately.`;
  }
}

// Enhanced user prompt builder
function buildEnhancedUserPrompt(message, action, selectedWorkflow, credentials) {
  const credentialHint = credentials && Object.keys(credentials).length > 0 
    ? `\n\n[Available credentials: ${Object.keys(credentials).join(', ')}]` 
    : '';
  
  switch(action) {
    case 'generate':
      return `Build n8n automation: ${message}${credentialHint}`;
    
    case 'analyze':
      return `Analyze this workflow: ${message}${credentialHint}`;
    
    case 'edit':
      return `Modify workflow: ${message}${credentialHint}`;
    
    default:
      return `${message}${credentialHint}`;
  }
}

// Improved web search detection
function shouldUseWebSearch(message, action) {
  const searchTriggers = [
    // API/Documentation related
    'api documentation', 'api docs', 'latest api', 'current api',
    'integration guide', 'webhook setup', 'authentication method',
    
    // Version/Updates
    'latest version', 'new features', 'recent updates', 'current version',
    'deprecated', 'changelog',
    
    // Best practices
    'best practice', 'recommended way', 'optimal setup', 'proper configuration',
    
    // Specific integrations (when uncertain)
    'how to connect', 'integration steps', 'setup guide',
    
    // Comparison/Options
    'alternatives', 'comparison', 'which is better', 'options available'
  ];
  
  const lowerMessage = message.toLowerCase();
  
  // More targeted search triggers
  return searchTriggers.some(trigger => lowerMessage.includes(trigger)) ||
         (action === 'generate' && (
           lowerMessage.includes('latest') || 
           lowerMessage.includes('current') ||
           lowerMessage.includes('new integration') ||
           lowerMessage.includes('api endpoint')
         ));
}

// Enhanced workflow extraction with validation
function extractWorkflowFromContent(content) {
  try {
    console.log('Extracting workflow from content, length:', content.length);
    
    // Look for JSON code blocks
    const jsonMatches = content.match(/```json\s*([\s\S]*?)\s*```/g);
    
    if (jsonMatches) {
      console.log('Found', jsonMatches.length, 'JSON code blocks');
      
      for (const match of jsonMatches) {
        const jsonStr = match.replace(/```json\s*/, '').replace(/\s*```$/, '').trim();
        
        try {
          const parsed = JSON.parse(jsonStr);
          
          // Validate n8n workflow structure
          if (isValidN8nWorkflow(parsed)) {
            console.log('Found valid workflow with', parsed.nodes.length, 'nodes');
            
            // Enhance workflow with required fields
            return enhanceWorkflow(parsed);
          }
        } catch (e) {
          console.error('Error parsing JSON block:', e);
        }
      }
    }
    
    console.log('No valid workflow found in content');
    return null;
  } catch (e) {
    console.error('Error extracting workflow:', e);
    return null;
  }
}

// Validate n8n workflow structure
function isValidN8nWorkflow(workflow) {
  return workflow &&
         workflow.nodes &&
         Array.isArray(workflow.nodes) &&
         workflow.nodes.length > 0 &&
         workflow.nodes.every(node => 
           node.type && 
           node.name && 
           node.id &&
           node.parameters !== undefined
         );
}

// Enhance workflow with required fields
function enhanceWorkflow(workflow) {
  return {
    name: workflow.name || 'AI Generated Automation',
    nodes: workflow.nodes.map((node, index) => ({
      ...node,
      id: node.id || `node-${index + 1}`,
      position: node.position || [300 + (index * 200), 300],
      continueOnFail: node.continueOnFail ?? false,
      retryOnFail: node.retryOnFail ?? true,
      maxTries: node.maxTries ?? 3,
      typeVersion: node.typeVersion || 1
    })),
    connections: workflow.connections || {},
    active: false,
    settings: {
      saveExecutionProgress: true,
      saveManualExecutions: true,
      executionOrder: 'v1',
      ...workflow.settings
    },
    staticData: workflow.staticData || {},
    tags: workflow.tags || ['automation', 'ai-generated']
  };
}
