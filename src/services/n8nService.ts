
import { supabase } from '../integrations/supabase/client';

export interface N8nCredential {
  id: string;
  name: string;
  type: string;
}

export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface N8nConnection {
  host: string;
  apiKey: string;
  isActive: boolean;
}

class N8nService {
  private baseUrl = 'https://nyiwwglvbwrzjwwaajtb.supabase.co';

  private async getHeaders(): Promise<Record<string, string>> {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Auth error:', error);
      throw new Error(`Authentication error: ${error.message}`);
    }
    
    if (!session) {
      throw new Error('Not authenticated. Please sign in to access n8n features.');
    }
    
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  }

  async getConnections(): Promise<N8nConnection[]> {
    try {
      console.log('Getting connections from:', `${this.baseUrl}/functions/v1/n8n-proxy/connections`);
      
      const headers = await this.getHeaders();
      console.log('Headers:', headers);
      
      const response = await fetch(`${this.baseUrl}/functions/v1/n8n-proxy/connections`, {
        method: 'GET',
        headers,
      });

      console.log('Get connections response status:', response.status);
      console.log('Get connections response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Get connections error response:', errorText);
        throw new Error(`Failed to get connections: ${response.status} ${response.statusText}`);
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        console.error('Expected JSON response but got:', contentType);
        // Return empty array instead of throwing error
        return [];
      }

      const data = await response.json();
      return data.connections || [];
    } catch (error) {
      console.error('Get connections failed:', error);
      // Return empty array instead of throwing error to prevent UI crashes
      return [];
    }
  }

  async getWorkflows(): Promise<N8nWorkflow[]> {
    try {
      const { data, error } = await supabase.functions.invoke('n8n-proxy', {
        body: {
          endpoint: 'workflows',
          method: 'GET'
        }
      });

      if (error) {
        console.error('Get workflows error:', error);
        return [];
      }

      return data?.workflows || [];
    } catch (error) {
      console.error('Get workflows failed:', error);
      return [];
    }
  }

  async getCredentials(): Promise<N8nCredential[]> {
    try {
      const { data, error } = await supabase.functions.invoke('n8n-proxy', {
        body: {
          endpoint: 'credentials',
          method: 'GET'
        }
      });

      if (error) {
        console.error('Get credentials error:', error);
        return [];
      }

      return data?.credentials || [];
    } catch (error) {
      console.error('Get credentials failed:', error);
      return [];
    }
  }

  async testConnection(host: string, apiKey: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('n8n-proxy', {
        body: {
          endpoint: 'test-connection',
          method: 'POST',
          data: { host, apiKey }
        }
      });

      if (error) {
        console.error('Test connection error:', error);
        return false;
      }

      return data?.success || false;
    } catch (error) {
      console.error('Test connection failed:', error);
      return false;
    }
  }

  async createWorkflow(workflowData: any): Promise<N8nWorkflow | null> {
    try {
      const { data, error } = await supabase.functions.invoke('n8n-proxy', {
        body: {
          endpoint: 'workflows',
          method: 'POST',
          data: workflowData
        }
      });

      if (error) {
        console.error('Create workflow error:', error);
        return null;
      }

      return data?.workflow || null;
    } catch (error) {
      console.error('Create workflow failed:', error);
      return null;
    }
  }

  async updateWorkflow(workflowId: string, workflowData: any): Promise<N8nWorkflow | null> {
    try {
      const { data, error } = await supabase.functions.invoke('n8n-proxy', {
        body: {
          endpoint: `workflows/${workflowId}`,
          method: 'PUT',
          data: workflowData
        }
      });

      if (error) {
        console.error('Update workflow error:', error);
        return null;
      }

      return data?.workflow || null;
    } catch (error) {
      console.error('Update workflow failed:', error);
      return null;
    }
  }

  async deleteWorkflow(workflowId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('n8n-proxy', {
        body: {
          endpoint: `workflows/${workflowId}`,
          method: 'DELETE'
        }
      });

      if (error) {
        console.error('Delete workflow error:', error);
        return false;
      }

      return data?.success || false;
    } catch (error) {
      console.error('Delete workflow failed:', error);
      return false;
    }
  }
}

export const n8nService = new N8nService();
