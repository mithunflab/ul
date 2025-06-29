import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import "jsr:@supabase/functions-js/edge-runtime.d.ts"


// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

let SYSTEM_PROMPT = `
You are WorkflowAI, an expert automation architect and conversational AI assistant specializing in n8n workflow automation. You combine deep technical expertise with natural conversational abilities.

<core_identity>
  <role>Senior Automation Architect & AI Assistant</role>
  <expertise>
    - n8n workflow design and optimization
    - API integrations and data transformations
    - Business process automation
    - Conversational AI and natural language processing
  </expertise>
</core_identity>

<conversation_style>
  <tone>Professional yet approachable, enthusiastic about automation</tone>
  <personality>
    - Proactive in suggesting improvements
    - Patient with beginners, detailed with experts
    - Creative in problem-solving
    - Honest about limitations
  </personality>
  <communication>
    - Use examples and analogies for complex concepts
    - Break down complex workflows into digestible steps
    - Ask clarifying questions when requirements are ambiguous
    - Celebrate successful automations with users
  </communication>
</conversation_style>

<critical_tool_usage_rules>
  ABSOLUTELY CRITICAL: You must NEVER call any tool with empty parameters {}. 
  
  Before calling ANY tool, you MUST:
  1. Use <thinking> tags to analyze the user's request step by step
  2. Identify which specific tool is needed
  3. Extract or determine ALL required parameters from the user's request
  4. Verify you have concrete values for each required parameter
  5. Only then call the tool with complete, specific parameters
  
  If you cannot determine a required parameter value, ask the user for clarification instead of calling the tool.
</critical_tool_usage_rules>

<workflow_capabilities>
  <design_principles>
    - Always think step-by-step when designing workflows
    - Consider error handling and edge cases
    - Optimize for performance and maintainability
    - Follow n8n best practices and conventions
  </design_principles>
  
  <available_tools>
    You have access to these powerful tools - USE THEM when appropriate:
    
    - workflow_template_generator: ALWAYS use when users request workflow creation
      * Triggers: "create workflow", "build automation", "generate workflow", "make workflow", "sync data", "automate process"
      * REQUIRED parameters: 
        - pattern_type (MUST be one of: data_sync, notification, file_processing, api_integration, scheduled_task, webhook_handler)
      * Optional parameters:
        - source_service: Source application/service
        - target_service: Target application/service  
        - trigger_type: How workflow is triggered
        - custom_requirements: Additional specifications
      
      CRITICAL: You MUST provide the pattern_type parameter. NEVER call this tool with empty {} parameters.
      
      EXAMPLE CORRECT USAGE for "sync Google Sheets with Airtable":
      <thinking>
      User wants to sync Google Sheets with Airtable. Let me analyze:
      1. This is clearly a data synchronization task between two services
      2. Required parameter pattern_type: "data_sync" (fits the sync use case)
      3. Optional but helpful parameters:
         - source_service: "Google Sheets" (mentioned in request)
         - target_service: "Airtable" (mentioned in request)
         - trigger_type: "scheduled" (typical for data sync)
      I have all needed information to call the tool.
      </thinking>
      
      Then call: workflow_template_generator with:
      {
        "pattern_type": "data_sync",
        "source_service": "Google Sheets",
        "target_service": "Airtable", 
        "trigger_type": "scheduled"
      }
      
      ANOTHER EXAMPLE for "send Slack notifications when new leads come in":
      <thinking>
      User wants to send Slack notifications for new leads. Let me analyze:
      1. This is a notification workflow (sending alerts)
      2. Required parameter pattern_type: "notification" (sending messages)
      3. Optional parameters:
         - source_service: "CRM" or "Lead System" (where leads come from)
         - target_service: "Slack" (where notifications go)
         - trigger_type: "webhook" (real-time notifications)
      I have all needed information to call the tool.
      </thinking>
      
      Then call: workflow_template_generator with:
      {
        "pattern_type": "notification",
        "source_service": "CRM",
        "target_service": "Slack",
        "trigger_type": "webhook"
      }
      
      PATTERN TYPE MAPPING:
      - "sync", "integrate", "connect data", "transfer" → data_sync
      - "notify", "alert", "send message", "email", "slack" → notification  
      - "process files", "upload", "download", "file handling" → file_processing
      - "API call", "REST", "webhook endpoint", "HTTP request" → api_integration
      - "schedule", "cron", "daily", "weekly", "recurring" → scheduled_task
      - "trigger on event", "webhook receiver", "listen for" → webhook_handler
      
    - workflow_validator: Use when users want workflow validation
      * Triggers: "validate workflow", "check workflow", "review workflow"
      * REQUIRED: workflow (object)
      * Optional: validation_type
      
    - api_documentation_analyzer: Use for API integration questions
      * Triggers: "integrate with [service]", "connect to [API]", "analyze [service] API"
      * REQUIRED: service_name
      * Optional: api_url, operation_type, documentation_url
      
    - n8n_workflow_manager: Use for workflow management operations
      * Triggers: "list workflows", "update workflow", "delete workflow"
      * REQUIRED: operation
      * Optional: workflow_id, workflow_data, n8n_instance_url, api_key
      
    - web_search_20250305: Use for current information and documentation
  </available_tools>
</workflow_capabilities>

<interaction_modes>
  <automation_mode>
    When users request workflow creation, follow this EXACT process:
    
    1. ALWAYS use <thinking> tags to analyze the request:
       - What automation task do they want?
       - Which pattern_type does this match?
       - What are the source and target services?
       - What trigger makes sense?
    
    2. Map the request to the correct pattern_type:
       - Data movement/sync → "data_sync"
       - Alerts/notifications → "notification"
       - File operations → "file_processing"
       - API calls/integrations → "api_integration"
       - Time-based tasks → "scheduled_task"
       - Event-driven triggers → "webhook_handler"
    
    3. Extract services mentioned in the request
    
    4. Call workflow_template_generator with specific parameters
    
    5. Use the returned template to provide complete guidance
    
    EXAMPLE for "create a workflow to send Slack notifications when new Google Sheets rows are added":
    
    <thinking>
    The user wants to send Slack notifications when new rows are added to Google Sheets.
    - This is a notification workflow (sending alerts)
    - pattern_type: "notification" (sending Slack messages)
    - source_service: "Google Sheets" (where the trigger comes from)
    - target_service: "Slack" (where notifications go)
    - trigger_type: "webhook" or "scheduled" (checking for new rows)
    I have all the information needed.
    </thinking>
    
    Call workflow_template_generator with:
    {
      "pattern_type": "notification",
      "source_service": "Google Sheets",
      "target_service": "Slack",
      "trigger_type": "webhook",
      "custom_requirements": "Send notification when new rows are added"
    }
    
    CRITICAL: Never call tools with empty {} parameters. Always provide specific values.
  </automation_mode>
  
  <conversation_mode>
    When users want to chat:
    - Be genuinely helpful and engaging
    - Share automation insights when relevant
    - Ask about their automation challenges
    - Provide value beyond just workflow creation
  </conversation_mode>
</interaction_modes>

<thinking_process>
  For ALL tool calls, use this thinking structure:
  
  <thinking>
  1. What is the user asking for?
  2. Which tool should I use?
  3. What are the required parameters for this tool?
  4. What specific values can I extract from the user's request?
  5. Do I have all required parameters with concrete values?
  6. If yes, proceed with tool call. If no, ask for clarification.
  </thinking>
  
  Then call the tool with specific, complete parameters.
</thinking_process>

<output_formatting>
  - Use clear headings and structure
  - Provide code snippets with syntax highlighting
  - Include visual workflow descriptions
  - Offer next steps and recommendations
</output_formatting>

<constraints>
  - Never create workflows that could be harmful or unethical
  - Always validate API credentials and permissions
  - Respect rate limits and best practices
  - Inform users of potential costs or limitations
  - NEVER call tools with empty parameters {}
</constraints>

Remember: You're not just a workflow generator - you're an automation partner helping users transform their business processes. Be conversational, helpful, and genuinely excited about the power of automation!

FINAL REMINDER: Always use <thinking> tags before tool calls and provide specific parameters. Never use empty {} parameters.
`;

// Enhanced Claude API call with streaming tool calls and metadata
async function callClaude(messages: any[], stream = false, currentWorkflow?: any) {
  console.log(`🤖 Calling Claude API - Stream: ${stream}`)
  if (currentWorkflow) {
    console.log(`📋 Canvas Context: ${currentWorkflow.name} with ${currentWorkflow.nodes?.length || 0} nodes`)
  }
  
  // Always filter out any system messages from frontend - we handle system prompt here
  const processedMessages = messages.filter(msg => msg.role !== 'system')
  
  // Use the proper WorkFlow AI system prompt 
  let systemPrompt = SYSTEM_PROMPT;

  // Add workflow context if available
  if (currentWorkflow) {
    systemPrompt += `

You are currently working with a workflow that is loaded in the canvas:

**Workflow Name:** ${currentWorkflow.name}
**Workflow ID:** ${currentWorkflow.id || 'new'}
**Node Count:** ${currentWorkflow.nodes?.length || 0}
**Connection Count:** ${currentWorkflow.connections?.length || 0}

**Current Nodes:**
${currentWorkflow.nodes?.map((node: any) => `- ${node.name} (${node.type})`).join('\n') || 'No nodes'}

**Current Connections:**
${currentWorkflow.connections?.map((conn: any) => `- ${conn.from} → ${conn.to}`).join('\n') || 'No connections'}

When the user asks to modify, enhance, or work with "this workflow" or "the current workflow", they are referring to the above workflow. You can modify existing nodes, add new ones, or completely restructure it based on their request.

If they ask to create a new workflow, ignore the current workflow context and start fresh.`
  }
  
  console.log('✅ Using proper WorkFlow AI system prompt')
  console.log('📋 System prompt length:', systemPrompt.length)

  const requestBody = {
    model: "claude-3-5-sonnet-latest",
    max_tokens: 8000,
    system: systemPrompt,
    messages: processedMessages,
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 5
      },
      {
        name: "n8n_workflow_manager",
        description: "Manage n8n workflows - create, read, update, delete operations",
        input_schema: {
          type: "object",
          properties: {
            operation: { type: "string", enum: ["create", "read", "update", "delete", "list"] },
            workflow_id: { type: "string" },
            workflow_data: { type: "object" },
            n8n_instance_url: { type: "string" },
            api_key: { type: "string" }
          },
          required: ["operation"]
        }
      },
      {
        name: "workflow_template_generator",
        description: "Generate optimized n8n workflow templates for common automation patterns. ALWAYS call this when users want to create workflows or automations. CRITICAL: Never call with empty {} parameters - always provide at least pattern_type.",
        input_schema: {
          type: "object",
          properties: {
            pattern_type: { 
              type: "string", 
              enum: ["data_sync", "notification", "file_processing", "api_integration", "scheduled_task", "webhook_handler"],
              description: "REQUIRED: Type of workflow pattern. MUST be one of the enum values. Examples: 'data_sync' for Google Sheets to Airtable sync, 'notification' for Slack alerts, 'api_integration' for REST API calls, 'scheduled_task' for daily reports, 'webhook_handler' for receiving webhooks, 'file_processing' for file uploads/downloads."
            },
            source_service: { 
              type: "string",
              description: "Source service or application where data comes from. Examples: 'Google Sheets', 'Airtable', 'Slack', 'Gmail', 'Webhook', 'Manual Trigger'"
            },
            target_service: { 
              type: "string",
              description: "Target service or application where data goes to. Examples: 'Airtable', 'Slack', 'Gmail', 'Discord', 'HTTP API', 'File System'"
            },
            trigger_type: { 
              type: "string", 
              enum: ["manual", "scheduled", "webhook", "file_change", "email"],
              description: "How the workflow should be triggered. Examples: 'scheduled' for recurring tasks, 'webhook' for real-time triggers, 'manual' for on-demand execution"
            },
            custom_requirements: { 
              type: "string",
              description: "Additional requirements or specifications for the workflow. Examples: 'Run every hour', 'Filter only new rows', 'Send to specific Slack channel', 'Convert file format'"
            }
          },
          required: ["pattern_type"],
          examples: [
            {
              "pattern_type": "data_sync",
              "source_service": "Google Sheets",
              "target_service": "Airtable",
              "trigger_type": "scheduled",
              "custom_requirements": "Sync every hour, only new rows"
            },
            {
              "pattern_type": "notification", 
              "source_service": "Airtable",
              "target_service": "Slack",
              "trigger_type": "webhook",
              "custom_requirements": "Send alert when new record added"
            }
          ]
        }
      },
      {
        name: "workflow_validator",
        description: "Validate workflow logic, check for errors, and suggest optimizations",
        input_schema: {
          type: "object",
          properties: {
            workflow: { type: "object" },
            validation_type: { type: "string", enum: ["syntax", "logic", "performance", "security"] }
          },
          required: ["workflow"]
        }
      },
      {
        name: "api_documentation_analyzer",
        description: "Analyze API documentation to suggest optimal n8n node configurations",
        input_schema: {
          type: "object",
          properties: {
            api_url: { type: "string" },
            service_name: { type: "string" },
            operation_type: { type: "string", enum: ["GET", "POST", "PUT", "DELETE", "PATCH"] },
            documentation_url: { type: "string" }
          },
          required: ["service_name"]
        }
      }
    ],
    stream: stream
  }

  console.log('📤 Request body:', JSON.stringify(requestBody, null, 2))

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') || '',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ Claude API Error:', response.status, errorText)
    throw new Error(`Claude API error: ${response.status} - ${errorText}`)
  }

  return response
}

// Enhanced SSE parsing with tool call metadata
function parseSSELine(line: string): { event?: string; data?: any; metadata?: any } | null {
  const trimmed = line.trim()
  if (!trimmed) return null
  
  if (trimmed.startsWith('event:')) {
    return { event: trimmed.substring(6).trim() }
  }
  
  if (trimmed.startsWith('data:')) {
    try {
      const dataStr = trimmed.substring(5).trim()
      if (dataStr === '[DONE]') return null
      
      const data = JSON.parse(dataStr)
      
      // Enhanced metadata extraction for tool calls
      let metadata: any = {}
      
      if (data.type === 'content_block_start' && data.content_block?.type === 'tool_use') {
        metadata = {
          type: 'tool_call_start',
          toolCallId: data.content_block.id,
          toolName: data.content_block.name,
          input: data.content_block.input
        }
      } else if (data.type === 'content_block_delta' && data.delta?.type === 'input_json_delta') {
        metadata = {
          type: 'tool_call_input',
          toolCallId: data.index,
          partialInput: data.delta.partial_json
        }
      } else if (data.type === 'content_block_stop' && data.index > 0) {
        metadata = {
          type: 'tool_call_complete',
          toolCallId: data.index
        }
      }
      
      return { data, metadata }
    } catch (e) {
      console.warn('⚠️ Failed to parse SSE data:', e)
      return null
    }
  }
  
  return null
}

// Enhanced workflow node extraction with streaming support
function extractWorkflowNodes(text: string): any[] {
  const nodes: any[] = []
  
  // Only extract nodes if we see actual n8n JSON structure or explicit node mentions
  const hasWorkflowJSON = text.includes('"nodes"') && text.includes('"connections"')
  const hasExplicitNodes = /\b(webhook node|http node|gmail node|slack node|filter node|function node)\b/gi.test(text)
  
  if (!hasWorkflowJSON && !hasExplicitNodes) {
    return nodes // Don't extract nodes from general explanatory text
  }
  
  // More specific patterns for actual workflow nodes
  const nodePatterns = [
    /\b(webhook|trigger|start)\s+node\b/gi,
    /\b(http|request|api)\s+node\b/gi,
    /\b(email|gmail|mail)\s+node\b/gi,
    /\b(slack|discord|teams)\s+node\b/gi,
    /\b(sheets|airtable|database)\s+node\b/gi,
    /\b(filter|condition|logic)\s+node\b/gi,
    /\b(function|code|script)\s+node\b/gi,
    /\b(transform|map|convert)\s+node\b/gi
  ]
  
  nodePatterns.forEach((pattern, index) => {
    const matches = text.match(pattern)
    if (matches) {
      matches.forEach((match, matchIndex) => {
        const nodeId = `node_${index}_${matchIndex}_${Date.now()}`
        const nodeName = match.replace(/\s+node/gi, '').trim() || `Node ${index + 1}`
        const nodeType = getNodeTypeFromText(match)
        
        nodes.push({
          id: nodeId,
          name: nodeName,
          type: nodeType,
          description: `Generated ${nodeType} node`,
          status: 'generating'
        })
      })
    }
  })
  
  return nodes
}

function getNodeTypeFromText(text: string): string {
  const lowerText = text.toLowerCase()
  
  if (lowerText.includes('webhook') || lowerText.includes('trigger')) return 'webhook'
  if (lowerText.includes('http') || lowerText.includes('request')) return 'http'
  if (lowerText.includes('email') || lowerText.includes('gmail')) return 'gmail'
  if (lowerText.includes('slack')) return 'slack'
  if (lowerText.includes('sheets') || lowerText.includes('database')) return 'google_sheets'
  if (lowerText.includes('filter') || lowerText.includes('condition')) return 'filter'
  if (lowerText.includes('function') || lowerText.includes('code')) return 'function'
  if (lowerText.includes('transform') || lowerText.includes('map')) return 'transform'
  
  return 'unknown'
}

// Enhanced web search result parsing
function parseWebSearchResults(toolResult: any): any[] {
  if (!toolResult || !toolResult.results) return []
  
  return toolResult.results.map((result: any) => ({
    title: result.title || 'Untitled',
    url: result.url || '',
    snippet: result.snippet || result.description || '',
    domain: result.url ? new URL(result.url).hostname : ''
  }))
}

// Custom tool handlers
async function handleN8nWorkflowManager(input: any): Promise<any> {
  const { operation, workflow_id, workflow_data, n8n_instance_url, api_key } = input
  
  console.log(`🔧 N8N Workflow Manager - Operation: ${operation}`)
  
  try {
    switch (operation) {
      case 'list':
        if (!n8n_instance_url || !api_key) {
          return {
            success: false,
            error: 'n8n_instance_url and api_key are required for list operation'
          }
        }
        
        const listResponse = await fetch(`${n8n_instance_url}/api/v1/workflows`, {
          headers: {
            'X-N8N-API-KEY': api_key,
            'Content-Type': 'application/json'
          }
        })
        
        if (!listResponse.ok) {
          throw new Error(`Failed to list workflows: ${listResponse.status}`)
        }
        
        const workflows = await listResponse.json()
        return {
          success: true,
          workflows: workflows.data || workflows,
          count: workflows.data?.length || workflows.length || 0
        }
        
      case 'read':
        if (!workflow_id || !n8n_instance_url || !api_key) {
          return {
            success: false,
            error: 'workflow_id, n8n_instance_url and api_key are required for read operation'
          }
        }
        
        const readResponse = await fetch(`${n8n_instance_url}/api/v1/workflows/${workflow_id}`, {
          headers: {
            'X-N8N-API-KEY': api_key,
            'Content-Type': 'application/json'
          }
        })
        
        if (!readResponse.ok) {
          throw new Error(`Failed to read workflow: ${readResponse.status}`)
        }
        
        const workflow = await readResponse.json()
        return {
          success: true,
          workflow: workflow.data || workflow
        }
        
      case 'create':
        if (!workflow_data || !n8n_instance_url || !api_key) {
          return {
            success: false,
            error: 'workflow_data, n8n_instance_url and api_key are required for create operation'
          }
        }
        
        const createResponse = await fetch(`${n8n_instance_url}/api/v1/workflows`, {
          method: 'POST',
          headers: {
            'X-N8N-API-KEY': api_key,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(workflow_data)
        })
        
        if (!createResponse.ok) {
          throw new Error(`Failed to create workflow: ${createResponse.status}`)
        }
        
        const createdWorkflow = await createResponse.json()
        return {
          success: true,
          workflow: createdWorkflow.data || createdWorkflow,
          message: 'Workflow created successfully'
        }
        
      case 'update':
        if (!workflow_id || !workflow_data || !n8n_instance_url || !api_key) {
          return {
            success: false,
            error: 'workflow_id, workflow_data, n8n_instance_url and api_key are required for update operation'
          }
        }
        
        const updateResponse = await fetch(`${n8n_instance_url}/api/v1/workflows/${workflow_id}`, {
          method: 'PUT',
          headers: {
            'X-N8N-API-KEY': api_key,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(workflow_data)
        })
        
        if (!updateResponse.ok) {
          throw new Error(`Failed to update workflow: ${updateResponse.status}`)
        }
        
        const updatedWorkflow = await updateResponse.json()
        return {
          success: true,
          workflow: updatedWorkflow.data || updatedWorkflow,
          message: 'Workflow updated successfully'
        }
        
      case 'delete':
        if (!workflow_id || !n8n_instance_url || !api_key) {
          return {
            success: false,
            error: 'workflow_id, n8n_instance_url and api_key are required for delete operation'
          }
        }
        
        const deleteResponse = await fetch(`${n8n_instance_url}/api/v1/workflows/${workflow_id}`, {
          method: 'DELETE',
          headers: {
            'X-N8N-API-KEY': api_key,
            'Content-Type': 'application/json'
          }
        })
        
        if (!deleteResponse.ok) {
          throw new Error(`Failed to delete workflow: ${deleteResponse.status}`)
        }
        
        return {
          success: true,
          message: 'Workflow deleted successfully'
        }
        
      default:
        return {
          success: false,
          error: `Unknown operation: ${operation}`
        }
    }
  } catch (error) {
    console.error('❌ N8N Workflow Manager Error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

async function handleWorkflowTemplateGenerator(input: any): Promise<any> {
  const { pattern_type, source_service, target_service, trigger_type, custom_requirements } = input
  
  console.log(`🏗️ Workflow Template Generator - Pattern: ${pattern_type}`)
  
  // Helper function to create proper n8n node structure
  function createN8nNode(id: string, name: string, type: string, parameters: any, position: number[], credentials?: any, typeVersion?: number): any {
    const node: any = {
      parameters,
      id,
      name,
      type,
      typeVersion: typeVersion || 1,
      position
    };
    
    if (credentials) {
      node.credentials = credentials;
    }
    
    return node;
  }
  
  // Helper function to create proper n8n connections object
  function createN8nConnections(connectionMap: Array<{from: string, to: string}>): any {
    const connections: any = {};
    
    connectionMap.forEach(({ from, to }) => {
      if (!connections[from]) {
        connections[from] = { main: [[]] };
      }
      
      connections[from].main[0].push({
        node: to,
        type: "main",
        index: 0
      });
    });
    
    return connections;
  }
  
  const templates = {
    data_sync: {
      name: `${source_service || 'Source'} to ${target_service || 'Target'} Data Sync`,
      nodes: [
        createN8nNode(
          'schedule-trigger',
          'Schedule Trigger',
          'n8n-nodes-base.scheduleTrigger',
          {
            rule: {
              interval: [
                {
                  field: 'minutes',
                  value: 15
                }
              ]
            }
          },
          [240, 300],
          undefined,
          1.1
        ),
        createN8nNode(
          'fetch-source-data',
          `Read ${source_service || 'Source'}`,
          source_service === 'Google Sheets' ? 'n8n-nodes-base.googleSheets' : 'n8n-nodes-base.httpRequest',
          source_service === 'Google Sheets' ? {
            operation: 'readSheet',
            documentId: 'YOUR_GOOGLE_SHEETS_ID',
            sheetName: 'Sheet1',
            options: {}
          } : {
            method: 'GET',
            url: 'https://api.source.com/data',
            options: {}
          },
          [460, 300],
          source_service === 'Google Sheets' ? {
            googleSheetsOAuth2Api: {
              id: 'YOUR_GOOGLE_SHEETS_CREDENTIAL_ID',
              name: 'Google Sheets API'
            }
          } : undefined,
          source_service === 'Google Sheets' ? 4.2 : 4.1
        ),
        createN8nNode(
          'transform-data',
          'Transform Data',
          'n8n-nodes-base.code',
          {
            mode: 'runOnceForAllItems',
            jsCode: `// Transform data for ${target_service || 'target'} service
const transformedData = items.map(item => ({
  id: item.json.id,
  name: item.json.name,
  email: item.json.email,
  // Add your transformation logic here
  transformed_at: new Date().toISOString()
}));

return transformedData.map(item => ({ json: item }));`
          },
          [680, 300],
          undefined,
          2
        ),
        createN8nNode(
          'sync-to-target',
          `Sync to ${target_service || 'Target'}`,
          target_service === 'Airtable' ? 'n8n-nodes-base.airtable' : 'n8n-nodes-base.httpRequest',
          target_service === 'Airtable' ? {
            operation: 'create',
            application: 'YOUR_AIRTABLE_BASE_ID',
            table: 'YOUR_AIRTABLE_TABLE_NAME',
            fields: {
              Name: '={{ $json.name }}',
              Email: '={{ $json.email }}',
              Status: '={{ $json.status || "active" }}',
              Last_Modified: '={{ $now }}'
            }
          } : {
            method: 'POST',
            url: 'https://api.target.com/sync',
            bodyParameters: {
              parameters: [
                { name: 'data', value: '={{ $json }}' }
              ]
            }
          },
          [900, 300],
          target_service === 'Airtable' ? {
            airtableTokenApi: {
              id: 'YOUR_AIRTABLE_CREDENTIAL_ID',
              name: 'Airtable API'
            }
          } : undefined,
          target_service === 'Airtable' ? 2 : 4.1
        )
      ],
      connections: createN8nConnections([
        { from: 'Schedule Trigger', to: `Read ${source_service || 'Source'}` },
        { from: `Read ${source_service || 'Source'}`, to: 'Transform Data' },
        { from: 'Transform Data', to: `Sync to ${target_service || 'Target'}` }
      ]),
      pinData: {},
      settings: {
        executionOrder: "v1"
      },
      staticData: null,
      tags: [],
      triggerCount: 0,
      updatedAt: new Date().toISOString(),
      versionId: "1"
    },
    
    notification: {
      name: `${source_service || 'Event'} Notification System`,
      nodes: [
        createN8nNode(
          'event-trigger',
          'Event Trigger',
          trigger_type === 'webhook' ? 'n8n-nodes-base.webhook' : 'n8n-nodes-base.manualTrigger',
          trigger_type === 'webhook' ? {
            path: 'event-webhook',
            httpMethod: 'POST',
            responseMode: 'onReceived',
            options: {}
          } : {},
          [240, 300],
          undefined,
          trigger_type === 'webhook' ? 1.1 : 1
        ),
        createN8nNode(
          'process-event',
          'Process Event',
          'n8n-nodes-base.code',
          {
            mode: 'runOnceForAllItems',
            jsCode: `// Process incoming event
const event = items[0].json;
const priority = event.priority || 'normal';
const message = \`Event: \${event.type || 'Unknown'} - \${event.description || 'No description'}\`;

return [{
  json: {
    message,
    priority,
    timestamp: new Date().toISOString(),
    original_event: event
  }
}];`
          },
          [460, 300],
          undefined,
          2
        ),
        createN8nNode(
          'send-notification',
          'Send Notification',
          target_service?.toLowerCase() === 'slack' ? 'n8n-nodes-base.slack' : 'n8n-nodes-base.sendEmail',
          target_service?.toLowerCase() === 'slack' ? {
            operation: 'postMessage',
            channel: '#notifications',
            text: '={{ $json.message }}',
            otherOptions: {}
          } : {
            to: 'admin@company.com',
            subject: 'System Notification',
            message: '={{ $json.message }}',
            options: {}
          },
          [680, 300],
          target_service?.toLowerCase() === 'slack' ? {
            slackOAuth2Api: {
              id: 'YOUR_SLACK_CREDENTIAL_ID',
              name: 'Slack API'
            }
          } : {
            smtp: {
              id: 'YOUR_EMAIL_CREDENTIAL_ID',
              name: 'SMTP Email'
            }
          },
          target_service?.toLowerCase() === 'slack' ? 2.1 : 2.1
        )
      ],
      connections: createN8nConnections([
        { from: 'Event Trigger', to: 'Process Event' },
        { from: 'Process Event', to: 'Send Notification' }
      ]),
      pinData: {},
      settings: {
        executionOrder: "v1"
      },
      staticData: null,
      tags: [],
      triggerCount: 0,
      updatedAt: new Date().toISOString(),
      versionId: "1"
    },
    
    file_processing: {
      name: 'File Processing Workflow',
      nodes: [
        createN8nNode(
          'file-trigger',
          'File Trigger',
          'n8n-nodes-base.webhook',
          {
            path: 'file-upload',
            httpMethod: 'POST',
            responseMode: 'onReceived',
            options: {}
          },
          [240, 300],
          undefined,
          1.1
        ),
        createN8nNode(
          'validate-file',
          'Validate File',
          'n8n-nodes-base.code',
          {
            mode: 'runOnceForAllItems',
            jsCode: `// Validate file properties
const file = items[0].json;
const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
const maxSize = 10 * 1024 * 1024; // 10MB

if (!allowedTypes.includes(file.type)) {
  throw new Error('File type not allowed');
}

if (file.size > maxSize) {
  throw new Error('File too large');
}

return items;`
          },
          [460, 300],
          undefined,
          2
        ),
        createN8nNode(
          'process-file',
          'Process File',
          'n8n-nodes-base.httpRequest',
          {
            method: 'POST',
            url: 'https://api.fileprocessor.com/process',
            bodyParameters: {
              parameters: [
                { name: 'file_url', value: '={{ $json.file_url }}' },
                { name: 'operation', value: 'optimize' }
              ]
            },
            options: {}
          },
          [680, 300],
          undefined,
          4.1
        )
      ],
      connections: createN8nConnections([
        { from: 'File Trigger', to: 'Validate File' },
        { from: 'Validate File', to: 'Process File' }
      ]),
      pinData: {},
      settings: {
        executionOrder: "v1"
      },
      staticData: null,
      tags: [],
      triggerCount: 0,
      updatedAt: new Date().toISOString(),
      versionId: "1"
    },
    
    api_integration: {
      name: `${source_service || 'API'} Integration`,
      nodes: [
        createN8nNode(
          'api-trigger',
          'API Trigger',
          trigger_type === 'scheduled' ? 'n8n-nodes-base.scheduleTrigger' : 'n8n-nodes-base.manualTrigger',
          trigger_type === 'scheduled' ? {
            rule: {
              interval: [
                {
                  field: 'minutes',
                  value: 30
                }
              ]
            }
          } : {},
          [240, 300],
          undefined,
          trigger_type === 'scheduled' ? 1.1 : 1
        ),
        createN8nNode(
          'api-call',
          'API Call',
          'n8n-nodes-base.httpRequest',
          {
            method: 'GET',
            url: 'https://api.service.com/endpoint',
            options: {
              response: { fullResponse: false }
            }
          },
          [460, 300],
          undefined,
          4.1
        ),
        createN8nNode(
          'process-response',
          'Process Response',
          'n8n-nodes-base.code',
          {
            mode: 'runOnceForAllItems',
            jsCode: `// Process API response
const response = items[0].json;
const processedData = {
  timestamp: new Date().toISOString(),
  status: response.status || 'unknown',
  data: response.data || response,
  processed: true
};

return [{ json: processedData }];`
          },
          [680, 300],
          undefined,
          2
        )
      ],
      connections: createN8nConnections([
        { from: 'API Trigger', to: 'API Call' },
        { from: 'API Call', to: 'Process Response' }
      ]),
      pinData: {},
      settings: {
        executionOrder: "v1"
      },
      staticData: null,
      tags: [],
      triggerCount: 0,
      updatedAt: new Date().toISOString(),
      versionId: "1"
    },
    
    scheduled_task: {
      name: 'Scheduled Task Workflow',
      nodes: [
        createN8nNode(
          'schedule-trigger',
          'Schedule Trigger',
          'n8n-nodes-base.scheduleTrigger',
          {
            rule: {
              interval: [
                {
                  field: 'hours',
                  value: 24
                }
              ]
            }
          },
          [240, 300],
          undefined,
          1.1
        ),
        createN8nNode(
          'execute-task',
          'Execute Task',
          'n8n-nodes-base.code',
          {
            mode: 'runOnceForAllItems',
            jsCode: `// Execute scheduled task
const today = new Date();
const taskResult = {
  task_name: 'Daily Maintenance',
  executed_at: today.toISOString(),
  status: 'completed',
  // Add your task logic here
};

return [{ json: taskResult }];`
          },
          [460, 300],
          undefined,
          2
        ),
        createN8nNode(
          'log-result',
          'Log Result',
          'n8n-nodes-base.httpRequest',
          {
            method: 'POST',
            url: 'https://api.logging.com/log',
            bodyParameters: {
              parameters: [
                { name: 'log_entry', value: '={{ $json }}' }
              ]
            },
            options: {}
          },
          [680, 300],
          undefined,
          4.1
        )
      ],
      connections: createN8nConnections([
        { from: 'Schedule Trigger', to: 'Execute Task' },
        { from: 'Execute Task', to: 'Log Result' }
      ]),
      pinData: {},
      settings: {
        executionOrder: "v1"
      },
      staticData: null,
      tags: [],
      triggerCount: 0,
      updatedAt: new Date().toISOString(),
      versionId: "1"
    },
    
    webhook_handler: {
      name: 'Webhook Handler',
      nodes: [
        createN8nNode(
          'webhook-trigger',
          'Webhook Trigger',
          'n8n-nodes-base.webhook',
        {
            path: 'incoming-webhook',
            httpMethod: 'POST',
            responseMode: 'onReceived',
            options: {}
          },
          [240, 300],
          undefined,
          1.1
        ),
        createN8nNode(
          'validate-payload',
          'Validate Payload',
          'n8n-nodes-base.code',
          {
            mode: 'runOnceForAllItems',
            jsCode: `// Validate webhook payload
const payload = items[0].json;

if (!payload || typeof payload !== 'object') {
  throw new Error('Invalid payload');
}

// Add validation logic here
return [{
  json: {
    ...payload,
    validated: true,
    received_at: new Date().toISOString()
  }
}];`
          },
          [460, 300],
          undefined,
          2
        ),
        createN8nNode(
          'process-webhook',
          'Process Webhook',
          'n8n-nodes-base.code',
          {
            mode: 'runOnceForAllItems',
            jsCode: `// Process webhook data
const data = items[0].json;

// Add your processing logic here
const processedData = {
  ...data,
  processed: true,
  processed_at: new Date().toISOString()
};

return [{ json: processedData }];`
          },
          [680, 300],
          undefined,
          2
        )
      ],
      connections: createN8nConnections([
        { from: 'Webhook Trigger', to: 'Validate Payload' },
        { from: 'Validate Payload', to: 'Process Webhook' }
      ]),
      pinData: {},
      settings: {
        executionOrder: "v1"
      },
      staticData: null,
      tags: [],
      triggerCount: 0,
      updatedAt: new Date().toISOString(),
      versionId: "1"
    }
  }
  
  const template = templates[pattern_type]
  
  if (!template) {
    return {
      success: false,
      error: `Unknown pattern type: ${pattern_type}`
    }
  }
  
  // Add custom requirements to the template
  if (custom_requirements) {
    template.description = `${template.name} - ${custom_requirements}`;
  }
  
  return {
    success: true,
    template,
    pattern_type,
    customizations: {
      source_service,
      target_service,
      trigger_type,
      custom_requirements
    }
  }
}

interface ValidationIssue {
  level: 'error' | 'warning' | 'info';
  message: string;
  fix: string;
}

interface ValidationResults {
  syntax: ValidationIssue[];
  logic: ValidationIssue[];
  performance: ValidationIssue[];
  security: ValidationIssue[];
  overall_score: number;
}

async function handleWorkflowValidator(input: any): Promise<any> {
  const { workflow, validation_type = 'syntax' } = input
  
  console.log(`✅ Workflow Validator - Type: ${validation_type}`)
  
  const validationResults: ValidationResults = {
    syntax: [],
    logic: [],
    performance: [],
    security: [],
    overall_score: 0
  }
  
  try {
    // Syntax validation
    if (validation_type === 'syntax' || validation_type === 'all') {
      if (!workflow.name || typeof workflow.name !== 'string') {
        validationResults.syntax.push({
          level: 'error',
          message: 'Workflow must have a valid name',
          fix: 'Add a descriptive name to your workflow'
        })
      }
      
      if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
        validationResults.syntax.push({
          level: 'error',
          message: 'Workflow must have a nodes array',
          fix: 'Add at least one node to your workflow'
        })
      } else {
        workflow.nodes.forEach((node, index) => {
          if (!node.id) {
            validationResults.syntax.push({
              level: 'error',
              message: `Node ${index} missing required id`,
              fix: 'Add a unique ID to each node'
            })
          }
          
          if (!node.type) {
            validationResults.syntax.push({
              level: 'error',
              message: `Node ${node.name || index} missing required type`,
              fix: 'Specify the node type (e.g., n8n-nodes-base.httpRequest)'
            })
          }
          
          if (!node.position || !Array.isArray(node.position)) {
            validationResults.syntax.push({
              level: 'warning',
              message: `Node ${node.name || index} missing position`,
              fix: 'Add position coordinates [x, y] for proper canvas layout'
            })
          }
        })
      }
      
      if (!workflow.connections || typeof workflow.connections !== 'object') {
        validationResults.syntax.push({
          level: 'warning',
          message: 'Workflow missing connections object',
          fix: 'Define connections between nodes'
        })
      }
    }
    
    // Logic validation
    if (validation_type === 'logic' || validation_type === 'all') {
      const triggerNodes = workflow.nodes?.filter(node => 
        node.type?.includes('trigger') || node.type?.includes('Trigger')
      ) || []
      
      if (triggerNodes.length === 0) {
        validationResults.logic.push({
          level: 'error',
          message: 'Workflow has no trigger nodes',
          fix: 'Add at least one trigger node to start the workflow'
        })
      }
      
      if (triggerNodes.length > 1) {
        validationResults.logic.push({
          level: 'warning',
          message: 'Multiple trigger nodes detected',
          fix: 'Consider if multiple triggers are necessary'
        })
      }
      
      // Check for orphaned nodes
      const nodeNames = new Set(workflow.nodes?.map(n => n.name) || [])
      const connectedNodes = new Set()
      
      Object.values(workflow.connections || {}).forEach((connections: any) => {
        if (connections.main) {
          connections.main.forEach((mainConnections: any[]) => {
            mainConnections.forEach(conn => {
              if (conn.node) connectedNodes.add(conn.node)
            })
          })
        }
      })
      
      workflow.nodes?.forEach(node => {
        if (!connectedNodes.has(node.name) && !node.type?.includes('trigger')) {
          validationResults.logic.push({
            level: 'warning',
            message: `Node "${node.name}" appears to be orphaned`,
            fix: 'Connect this node to the workflow or remove it'
          })
        }
      })
    }
    
    // Performance validation
    if (validation_type === 'performance' || validation_type === 'all') {
      const nodeCount = workflow.nodes?.length || 0
      
      if (nodeCount > 20) {
        validationResults.performance.push({
          level: 'warning',
          message: 'Large workflow with many nodes',
          fix: 'Consider breaking into smaller workflows or optimizing node usage'
        })
      }
      
      // Check for potential infinite loops
      const connections = workflow.connections || {}
      const visited = new Set()
      const recursionStack = new Set()
      
      function hasCircularDependency(nodeName: string): boolean {
        if (recursionStack.has(nodeName)) return true
        if (visited.has(nodeName)) return false
        
        visited.add(nodeName)
        recursionStack.add(nodeName)
        
        const nodeConnections = connections[nodeName]?.main || []
        for (const mainConnection of nodeConnections) {
          for (const conn of mainConnection) {
            if (hasCircularDependency(conn.node)) return true
          }
        }
        
        recursionStack.delete(nodeName)
        return false
      }
      
      for (const nodeName of Object.keys(connections)) {
        if (hasCircularDependency(nodeName)) {
          validationResults.performance.push({
            level: 'error',
            message: 'Circular dependency detected in workflow',
            fix: 'Remove circular connections to prevent infinite loops'
          })
          break
        }
      }
    }
    
    // Security validation
    if (validation_type === 'security' || validation_type === 'all') {
      workflow.nodes?.forEach(node => {
        if (node.parameters) {
          // Check for hardcoded credentials
          const paramStr = JSON.stringify(node.parameters)
          if (paramStr.includes('password') || paramStr.includes('token') || paramStr.includes('secret')) {
            validationResults.security.push({
              level: 'warning',
              message: `Node "${node.name}" may contain hardcoded credentials`,
              fix: 'Use credential system instead of hardcoding sensitive data'
            })
          }
          
          // Check for HTTP nodes without authentication
          if (node.type === 'n8n-nodes-base.httpRequest' && !node.credentials) {
            validationResults.security.push({
              level: 'info',
              message: `HTTP node "${node.name}" has no authentication`,
              fix: 'Consider adding authentication if accessing protected resources'
            })
          }
        }
      })
    }
    
    // Calculate overall score
    const allIssues = [
      ...validationResults.syntax,
      ...validationResults.logic,
      ...validationResults.performance,
      ...validationResults.security
    ];
    const totalIssues = allIssues.length;
    const errorCount = allIssues.filter(issue => issue.level === 'error').length;
    const warningCount = allIssues.filter(issue => issue.level === 'warning').length;
    
    validationResults.overall_score = Math.max(0, 100 - (errorCount * 20) - (warningCount * 5))
    
    return {
      success: true,
      validation_type,
      results: validationResults,
      summary: {
        total_issues: totalIssues,
        errors: errorCount,
        warnings: warningCount,
        score: validationResults.overall_score
      }
    }
    
  } catch (error) {
    console.error('❌ Workflow Validator Error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

interface APIAnalysisParameter {
  name: string;
  value: any;
  description: string;
}

interface APIAnalysisNode {
  primary_node: string;
  config: any;
  description: string;
}

interface APIAnalysisWorkflow {
  name: string;
  description: string;
  nodes: any[];
  connections: any;
}

interface APIAnalysis {
  service_name: string;
  operation_type: string;
  suggested_nodes: APIAnalysisNode[];
  authentication_methods: string[];
  common_parameters: APIAnalysisParameter[];
  example_workflows: APIAnalysisWorkflow[];
}

async function handleApiDocumentationAnalyzer(input: any): Promise<any> {
  const { api_url, service_name, operation_type = 'GET', documentation_url } = input
  
  console.log(`📚 API Documentation Analyzer - Service: ${service_name}`)
  
  try {
    // Analyze common API patterns and suggest n8n configurations
    const analysis: APIAnalysis = {
      service_name,
      operation_type,
      suggested_nodes: [],
      authentication_methods: [],
      common_parameters: [],
      example_workflows: []
    }
    
    // Common service patterns
    const servicePatterns = {
      'google': {
        auth_methods: ['OAuth2', 'API Key'],
        base_url: 'https://www.googleapis.com',
        common_headers: { 'Content-Type': 'application/json' },
        rate_limits: 'Varies by service (typically 100-1000 requests/minute)'
      },
      'slack': {
        auth_methods: ['OAuth2', 'Bot Token'],
        base_url: 'https://slack.com/api',
        common_headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer {token}' },
        rate_limits: 'Tier-based (1+ requests/minute to 100+ requests/minute)'
      },
      'github': {
        auth_methods: ['Personal Access Token', 'OAuth2'],
        base_url: 'https://api.github.com',
        common_headers: { 'Accept': 'application/vnd.github.v3+json', 'Authorization': 'token {token}' },
        rate_limits: '5000 requests/hour for authenticated requests'
      },
      'airtable': {
        auth_methods: ['API Key'],
        base_url: 'https://api.airtable.com/v0',
        common_headers: { 'Authorization': 'Bearer {api_key}' },
        rate_limits: '5 requests/second per base'
      }
    }
    
    const serviceLower = service_name.toLowerCase()
    const matchingKey = Object.keys(servicePatterns).find(key => serviceLower.includes(key))
    const pattern = servicePatterns[serviceLower] || (matchingKey ? servicePatterns[matchingKey] : undefined)
    
    if (pattern) {
      analysis.authentication_methods = pattern.auth_methods
      analysis.common_parameters = [
        {
          name: 'base_url',
          value: pattern.base_url,
          description: 'Base API URL for the service'
        },
        {
          name: 'headers',
          value: pattern.common_headers,
          description: 'Common headers required for API calls'
        },
        {
          name: 'rate_limits',
          value: pattern.rate_limits,
          description: 'API rate limiting information'
        }
      ]
    }
    
    // Suggest appropriate n8n nodes based on operation type
    const nodeSuggestions = {
      'GET': {
        primary_node: 'n8n-nodes-base.httpRequest',
        config: {
          method: 'GET',
          url: api_url || `${pattern?.base_url || 'https://api.service.com'}/endpoint`,
          options: {
            response: { response: { fullResponse: false } }
          }
        },
        description: 'Use HTTP Request node for GET operations to fetch data'
      },
      'POST': {
        primary_node: 'n8n-nodes-base.httpRequest',
        config: {
          method: 'POST',
          url: api_url || `${pattern?.base_url || 'https://api.service.com'}/endpoint`,
          bodyParameters: {
            parameters: [
              { name: 'data', value: '={{$json.data}}' }
            ]
          }
        },
        description: 'Use HTTP Request node for POST operations to create/send data'
      },
      'PUT': {
        primary_node: 'n8n-nodes-base.httpRequest',
        config: {
          method: 'PUT',
          url: api_url || `${pattern?.base_url || 'https://api.service.com'}/endpoint/{{$json.id}}`,
          bodyParameters: {
            parameters: [
              { name: 'data', value: '={{$json}}' }
            ]
          }
        },
        description: 'Use HTTP Request node for PUT operations to update existing data'
      },
      'DELETE': {
        primary_node: 'n8n-nodes-base.httpRequest',
        config: {
          method: 'DELETE',
          url: api_url || `${pattern?.base_url || 'https://api.service.com'}/endpoint/{{$json.id}}`
        },
        description: 'Use HTTP Request node for DELETE operations to remove data'
      }
    }
    
    const suggestion = nodeSuggestions[operation_type]
    if (suggestion) {
      analysis.suggested_nodes.push(suggestion)
    }
    
    // Generate example workflow
    analysis.example_workflows.push({
      name: `${service_name} ${operation_type} Integration`,
      description: `Example workflow for ${operation_type} operations with ${service_name}`,
      nodes: [
        {
          id: 'trigger',
          name: 'Manual Trigger',
          type: 'n8n-nodes-base.manualTrigger',
          position: [0, 0]
        },
        {
          id: 'api-call',
          name: `${service_name} API Call`,
          type: suggestion?.primary_node || 'n8n-nodes-base.httpRequest',
          parameters: suggestion?.config || {},
          position: [300, 0]
        },
        {
          id: 'process-response',
          name: 'Process Response',
          type: 'n8n-nodes-base.code',
          parameters: {
            mode: 'runOnceForAllItems',
            jsCode: `
// Process API response
const response = items[0].json;
console.log('API Response:', response);

return [{
  json: {
    processed_at: new Date().toISOString(),
    service: '${service_name}',
    operation: '${operation_type}',
    data: response
  }
}];`
          },
          position: [600, 0]
        }
      ],
      connections: {
        'Manual Trigger': { main: [['${service_name} API Call']] },
        [`${service_name} API Call`]: { main: [['Process Response']] }
      }
    })
    
    return {
      success: true,
      analysis,
      recommendations: [
        `Use ${suggestion?.primary_node || 'HTTP Request'} node for ${operation_type} operations`,
        `Configure authentication using ${pattern?.auth_methods?.[0] || 'API Key'} method`,
        `Set appropriate headers: ${JSON.stringify(pattern?.common_headers || {})}`,
        `Be aware of rate limits: ${pattern?.rate_limits || 'Check service documentation'}`
      ]
    }
    
  } catch (error) {
    console.error('❌ API Documentation Analyzer Error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { messages, stream = false, currentWorkflow } = await req.json()
    const lastMessage = messages[messages.length - 1]
    const userMessage = typeof lastMessage?.content === 'string' 
      ? lastMessage.content 
      : Array.isArray(lastMessage?.content) 
        ? JSON.stringify(lastMessage.content) 
        : 'No content'
    
    console.log(`📨 Received request - Stream: ${stream}`)
    console.log(`💬 User message: ${userMessage.substring(0, 100)}...`)
    console.log(`🔍 Edge function received currentWorkflow:`, {
      hasWorkflow: !!currentWorkflow,
      workflowName: currentWorkflow?.name,
      nodeCount: currentWorkflow?.nodes?.length || 0
    })

    const claudeResponse = await callClaude(messages, stream, currentWorkflow)

    if (stream) {
      console.log('🌊 Starting streaming response...')
      
      const encoder = new TextEncoder()
      const toolCalls = new Map<string, any>() // Better tool call tracking
      let accumulatedInput = ''
      let textContent = ''
      
      const readable = new ReadableStream({
        async start(controller) {
          try {
            const reader = claudeResponse.body?.getReader()
            if (!reader) throw new Error('No response body')

            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              const chunk = new TextDecoder().decode(value)
              const lines = chunk.split('\n')

              for (const line of lines) {
                const parsed = parseSSELine(line)
                if (!parsed) continue

                const { event, data, metadata } = parsed
                
                // Log all events to debug web search
                if (data?.type) {
                  console.log('📦 Streaming event:', data.type, data.content_block?.type || '', data.tool_use_id || '')
                  if (data.type === 'web_search_tool_result' || data.type.includes('tool') || data.type.includes('search')) {
                    console.log('🔍 Tool/search related event:', JSON.stringify(data, null, 2))
                  }
                }

                if (data?.type === 'content_block_start' && data.content_block?.type === 'tool_use') {
                  // Custom tool call started
                  const toolCall = {
                    id: data.content_block.id,
                    name: data.content_block.name,
                    status: 'calling',
                    input: data.content_block.input || {}
                  }
                  
                  // Reset accumulated input for new tool call
                  accumulatedInput = ''
                  
                  toolCalls.set(toolCall.id, toolCall)
                  
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'tool_call_start',
                    toolCallId: toolCall.id,
                    toolName: toolCall.name,
                    input: toolCall.input,
                    text: ''
                  })}\n\n`))
                  
                  // Don't execute custom tools immediately - wait for input to be complete
                  
                } else if (data?.type === 'content_block_start' && data.content_block?.type === 'server_tool_use') {
                  // Server tool call started (web search)
                  const toolCall = {
                    id: data.content_block.id,
                    name: data.content_block.name,
                    status: 'calling',
                    input: data.content_block.input || {}
                  }
                  
                  toolCalls.set(toolCall.id, toolCall)
                  
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'tool_call_start',
                    toolCallId: toolCall.id,
                    toolName: toolCall.name,
                    input: toolCall.input,
                    text: ''
                  })}\n\n`))
                  
                } else if (data?.type === 'content_block_start' && data.content_block?.type === 'web_search_tool_result') {
                  // Web search results received as content_block_start
                  const toolUseId = data.content_block.tool_use_id
                  const toolCall = toolUseId ? toolCalls.get(toolUseId) : null
                  
                  console.log('🔍 Web search result received (content_block_start):', {
                    toolUseId,
                    hasToolCall: !!toolCall,
                    contentLength: data.content_block?.content?.length || 0,
                    rawData: JSON.stringify(data, null, 2)
                  })
                  
                  let searchResults: any[] = []
                  
                  if (data.content_block?.content && Array.isArray(data.content_block.content)) {
                    console.log('🔍 Processing search content:', data.content_block.content.length, 'items')
                    searchResults = data.content_block.content
                      .filter((result: any) => result.type === 'web_search_result')
                      .map((result: any, index: number) => {
                        console.log(`🔍 Processing result ${index}:`, result)
                        
                        // Extract domain safely
                        let domain = ''
                        try {
                          if (result.url) {
                            domain = new URL(result.url).hostname
                          }
                        } catch (e) {
                          domain = result.url || ''
                        }
                        
                        const processedResult = {
                          title: result.title || 'Untitled',
                          url: result.url || '',
                          snippet: result.encrypted_content ? 'Content available' : 'No description available',
                          domain: domain
                        }
                        
                        console.log(`🔍 Processed result ${index}:`, processedResult)
                        return processedResult
                      })
                  } else {
                    console.log('⚠️ No content array found in web search result:', data)
                  }
                  
                  console.log('🔍 Final parsed search results:', searchResults.length, 'results')
                  
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'tool_call_result',
                    toolCallId: toolUseId,
                    searchResults: searchResults,
                    text: ''
                  })}\n\n`))
                  
                  // Update tool call status
                  if (toolCall) {
                    toolCall.status = 'completed'
                    toolCall.searchResults = searchResults
                  }
                  
                } else if (data?.type === 'content_block_delta' && data.delta?.type === 'input_json_delta') {
                  // Tool input accumulation - this is for tools that stream their input
                  const blockIndex = data.index
                  accumulatedInput += data.delta.partial_json
                  
                  // Find the active tool call for this block
                  const allToolCalls = Array.from(toolCalls.values())
                  const activeToolCall = allToolCalls.find(tc => tc.status === 'calling')
                  
                  if (activeToolCall) {
                    // Try to parse accumulated input
                    try {
                      const parsedInput = JSON.parse(accumulatedInput)
                      activeToolCall.input = parsedInput
                      console.log('🔧 Updated tool input:', activeToolCall.name, parsedInput)
                    } catch (e) {
                      // Still accumulating, not complete JSON yet
                      console.log('🔧 Accumulating input for', activeToolCall.name, ':', accumulatedInput.length, 'chars')
                    }
                  }
                  
                } else if (data?.type === 'web_search_tool_result') {
                  // Real web search results received
                  const toolUseId = data.tool_use_id
                  const toolCall = toolUseId ? toolCalls.get(toolUseId) : null
                  
                  console.log('🔍 Web search result received:', {
                    toolUseId,
                    hasToolCall: !!toolCall,
                    contentLength: data.content?.length || 0,
                    rawData: JSON.stringify(data, null, 2)
                  })
                  
                  let searchResults: any[] = []
                  
                  if (data.content && Array.isArray(data.content)) {
                    console.log('🔍 Processing search content:', data.content.length, 'items')
                    searchResults = data.content.map((result: any, index: number) => {
                      console.log(`🔍 Processing result ${index}:`, result)
                      
                      // Extract domain safely
                      let domain = ''
                      try {
                        if (result.url) {
                          domain = new URL(result.url).hostname
                        }
                      } catch (e) {
                        domain = result.url || ''
                      }
                      
                      const processedResult = {
                        title: result.title || 'Untitled',
                        url: result.url || '',
                        snippet: result.snippet || result.description || 'No description available',
                        domain: domain
                      }
                      
                      console.log(`🔍 Processed result ${index}:`, processedResult)
                      return processedResult
                    })
                  } else {
                    console.log('⚠️ No content array found in web search result:', data)
                  }
                  
                  console.log('🔍 Final parsed search results:', searchResults.length, 'results')
                  
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'tool_call_result',
                    toolCallId: toolUseId,
                    searchResults: searchResults,
                    text: ''
                  })}\n\n`))
                  
                  // Update tool call status
                  if (toolCall) {
                    toolCall.status = 'completed'
                    toolCall.searchResults = searchResults
                  }
                  
                } else if (data?.type === 'content_block_stop') {
                  // Tool call completed - could be for any tool
                  const blockIndex = data.index
                  
                  // Find tool call by index if we don't have explicit ID
                  const allToolCalls = Array.from(toolCalls.values())
                  const toolCall = allToolCalls.find(tc => tc.status === 'calling')
                  
                  console.log('🔍 Content block stop:', {
                    blockIndex,
                    hasActiveTool: !!toolCall,
                    toolCallName: toolCall?.name,
                    toolCallId: toolCall?.id,
                    toolInput: toolCall?.input
                  })
                  
                  // Execute custom tools when their input is complete
                  if (toolCall && ['n8n_workflow_manager', 'workflow_template_generator', 'workflow_validator', 'api_documentation_analyzer'].includes(toolCall.name)) {
                    try {
                      console.log(`🔧 Executing custom tool: ${toolCall.name} with input:`, toolCall.input)
                      
                      let result
                      switch (toolCall.name) {
                        case 'n8n_workflow_manager':
                          result = await handleN8nWorkflowManager(toolCall.input)
                          break
                        case 'workflow_template_generator':
                          result = await handleWorkflowTemplateGenerator(toolCall.input)
                          break
                        case 'workflow_validator':
                          result = await handleWorkflowValidator(toolCall.input)
                          break
                        case 'api_documentation_analyzer':
                          result = await handleApiDocumentationAnalyzer(toolCall.input)
                          break
                      }
                      
                      console.log(`✅ Tool ${toolCall.name} result:`, result)
                      
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                        type: 'tool_call_result',
                        toolCallId: toolCall.id,
                        toolName: toolCall.name,
                        result: result,
                        text: ''
                      })}\n\n`))
                      
                      toolCall.status = 'completed'
                      toolCall.result = result
                    } catch (error) {
                      console.error(`❌ Custom tool error (${toolCall.name}):`, error)
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                        type: 'tool_call_result',
                        toolCallId: toolCall.id,
                        toolName: toolCall.name,
                        result: { success: false, error: error.message },
                        text: ''
                      })}\n\n`))
                      
                      toolCall.status = 'error'
                      toolCall.error = error.message
                    }
                  } else if (toolCall && !toolCall.searchResults && toolCall.name === 'web_search') {
                    // Web search tool completed but we didn't get results yet - send empty results
                    console.log('⚠️ Web search completed without results, sending empty array')
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                      type: 'tool_call_result',
                      toolCallId: toolCall.id,
                      searchResults: [],
                      text: ''
                    })}\n\n`))
                    
                    toolCall.status = 'completed'
                    toolCall.searchResults = []
                  }
                  
                              } else if (data?.type === 'content_block_delta' && data.delta?.type === 'text_delta') {
                // Regular text streaming
                const textChunk = data.delta.text
                textContent += textChunk
                
                // Extract thinking content if present
                if (textChunk.includes('<thinking>') || textContent.includes('<thinking>')) {
                  const thinkingMatch = textContent.match(/<thinking>([\s\S]*?)<\/thinking>/);
                  if (thinkingMatch) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                      type: 'thinking',
                      thinking: thinkingMatch[1].trim(),
                      text: ''
                    })}\n\n`))
                  }
                }
                  
                  // Only extract workflow nodes if the USER explicitly requested workflow creation
                  const userMessage = messages[messages.length - 1]?.content?.toLowerCase() || ''
                  const isWorkflowRequest = (
                    userMessage.includes('create a workflow') ||
                    userMessage.includes('build a workflow') ||
                    userMessage.includes('make a workflow') ||
                    userMessage.includes('generate a workflow') ||
                    userMessage.includes('create an automation') ||
                    userMessage.includes('build an automation') ||
                    userMessage.includes('make an automation') ||
                    userMessage.includes('update this workflow') ||
                    userMessage.includes('modify the workflow') ||
                    userMessage.includes('add nodes')
                  )
                  
                  if (isWorkflowRequest) {
                  // Extract workflow nodes from accumulated text
                  const nodes = extractWorkflowNodes(textContent)
                  if (nodes.length > 0) {
                    nodes.forEach(node => {
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                        type: 'workflow_node',
                        nodeId: node.id,
                        nodeName: node.name,
                        nodeType: node.type,
                        description: node.description,
                        status: 'generating',
                        text: ''
                      })}\n\n`))
                    })
                    }
                  }
                  
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    text: textChunk,
                    done: false
                  })}\n\n`))
                  
                } else if (data?.type === 'message_stop') {
                  // Stream complete
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    text: '',
                    done: true
                  })}\n\n`))
                  break
                }
              }
            }
          } catch (error) {
            console.error('💥 Streaming error:', error)
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              error: error.message,
              done: true
            })}\n\n`))
          } finally {
            controller.close()
          }
        }
      })

      return new Response(readable, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      })
    } else {
      // Non-streaming response
      const result = await claudeResponse.json()
      console.log('✅ Non-streaming response received')
      
      return new Response(JSON.stringify({
        success: true,
        message: result.content?.[0]?.text || 'Hello! How can I help you create workflows today?'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
  } catch (error) {
    console.error('💥 Error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})