
import { supabase } from '../integrations/supabase/client';

export interface AIWorkflowRequest {
  message: string;
  chatHistory?: Array<{ role: string; content: string }>;
  selectedWorkflow?: any;
  action: 'generate' | 'analyze' | 'edit' | 'chat';
  workflowContext?: any;
  credentials?: { [key: string]: any };
}

export interface AIStreamResponse {
  type: 'text' | 'workflow' | 'error' | 'tool_start' | 'tool_input' | 'tool_result';
  content: string | any;
}

class AIService {
  private validateEnvironment(): void {
    const supabaseUrl = 'https://nyiwwglvbwrzjwwaajtb.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55aXd3Z2x2Yndyemp3d2FhanRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5Njc0MjUsImV4cCI6MjA2NzU0MzQyNX0.YF99O6oGo-7tnuDPJGDutfd2YoxOpnAyrr26VnfFZvU';
    
    if (!supabaseUrl) {
      throw new Error('Supabase URL is not configured');
    }
    
    if (!supabaseKey) {
      throw new Error('Supabase key is not configured');
    }
  }

  private constructEdgeFunctionUrl(functionName: string): string {
    this.validateEnvironment();
    
    const baseUrl = 'https://nyiwwglvbwrzjwwaajtb.supabase.co';
    return `${baseUrl}/functions/v1/${functionName}`;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Auth error:', error);
      throw new Error(`Authentication error: ${error.message}`);
    }
    
    if (!session) {
      throw new Error('Not authenticated. Please sign in to use AI features.');
    }
    
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  }

  private async getBasicHeaders(): Promise<Record<string, string>> {
    this.validateEnvironment();
    
    return {
      'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55aXd3Z2x2Yndyemp3d2FhanRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5Njc0MjUsImV4cCI6MjA2NzU0MzQyNX0.YF99O6oGo-7tnuDPJGDutfd2YoxOpnAyrr26VnfFZvU`,
      'Content-Type': 'application/json',
    };
  }

  async *generateWorkflowStream(request: AIWorkflowRequest): AsyncGenerator<AIStreamResponse, void, unknown> {
    try {
      console.log('Starting AI workflow generation with request:', request);
      
      // Use Supabase client method instead of raw fetch
      const { data, error } = await supabase.functions.invoke('ai-workflow-generator', {
        body: request,
      });

      if (error) {
        console.error('AI service error:', error);
        yield {
          type: 'error',
          content: `AI service error: ${error.message}`
        };
        return;
      }

      // If we get a direct response (not streaming), yield it
      if (data) {
        if (typeof data === 'string') {
          yield {
            type: 'text',
            content: data
          };
        } else if (data.content) {
          yield {
            type: 'text',
            content: data.content
          };
        } else {
          yield {
            type: 'text',
            content: JSON.stringify(data)
          };
        }
        return;
      }

      // Fallback: if no data, provide a default response
      yield {
        type: 'text',
        content: 'AI service is currently being set up. Please try again in a moment.'
      };

    } catch (error) {
      console.error('AI service error:', error);
      yield {
        type: 'error',
        content: error instanceof Error ? error.message : 'Unknown error occurred while communicating with AI service'
      };
    }
  }

  async generateWorkflow(request: AIWorkflowRequest): Promise<any> {
    const responses: string[] = [];
    let workflowData: any = null;

    for await (const response of this.generateWorkflowStream(request)) {
      if (response.type === 'text') {
        responses.push(response.content as string);
      } else if (response.type === 'workflow') {
        workflowData = response.content;
      } else if (response.type === 'error') {
        throw new Error(response.content as string);
      }
    }

    return {
      content: responses.join(''),
      workflow: workflowData
    };
  }

  // Quick non-streaming method for simple requests
  async chatWithAI(message: string, chatHistory: Array<{ role: string; content: string }> = []): Promise<string> {
    const request: AIWorkflowRequest = {
      message,
      chatHistory,
      action: 'chat'
    };

    const responses: string[] = [];

    for await (const response of this.generateWorkflowStream(request)) {
      if (response.type === 'text') {
        responses.push(response.content as string);
      } else if (response.type === 'error') {
        throw new Error(response.content as string);
      }
    }

    return responses.join('');
  }

  // Test connection to AI service with better error handling
  async testConnection(): Promise<boolean> {
    try {
      // Test using Supabase client
      const { data, error } = await supabase.functions.invoke('ai-workflow-generator', {
        body: {
          message: 'test',
          action: 'chat'
        },
      });

      if (error) {
        console.error('Test connection failed:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('AI service connection test failed:', error);
      return false;
    }
  }

  // Simple connectivity test without authentication
  async testBasicConnectivity(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-workflow-generator', {
        body: {
          message: 'connectivity-test',
          action: 'chat'
        },
      });

      return {
        success: !error,
        error: error ? error.message : undefined
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Basic connectivity test failed:', errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Generate workflow with credentials for testing
  async generateWorkflowWithCredentials(
    message: string, 
    credentials: { [key: string]: any },
    chatHistory: Array<{ role: string; content: string }> = []
  ): Promise<any> {
    const request: AIWorkflowRequest = {
      message,
      chatHistory,
      action: 'generate',
      credentials
    };

    return this.generateWorkflow(request);
  }

  // Analyze workflow with enhanced capabilities
  async analyzeWorkflowAdvanced(
    workflow: any,
    question: string = "Analyze this workflow comprehensively",
    credentials?: { [key: string]: any }
  ): Promise<any> {
    const request: AIWorkflowRequest = {
      message: question,
      selectedWorkflow: workflow,
      action: 'analyze',
      credentials
    };

    return this.generateWorkflow(request);
  }
}

export const aiService = new AIService();
