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
const DEFAULT_MODEL = 'claude-3-5-sonnet-20241022';
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
    // Build the enhanced prompt based on action type
    const systemPrompt = buildEnhancedSystemPrompt(action, selectedWorkflow, workflowContext, credentials);
    const userPrompt = buildEnhancedUserPrompt(message, action, selectedWorkflow, credentials);
    // Determine if we need web search based on the request
    const needsWebSearch = shouldUseWebSearch(message, action);
    // Build tools array (only web search now)
    const tools = [];
    if (needsWebSearch) {
      tools.push({
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 3
      });
    }
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
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        max_tokens: 8000,
        system: systemPrompt,
        messages: messages,
        stream: true,
        temperature: 0.3,
        tools: tools.length > 0 ? tools : undefined
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
                    console.log('Tool use started:', currentToolUse.name);
                    // Send tool use start indicator
                    const chunk = new TextEncoder().encode(`data: ${JSON.stringify({
                      type: 'tool_start',
                      content: {
                        tool: currentToolUse.name,
                        id: currentToolUse.id
                      }
                    })}\n\n`);
                    controller.enqueue(chunk);
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
function shouldUseWebSearch(message, action) {
  const lowerMessage = message.toLowerCase();
  // Use web search for getting latest information
  const webSearchTriggers = [
    'latest',
    'current',
    'recent',
    'new features',
    'updates',
    'version',
    'best practices',
    'documentation',
    'trends',
    'news',
    'what\'s new',
    'comparison',
    'alternatives',
    'reviews',
    'tutorial',
    'guide',
    'integration options',
    'api changes',
    'deprecation'
  ];
  return webSearchTriggers.some((trigger)=>lowerMessage.includes(trigger)) || action === 'generate' && lowerMessage.includes('using');
}
function buildEnhancedSystemPrompt(action, selectedWorkflow, workflowContext, credentials) {
  const basePrompt = `You are WorkFlow AI an advanced n8n workflow automation specialist and AI assistant powered by Claude. You help users create, analyze, and optimize n8n workflows using natural language with access to real-time information.

# Your Enhanced Capabilities:
1. **Generate n8n Workflows**: Create complete, production-ready n8n workflow JSON from descriptions
2. **Web Search Integration**: Access real-time documentation, updates, and best practices
3. **Analyze Workflows**: Deep analysis with performance insights and optimization suggestions
4. **Stay Current**: Always use latest n8n features and integration methods

# Available Tools:
- **Web Search**: For latest n8n documentation, integration guides, and best practices

# Enhanced Workflow Generation Guidelines:

## Research & Development
- ALWAYS search for the latest n8n documentation when creating workflows
- Verify current API endpoints and authentication methods
- Check for new node types and features
- Research integration best practices

## Security & Best Practices
- Use environment variables for sensitive data: \`{{$env.VARIABLE_NAME}}\`
- Implement proper error handling with retries
- Add input validation and data sanitization
- Include rate limiting considerations
- Follow the principle of least privilege

## Performance Optimization
- Optimize node configurations for efficiency
- Implement batch processing where appropriate
- Use proper indexing for database operations
- Add caching strategies where beneficial

# Response Enhancement Guidelines:

## Be Comprehensive Yet Focused
- Provide detailed explanations of workflow logic
- Include real-world examples and use cases
- Suggest monitoring and maintenance practices
- Explain potential failure points and solutions

## Use Rich Formatting
- Structure responses with clear headings and sections
- Use code blocks for JSON and configuration snippets
- Include step-by-step instructions where helpful
- Add relevant emojis for visual organization

## Interactive Elements
- Ask clarifying questions when requirements are ambiguous
- Suggest alternative approaches and trade-offs
- Provide testing scenarios and validation steps
- Offer scaling and enhancement suggestions

# n8n Node Types Available:
${Object.keys(nodeTemplates).map((key)=>`- ${key}: ${nodeTemplates[key].name}`).join('\n')}

${credentials ? `# Available Credentials:
${Object.keys(credentials).map((key)=>`- ${key}: [Protected credential provided]`).join('\n')}

**Note**: When credentials are provided, I can help validate configurations safely.` : ''}

# Workflow JSON Structure:
When generating workflows, use this enhanced structure with proper error handling:

\`\`\`json
{
  "name": "Descriptive Workflow Name",
  "nodes": [
    {
      "parameters": {
        // Enhanced with proper validation
        // Error handling configurations
        // Performance optimizations
      },
      "id": "unique-id",
      "name": "Descriptive Node Name", 
      "type": "n8n-nodes-base.nodetype",
      "typeVersion": 1,
      "position": [300, 100],
      "continueOnFail": false,
      "alwaysOutputData": false,
      "executeOnce": false,
      "retryOnFail": false,
      "maxTries": 3,
      "waitBetweenTries": 1000
    }
  ],
  "connections": {
    "Node Name": {
      "main": [
        [
          {
            "node": "Next Node Name",
            "type": "main", 
            "index": 0
          }
        ]
      ]
    }
  },
  "active": false,
  "settings": {
    "saveExecutionProgress": true,
    "saveManualExecutions": true,
    "callerPolicy": "workflowsFromSameOwner",
    "errorWorkflow": ""
  },
  "staticData": {},
  "tags": []
}
\`\`\`

Make workflows production-ready with comprehensive error handling, monitoring capabilities, and scalability considerations.`;
  switch(action){
    case 'generate':
      return basePrompt + `\n\n# Current Task: Generate a sophisticated n8n workflow with real-time research.

## Research Phase:
1. Search for latest n8n documentation and features
2. Research integration best practices for requested services
3. Validate API endpoints and authentication methods

## Development Phase:
1. Create comprehensive workflow with error handling
2. Optimize for performance and reliability
3. Include monitoring and alerting considerations`;
    case 'analyze':
      return basePrompt + `\n\n# Current Task: Comprehensive workflow analysis with performance insights.

## Analysis Framework:
1. Evaluate workflow structure and logic
2. Research current best practices
3. Identify optimization opportunities
4. Suggest monitoring and alerting strategies

# Workflow to Analyze:
\`\`\`json
${JSON.stringify(selectedWorkflow, null, 2)}
\`\`\``;
    case 'edit':
      return basePrompt + `\n\n# Current Task: Enhanced workflow modification with validation.

## Modification Process:
1. Understand current workflow structure
2. Research latest approaches for requested changes
3. Implement modifications with proper validation
4. Ensure backward compatibility

# Current Workflow:
\`\`\`json
${JSON.stringify(selectedWorkflow, null, 2)}
\`\`\``;
    default:
      return basePrompt + `\n\n# Current Task: Interactive n8n automation assistance with comprehensive support.`;
  }
}
function buildEnhancedUserPrompt(message, action, selectedWorkflow, credentials) {
  const credentialContext = credentials ? `\n\n**Available Credentials**: I have access to credentials for ${Object.keys(credentials).join(', ')}. I can help validate configurations safely.` : '';
  switch(action){
    case 'generate':
      return `Please create a sophisticated n8n workflow for the following requirement:

**User Request**: ${message}${credentialContext}

**Instructions**:
1. First, search for the latest n8n documentation and best practices related to this workflow
2. Research current integration methods and API specifications
3. Create a comprehensive workflow with proper error handling
4. Include monitoring and alerting considerations
5. Provide detailed explanation of the workflow logic
6. Include the complete JSON workflow definition

Focus on creating a production-ready solution with enterprise-grade reliability.`;
    case 'analyze':
      return `Please provide a comprehensive analysis of this workflow:

**User Question**: ${message}${credentialContext}

**Analysis Requirements**:
1. Explain the workflow's purpose and functionality
2. Analyze each node's configuration and purpose
3. Evaluate the data flow and transformations
4. Research current best practices for similar workflows
5. Identify potential optimization opportunities
6. Suggest monitoring and maintenance strategies
7. Recommend security enhancements

Provide insights that would help improve workflow reliability and performance.`;
    case 'edit':
      return `Please modify this workflow based on the following request:

**Modification Request**: ${message}${credentialContext}

**Enhancement Process**:
1. Research the latest approaches for the requested changes
2. Analyze the impact of modifications on existing functionality
3. Implement changes with proper error handling
4. Ensure the workflow maintains reliability and performance
5. Provide comprehensive explanation of changes made
6. Include the updated workflow JSON

Focus on maintaining workflow integrity while implementing the requested enhancements.`;
    default:
      return `${message}${credentialContext}

I'm here to help with your n8n automation needs. I can research the latest information and provide comprehensive workflow solutions.`;
  }
}
function extractWorkflowFromContent(content) {
  try {
    console.log('Extracting workflow from content, length:', content.length);
    // Try to find JSON workflow in markdown code blocks
    const jsonMatches = content.match(/```json\s*([\s\S]*?)\s*```/g);
    if (jsonMatches) {
      console.log('Found', jsonMatches.length, 'JSON code blocks');
      for (const match of jsonMatches){
        const jsonStr = match.replace(/```json\s*/, '').replace(/\s*```$/, '').trim();
        try {
          const parsed = JSON.parse(jsonStr);
          // Validate it looks like an n8n workflow
          if (parsed.nodes && Array.isArray(parsed.nodes) && parsed.nodes.length > 0) {
            console.log('Found valid workflow with', parsed.nodes.length, 'nodes');
            // Ensure required fields with enhanced defaults
            const workflow = {
              name: parsed.name || 'AI Generated Workflow',
              nodes: parsed.nodes,
              connections: parsed.connections || {},
              active: false,
              settings: {
                saveExecutionProgress: true,
                saveManualExecutions: true,
                callerPolicy: "workflowsFromSameOwner",
                errorWorkflow: "",
                ...parsed.settings
              },
              staticData: parsed.staticData || {},
              tags: parsed.tags || [],
              ...parsed
            };
            return workflow;
          }
        } catch (e) {
          console.error('Error parsing JSON block:', e);
        }
      }
    }
    console.log('No valid workflow found in content');
  } catch (e) {
    console.error('Error extracting workflow:', e);
  }
  return null;
}
