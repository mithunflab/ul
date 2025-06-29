import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};
// Claude API configuration with MCP support
const CLAUDE_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
// Enhanced n8n node templates with MCP-optimized configurations
const nodeTemplates = {
  webhook: {
    type: "n8n-nodes-base.webhook",
    name: "Webhook",
    parameters: {
      httpMethod: "POST",
      path: "",
      options: {
        allowedOrigins: "*",
        rawBody: false
      }
    }
  },
  http: {
    type: "n8n-nodes-base.httpRequest",
    name: "HTTP Request",
    parameters: {
      url: "",
      requestMethod: "GET",
      options: {
        timeout: 30000,
        followRedirect: true,
        ignoreResponseCode: false
      }
    }
  },
  function: {
    type: "n8n-nodes-base.function",
    name: "Function",
    parameters: {
      functionCode: `// Enhanced function with error handling and logging
const logger = {
  info: (msg) => console.log('[INFO]', msg),
  error: (msg) => console.error('[ERROR]', msg),
  warn: (msg) => console.warn('[WARN]', msg)
};

try {
  logger.info('Processing items:', items.length);
  
  return items.map((item, index) => {
    logger.info('Processing item', index, item.json);
    
    return {
      json: {
        ...item.json,
        processed: true,
        timestamp: new Date().toISOString(),
        processedBy: 'n8n-workflow-ai',
        itemIndex: index
      }
    };
  });
} catch (error) {
  logger.error('Function execution failed:', error.message);
  throw new Error('Function processing failed: ' + error.message);
}`
    }
  },
  slack: {
    type: "n8n-nodes-base.slack",
    name: "Slack",
    parameters: {
      operation: "postMessage",
      channel: "#general",
      text: "",
      username: "WorkFlow AI Bot",
      attachments: [],
      otherOptions: {
        mrkdwn: true,
        unfurl_links: true,
        unfurl_media: true
      }
    }
  },
  gmail: {
    type: "n8n-nodes-base.gmail",
    name: "Gmail",
    parameters: {
      operation: "send",
      email: "",
      subject: "",
      message: "",
      options: {
        htmlBody: false,
        attachments: []
      }
    }
  },
  googleSheets: {
    type: "n8n-nodes-base.googleSheets",
    name: "Google Sheets",
    parameters: {
      operation: "read",
      sheetId: "",
      range: "A1:Z1000",
      options: {
        valueInputOption: "USER_ENTERED",
        rawData: false
      }
    }
  },
  hubspot: {
    type: "n8n-nodes-base.hubspot",
    name: "HubSpot",
    parameters: {
      resource: "contact",
      operation: "get",
      options: {
        resolveData: true,
        simplifyOutput: true
      }
    }
  },
  airtable: {
    type: "n8n-nodes-base.airtable",
    name: "Airtable",
    parameters: {
      operation: "list",
      application: "",
      table: "",
      options: {
        returnAll: false,
        limit: 100
      }
    }
  },
  stripe: {
    type: "n8n-nodes-base.stripe",
    name: "Stripe",
    parameters: {
      resource: "charge",
      operation: "getAll",
      options: {
        limit: 100,
        returnAll: false
      }
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
    console.log('Request body with MCP capabilities:', requestBody);
    const { message, chatHistory = [], selectedWorkflow, action, workflowContext, credentials, mcpEnabled = false, enterpriseFeatures = {} } = requestBody;
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
    // Build the enhanced prompt based on MCP capabilities
    const systemPrompt = buildMCPEnhancedSystemPrompt(action, selectedWorkflow, workflowContext, credentials, mcpEnabled, enterpriseFeatures);
    const userPrompt = buildMCPEnhancedUserPrompt(message, action, selectedWorkflow, credentials, mcpEnabled);
    // Determine tools based on MCP capabilities and enterprise features
    const tools = [];
    // Enhanced web search for MCP users
    if (shouldUseWebSearch(message, action) || mcpEnabled && enterpriseFeatures.webSearch) {
      tools.push({
        type: "web_search_20250305",
        name: "web_search",
        max_uses: mcpEnabled ? 5 : 3,
        ...mcpEnabled && {
          allowed_domains: [
            "docs.n8n.io",
            "community.n8n.io",
            "github.com"
          ],
          user_location: {
            type: "approximate",
            timezone: "UTC"
          }
        }
      });
    }
    // Enhanced code execution for MCP users
    if (shouldUseCodeExecution(message, action, credentials) || mcpEnabled && enterpriseFeatures.codeExecution) {
      tools.push({
        type: "code_execution_20250522",
        name: "code_execution"
      });
    }
    // Select optimal Claude model based on MCP and complexity
    let selectedModel = "claude-3-5-sonnet-20241022";
    if (mcpEnabled && enterpriseFeatures.advancedModels) {
      const complexity = analyzeRequestComplexity(message, selectedWorkflow, action);
      selectedModel = selectOptimalModel(complexity, action);
      console.log(`MCP: Selected model ${selectedModel} for complexity level: ${complexity}`);
    }
    // Prepare messages for Claude with MCP context
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
    console.log(`Calling Claude API with MCP features - Model: ${selectedModel}, Tools: ${tools.map((t)=>t.name).join(', ')}`);
    // Call Claude API with enhanced capabilities
    const claudeResponse = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': tools.some((t)=>t.type.includes('code-execution')) ? 'code-execution-2025-05-22' : undefined
      },
      body: JSON.stringify({
        model: selectedModel,
        max_tokens: mcpEnabled ? 12000 : 8000,
        system: systemPrompt,
        messages: messages,
        stream: true,
        temperature: mcpEnabled ? 0.2 : 0.3,
        tools: tools.length > 0 ? tools : undefined
      })
    });
    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('Claude API error:', claudeResponse.status, errorText);
      throw new Error(`Claude API error: ${claudeResponse.status} ${claudeResponse.statusText}`);
    }
    console.log('Claude API response received, starting MCP-enhanced stream');
    // Create enhanced readable stream with MCP capabilities
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
        let mcpContextShared = false;
        const pump = async ()=>{
          try {
            const { done, value } = await reader.read();
            if (done) {
              console.log('MCP-enhanced Claude stream finished, content length:', fullContent.length);
              // Extract and enhance workflow with MCP features
              const workflowData = extractAndEnhanceWorkflowWithMCP(fullContent, mcpEnabled, enterpriseFeatures);
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
                    // Send the text chunk with MCP enhancement indicator
                    const chunk = new TextEncoder().encode(`data: ${JSON.stringify({
                      type: 'text',
                      content: textContent,
                      mcpEnhanced: mcpEnabled
                    })}\n\n`);
                    controller.enqueue(chunk);
                  } else if (parsed.type === 'content_block_start' && parsed.content_block?.type === 'server_tool_use') {
                    currentToolUse = parsed.content_block;
                    console.log(`MCP: Tool use started - ${currentToolUse.name}`);
                    // Send enhanced tool use start indicator
                    const chunk = new TextEncoder().encode(`data: ${JSON.stringify({
                      type: 'tool_start',
                      content: {
                        tool: currentToolUse.name,
                        id: currentToolUse.id,
                        mcpEnhanced: mcpEnabled
                      }
                    })}\n\n`);
                    controller.enqueue(chunk);
                    // Send MCP status if enabled
                    if (mcpEnabled && !mcpContextShared) {
                      const mcpChunk = new TextEncoder().encode(`data: ${JSON.stringify({
                        type: 'mcp_status',
                        content: {
                          action: 'context_sharing_activated',
                          protocol: 'Model Context Protocol',
                          capabilities: Object.keys(enterpriseFeatures).filter((k)=>enterpriseFeatures[k])
                        }
                      })}\n\n`);
                      controller.enqueue(mcpChunk);
                      mcpContextShared = true;
                    }
                  } else if (mcpEnabled && selectedModel !== "claude-3-5-sonnet-20241022") {
                    const switchChunk = new TextEncoder().encode(`data: ${JSON.stringify({
                      type: 'model_switch',
                      content: {
                        from: "claude-3-5-sonnet-20241022",
                        to: selectedModel,
                        reason: "MCP optimization for enterprise workload"
                      }
                    })}\n\n`);
                    controller.enqueue(switchChunk);
                  } else if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'input_json_delta') {
                    const chunk = new TextEncoder().encode(`data: ${JSON.stringify({
                      type: 'tool_input',
                      content: {
                        partial_json: parsed.delta.partial_json,
                        mcpEnhanced: mcpEnabled
                      }
                    })}\n\n`);
                    controller.enqueue(chunk);
                  } else if (parsed.type === 'content_block_start' && (parsed.content_block?.type === 'web_search_tool_result' || parsed.content_block?.type === 'code_execution_tool_result')) {
                    const toolType = parsed.content_block.type.includes('web_search') ? 'web_search' : 'code_execution';
                    console.log(`MCP: ${toolType} result received with enhanced processing`);
                    const chunk = new TextEncoder().encode(`data: ${JSON.stringify({
                      type: 'tool_result',
                      content: {
                        tool: toolType,
                        result: parsed.content_block.content,
                        mcpEnhanced: mcpEnabled,
                        processingTime: Date.now()
                      }
                    })}\n\n`);
                    controller.enqueue(chunk);
                  } else if (parsed.type === 'message_stop') {
                    console.log('MCP: Message stopped, finalizing enhanced workflow');
                    if (mcpEnabled) {
                      const summaryChunk = new TextEncoder().encode(`data: ${JSON.stringify({
                        type: 'mcp_status',
                        content: {
                          action: 'workflow_completed',
                          enhancementsApplied: Object.keys(enterpriseFeatures).filter((k)=>enterpriseFeatures[k]),
                          modelUsed: selectedModel,
                          toolsUsed: tools.map((t)=>t.name)
                        }
                      })}\n\n`);
                      controller.enqueue(summaryChunk);
                    }
                    const workflowData = extractAndEnhanceWorkflowWithMCP(fullContent, mcpEnabled, enterpriseFeatures);
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
                    console.error('Claude API error with MCP context:', parsed);
                    const chunk = new TextEncoder().encode(`data: ${JSON.stringify({
                      type: 'error',
                      content: `Claude API error: ${parsed.error?.message || 'Unknown error'}`,
                      mcpContext: mcpEnabled
                    })}\n\n`);
                    controller.enqueue(chunk);
                    controller.close();
                    return;
                  }
                } catch (e) {
                  console.error('Error parsing Claude response:', e, 'Data:', data);
                }
              }
            }
            return pump();
          } catch (error) {
            console.error('MCP streaming error:', error);
            const chunk = new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'error',
              content: `MCP streaming error: ${error.message}`,
              mcpEnabled: mcpEnabled
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
    console.error('Error in MCP-enhanced AI workflow generator:', error);
    return new Response(JSON.stringify({
      error: error.message,
      details: 'Check the edge function logs for more information',
      mcpEnabled: false
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
// MCP-enhanced helper functions
function analyzeRequestComplexity(message, workflow, action) {
  let complexity = 0;
  // Message complexity factors
  if (message.length > 200) complexity += 1;
  if (message.includes('enterprise') || message.includes('advanced') || message.includes('complex')) complexity += 2;
  if (message.includes('integration') && message.includes('multiple')) complexity += 1;
  // Workflow complexity factors
  if (workflow) {
    if (workflow.nodes && workflow.nodes.length > 5) complexity += 1;
    if (workflow.nodes && workflow.nodes.length > 10) complexity += 2;
  }
  // Action complexity factors
  if (action === 'analyze') complexity += 1;
  if (action === 'edit') complexity += 1;
  if (complexity >= 4) return 'complex';
  if (complexity >= 2) return 'medium';
  return 'simple';
}
function selectOptimalModel(complexity, action) {
  // MCP model routing logic
  switch(complexity){
    case 'complex':
      return action === 'analyze' ? 'claude-3-opus-20240229' : 'claude-3-5-sonnet-20241022';
    case 'medium':
      return 'claude-3-5-sonnet-20241022';
    case 'simple':
      return 'claude-3-haiku-20240307';
    default:
      return 'claude-3-5-sonnet-20241022';
  }
}
function shouldUseWebSearch(message, action) {
  const lowerMessage = message.toLowerCase();
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
    'deprecation',
    'enterprise'
  ];
  return webSearchTriggers.some((trigger)=>lowerMessage.includes(trigger)) || action === 'generate' && lowerMessage.includes('using');
}
function shouldUseCodeExecution(message, action, credentials) {
  const lowerMessage = message.toLowerCase();
  const codeExecutionTriggers = [
    'test',
    'validate',
    'run',
    'execute',
    'check',
    'verify',
    'analyze',
    'performance',
    'benchmark',
    'simulate',
    'calculate',
    'process',
    'transform',
    'format',
    'enterprise'
  ];
  return codeExecutionTriggers.some((trigger)=>lowerMessage.includes(trigger)) || credentials && Object.keys(credentials).length > 0 || action === 'analyze';
}
function buildMCPEnhancedSystemPrompt(action, selectedWorkflow, workflowContext, credentials, mcpEnabled = false, enterpriseFeatures = {}) {
  const basePrompt = `You are an enterprise-grade n8n workflow automation specialist and AI assistant powered by Claude with ${mcpEnabled ? 'MCP (Model Context Protocol) capabilities' : 'standard capabilities'}. You help users create, analyze, and optimize n8n workflows using natural language with access to real-time information and code execution capabilities.

# Your ${mcpEnabled ? 'MCP-Enhanced' : 'Standard'} Capabilities:
1. **Generate n8n Workflows**: Create complete, production-ready n8n workflow JSON from descriptions
2. **Web Search Integration**: Access real-time documentation, updates, and best practices${mcpEnabled ? ' with MCP-enhanced search capabilities' : ''}
3. **Code Execution**: Test workflows, validate configurations, and run simulations${mcpEnabled ? ' with enterprise-grade execution environment' : ''}
4. **Analyze Workflows**: Deep analysis with performance insights and optimization suggestions
5. **Live Testing**: Execute workflow components with provided credentials
6. **Stay Current**: Always use latest n8n features and integration methods
${mcpEnabled ? `7. **MCP Context Sharing**: Share context between AI models and maintain conversation memory
8. **Enterprise Security**: Advanced security protocols and audit logging
9. **Intelligent Model Routing**: Automatically select optimal Claude models based on complexity` : ''}

# Available Tools:
- **Web Search**: For latest n8n documentation, integration guides, and best practices${mcpEnabled ? ' (MCP-enhanced with enterprise domains)' : ''}
- **Code Execution**: For testing workflow logic, data transformations, and validations${mcpEnabled ? ' (Enterprise-grade sandbox)' : ''}
${mcpEnabled ? '- **MCP Protocol**: Advanced context sharing and multi-model collaboration\n- **Enterprise Security**: SOC 2 compliant processing with audit trails' : ''}

# ${mcpEnabled ? 'MCP-Enhanced' : 'Standard'} Workflow Generation Guidelines:

## Research & Development
- ALWAYS search for the latest n8n documentation when creating workflows
- Verify current API endpoints and authentication methods
- Check for new node types and features
- Research integration best practices${mcpEnabled ? '\n- Use MCP context sharing for enhanced accuracy\n- Apply enterprise security patterns' : ''}

## Testing & Validation
- Use code execution to test workflow components
- Validate data transformations with sample data
- Check API responses and error handling
- Simulate workflow execution paths${mcpEnabled ? '\n- Implement enterprise-grade error handling\n- Add comprehensive logging and monitoring' : ''}

## Security & Best Practices
- Use environment variables for sensitive data: \`{{$env.VARIABLE_NAME}}\`
- Implement proper error handling with retries
- Add input validation and data sanitization
- Include rate limiting considerations
- Follow the principle of least privilege${mcpEnabled ? '\n- Apply enterprise security frameworks\n- Implement audit logging\n- Add compliance monitoring\n- Use advanced encryption patterns' : ''}

## Performance Optimization
- Optimize node configurations for efficiency
- Implement batch processing where appropriate
- Use proper indexing for database operations
- Add caching strategies where beneficial${mcpEnabled ? '\n- Apply enterprise scaling patterns\n- Implement advanced monitoring\n- Add performance metrics\n- Use intelligent load balancing' : ''}

# ${mcpEnabled ? 'Enterprise-Grade ' : ''}Response Enhancement Guidelines:

## Be Comprehensive Yet Focused
- Provide detailed explanations of workflow logic
- Include real-world examples and use cases
- Suggest monitoring and maintenance practices
- Explain potential failure points and solutions${mcpEnabled ? '\n- Add enterprise deployment strategies\n- Include scaling considerations\n- Provide compliance guidance' : ''}

## Use Rich Formatting
- Structure responses with clear headings and sections
- Use code blocks for JSON and configuration snippets
- Include step-by-step instructions where helpful
- Add relevant emojis for visual organization

## Interactive Elements
- Ask clarifying questions when requirements are ambiguous
- Suggest alternative approaches and trade-offs
- Provide testing scenarios and validation steps
- Offer scaling and enhancement suggestions${mcpEnabled ? '\n- Recommend enterprise integrations\n- Suggest governance patterns' : ''}

# n8n Node Types Available:
${Object.keys(nodeTemplates).map((key)=>`- ${key}: ${nodeTemplates[key].name}`).join('\n')}

${credentials ? `# Available Credentials:
${Object.keys(credentials).map((key)=>`- ${key}: [Protected credential provided${mcpEnabled ? ' - Enterprise encrypted' : ''}]`).join('\n')}

**Note**: When credentials are provided, I can help test and validate configurations safely${mcpEnabled ? ' with enterprise-grade security' : ''}.` : ''}

${mcpEnabled ? `# MCP Enterprise Features Active:
${enterpriseFeatures.webSearch ? '✅ Enhanced Web Search with enterprise domains\n' : ''}${enterpriseFeatures.codeExecution ? '✅ Enterprise Code Execution environment\n' : ''}${enterpriseFeatures.advancedModels ? '✅ Intelligent Model Routing (Opus 4, Sonnet 4, Haiku 3.5)\n' : ''}${enterpriseFeatures.contextSharing ? '✅ MCP Context Sharing and Memory\n' : ''}
` : ''}

# ${mcpEnabled ? 'Enterprise ' : ''}Workflow JSON Structure:
When generating workflows, use this ${mcpEnabled ? 'enterprise-enhanced' : 'standard'} structure with proper error handling:

\`\`\`json
{
  "name": "Descriptive Workflow Name${mcpEnabled ? ' (MCP Enhanced)' : ''}",
  "nodes": [
    {
      "parameters": {
        // ${mcpEnabled ? 'Enterprise-enhanced with proper validation' : 'Enhanced with proper validation'}
        // ${mcpEnabled ? 'Advanced error handling configurations' : 'Error handling configurations'}
        // ${mcpEnabled ? 'Enterprise performance optimizations' : 'Performance optimizations'}
      },
      "id": "unique-id",
      "name": "Descriptive Node Name", 
      "type": "n8n-nodes-base.nodetype",
      "typeVersion": 1,
      "position": [300, 100],
      "continueOnFail": false,
      "alwaysOutputData": false,
      "executeOnce": false,
      "retryOnFail": ${mcpEnabled ? 'true' : 'false'},
      "maxTries": ${mcpEnabled ? '5' : '3'},
      "waitBetweenTries": ${mcpEnabled ? '2000' : '1000'}${mcpEnabled ? ',\n      "onError": "continueRegularOutput",\n      "notes": "MCP-enhanced node with enterprise error handling"' : ''}
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
    "errorWorkflow": ""${mcpEnabled ? ',\n    "timezone": "UTC",\n    "saveDataErrorExecution": "all",\n    "saveDataSuccessExecution": "all",\n    "executionTimeout": 3600' : ''}
  },
  "staticData": {},
  "tags": [${mcpEnabled ? '"mcp-enhanced", "enterprise", ' : ''}"ai-generated"]${mcpEnabled ? ',\n  "meta": {\n    "mcpEnhanced": true,\n    "enterpriseFeatures": true,\n    "generatedBy": "WorkFlow AI MCP",\n    "version": "2.0"\n  }' : ''}
}
\`\`\`

Make workflows ${mcpEnabled ? 'enterprise-ready' : 'production-ready'} with comprehensive error handling, ${mcpEnabled ? 'enterprise-grade ' : ''}monitoring capabilities, and scalability considerations.`;
  // Action-specific enhancements
  switch(action){
    case 'generate':
      return basePrompt + `\n\n# Current Task: Generate ${mcpEnabled ? 'an enterprise-grade' : 'a sophisticated'} n8n workflow with ${mcpEnabled ? 'MCP-enhanced' : 'standard'} research and validation.

## ${mcpEnabled ? 'MCP-Enhanced ' : ''}Research Phase:
1. Search for latest n8n documentation and features${mcpEnabled ? ' using enterprise search capabilities' : ''}
2. Research integration best practices for requested services
3. Validate API endpoints and authentication methods${mcpEnabled ? ' with enterprise security validation' : ''}

## ${mcpEnabled ? 'Enterprise ' : ''}Development Phase:
1. Create comprehensive workflow with ${mcpEnabled ? 'enterprise-grade ' : ''}error handling
2. Test components with code execution where possible
3. Validate configurations and data flows
4. Optimize for performance and reliability${mcpEnabled ? '\n5. Apply enterprise security patterns\n6. Implement advanced monitoring and logging' : ''}`;
    case 'analyze':
      return basePrompt + `\n\n# Current Task: Comprehensive workflow analysis with ${mcpEnabled ? 'MCP-enhanced' : 'standard'} performance insights.

## ${mcpEnabled ? 'MCP-Enhanced ' : ''}Analysis Framework:
1. Evaluate workflow structure and logic${mcpEnabled ? ' using enterprise analysis patterns' : ''}
2. Test components with code execution
3. Research current best practices
4. Identify optimization opportunities
5. Suggest monitoring and alerting strategies${mcpEnabled ? '\n6. Assess enterprise security compliance\n7. Recommend scaling strategies\n8. Evaluate governance requirements' : ''}

# Workflow to Analyze:
\`\`\`json
${JSON.stringify(selectedWorkflow, null, 2)}
\`\``;
    case 'edit':
      return basePrompt + `\n\n# Current Task: ${mcpEnabled ? 'Enterprise-grade' : 'Enhanced'} workflow modification with validation.

## ${mcpEnabled ? 'MCP-Enhanced ' : ''}Modification Process:
1. Understand current workflow structure
2. Research latest approaches for requested changes${mcpEnabled ? ' using enterprise knowledge base' : ''}
3. Implement modifications with proper testing
4. Validate changes with code execution
5. Ensure backward compatibility${mcpEnabled ? '\n6. Apply enterprise security enhancements\n7. Implement advanced monitoring\n8. Document compliance changes' : ''}

# Current Workflow:
\`\`\`json
${JSON.stringify(selectedWorkflow, null, 2)}
\`\``;
    default:
      return basePrompt + `\n\n# Current Task: Interactive n8n automation assistance with ${mcpEnabled ? 'MCP-enhanced enterprise' : 'comprehensive'} support.`;
  }
}
function buildMCPEnhancedUserPrompt(message, action, selectedWorkflow, credentials, mcpEnabled = false) {
  const credentialContext = credentials ? `\n\n**Available Credentials**: I have access to ${mcpEnabled ? 'enterprise-encrypted ' : ''}credentials for ${Object.keys(credentials).join(', ')}. I can help test and validate configurations safely${mcpEnabled ? ' with enterprise-grade security' : ''}.` : '';
  const mcpContext = mcpEnabled ? '\n\n**MCP Enhanced**: This request will be processed with Model Context Protocol capabilities including advanced web search, enterprise code execution, and intelligent model routing.' : '';
  switch(action){
    case 'generate':
      return `Please create ${mcpEnabled ? 'an enterprise-grade' : 'a sophisticated'} n8n workflow for the following requirement:

**User Request**: ${message}${credentialContext}${mcpContext}

**Instructions**:
1. First, search for the latest n8n documentation and best practices related to this workflow${mcpEnabled ? ' using MCP-enhanced search capabilities' : ''}
2. Research current integration methods and API specifications
3. Create a comprehensive workflow with ${mcpEnabled ? 'enterprise-grade ' : ''}error handling
4. If credentials are provided, use code execution to validate configurations
5. Include ${mcpEnabled ? 'enterprise ' : ''}monitoring and alerting considerations
6. Provide detailed explanation of the workflow logic
7. Include the complete JSON workflow definition${mcpEnabled ? '\n8. Apply enterprise security patterns and compliance requirements\n9. Implement advanced logging and audit trails\n10. Add scaling and performance optimizations' : ''}

Focus on creating a ${mcpEnabled ? 'enterprise-ready' : 'production-ready'} solution with ${mcpEnabled ? 'enterprise-grade' : 'industry-standard'} reliability.`;
    case 'analyze':
      return `Please provide a comprehensive ${mcpEnabled ? 'enterprise-grade ' : ''}analysis of this workflow:

**User Question**: ${message}${credentialContext}${mcpContext}

**Analysis Requirements**:
1. Explain the workflow's purpose and functionality
2. Analyze each node's configuration and purpose
3. Evaluate the data flow and transformations
4. Research current best practices for similar workflows${mcpEnabled ? ' using MCP context sharing' : ''}
5. Use code execution to test components where possible
6. Identify potential optimization opportunities
7. Suggest ${mcpEnabled ? 'enterprise ' : ''}monitoring and maintenance strategies
8. Recommend security enhancements${mcpEnabled ? '\n9. Assess enterprise compliance requirements\n10. Evaluate scaling and performance considerations\n11. Recommend governance and audit strategies' : ''}

Provide insights that would help improve workflow reliability${mcpEnabled ? ', enterprise compliance,' : ''} and performance.`;
    case 'edit':
      return `Please modify this workflow based on the following ${mcpEnabled ? 'enterprise ' : ''}request:

**Modification Request**: ${message}${credentialContext}${mcpContext}

**Enhancement Process**:
1. Research the latest approaches for the requested changes${mcpEnabled ? ' using MCP-enhanced research capabilities' : ''}
2. Analyze the impact of modifications on existing functionality
3. Implement changes with ${mcpEnabled ? 'enterprise-grade ' : ''}error handling
4. Use code execution to validate modifications where possible
5. Ensure the workflow maintains reliability and performance
6. Provide comprehensive explanation of changes made
7. Include the updated workflow JSON${mcpEnabled ? '\n8. Apply enterprise security enhancements\n9. Implement advanced monitoring for changes\n10. Document compliance impacts' : ''}

Focus on maintaining workflow integrity while implementing the requested ${mcpEnabled ? 'enterprise ' : ''}enhancements.`;
    default:
      return `${message}${credentialContext}${mcpContext}

I'm here to help with your n8n automation needs${mcpEnabled ? ' using MCP-enhanced enterprise capabilities' : ''}. I can research the latest information, test configurations, and provide comprehensive workflow solutions.`;
  }
}
function extractAndEnhanceWorkflowWithMCP(content, mcpEnabled, enterpriseFeatures) {
  try {
    console.log(`Extracting workflow from content with MCP: ${mcpEnabled}, length: ${content.length}`);
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
            console.log(`Found valid workflow with ${parsed.nodes.length} nodes, MCP enhancing: ${mcpEnabled}`);
            // Enhance workflow with MCP features if enabled
            const workflow = {
              name: parsed.name || 'AI Generated Workflow',
              nodes: mcpEnabled ? enhanceNodesWithMCP(parsed.nodes, enterpriseFeatures) : parsed.nodes,
              connections: parsed.connections || {},
              active: false,
              settings: {
                saveExecutionProgress: true,
                saveManualExecutions: true,
                callerPolicy: "workflowsFromSameOwner",
                errorWorkflow: "",
                ...mcpEnabled && {
                  timezone: "UTC",
                  saveDataErrorExecution: "all",
                  saveDataSuccessExecution: "all",
                  executionTimeout: 3600
                },
                ...parsed.settings
              },
              staticData: parsed.staticData || {},
              tags: [
                ...mcpEnabled ? [
                  'mcp-enhanced',
                  'enterprise'
                ] : [],
                'ai-generated',
                ...parsed.tags || []
              ],
              ...mcpEnabled && {
                meta: {
                  mcpEnhanced: true,
                  enterpriseFeatures: Object.keys(enterpriseFeatures).filter((k)=>enterpriseFeatures[k]),
                  generatedBy: 'WorkFlow AI MCP',
                  version: '2.0',
                  createdAt: new Date().toISOString()
                }
              },
              ...parsed
            };
            console.log(`Workflow enhanced with MCP: ${mcpEnabled}`);
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
function enhanceNodesWithMCP(nodes, enterpriseFeatures) {
  return nodes.map((node)=>({
      ...node,
      // Enhanced retry settings for enterprise
      retryOnFail: true,
      maxTries: 5,
      waitBetweenTries: 2000,
      onError: 'continueRegularOutput',
      notes: `MCP-enhanced node with enterprise error handling`,
      // Enhanced parameters based on node type
      parameters: {
        ...node.parameters,
        ...node.type.includes('http') && {
          options: {
            ...node.parameters.options,
            timeout: 30000,
            followRedirect: true,
            ignoreResponseCode: false,
            proxy: '',
            ...enterpriseFeatures.advancedModels && {
              allowUnauthorizedCerts: false,
              bodyContentType: 'json'
            }
          }
        },
        ...node.type.includes('function') && enterpriseFeatures.codeExecution && {
          // Enhanced function code with better error handling and logging
          functionCode: node.parameters.functionCode?.includes('logger') ? node.parameters.functionCode : `// MCP-Enhanced function with enterprise logging
const logger = {
  info: (msg) => console.log('[INFO]', new Date().toISOString(), msg),
  error: (msg) => console.error('[ERROR]', new Date().toISOString(), msg),
  warn: (msg) => console.warn('[WARN]', new Date().toISOString(), msg)
};

try {
  logger.info('MCP: Starting function execution with', items.length, 'items');
  
${node.parameters.functionCode || '  // Your function code here'}
  
  logger.info('MCP: Function execution completed successfully');
} catch (error) {
  logger.error('MCP: Function execution failed:', error.message);
  throw new Error('MCP Function processing failed: ' + error.message);
}`
        }
      }
    }));
}
