import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Server,
 
  Trash2,
  Edit,
  Globe,
  Shield,
  
  Loader2,
  
  Eye,
  EyeOff,
 Wrench,
  RefreshCw,
  CheckCircle,
 
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface MCPServer {
  id?: string;
  name: string;
  url: string;
  authorization_token?: string;
  tool_configuration?: {
    enabled: boolean;
    allowed_tools?: string[];
  };
  status?: 'connected' | 'disconnected' | 'testing';
  tools?: MCPTool[];
  created_at?: string;
}

interface MCPTool {
  name: string;
  description?: string;
  parameters?: any;
}

interface MCPServerManagerProps {
  onBack: () => void;
}

export const MCPServerManager: React.FC<MCPServerManagerProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingServer, setEditingServer] = useState<MCPServer | null>(null);
  const [testingServer, setTestingServer] = useState<string | null>(null);
  const [showToken, setShowToken] = useState<{ [key: string]: boolean }>({});

  // Form state
  const [formData, setFormData] = useState<MCPServer>({
    name: '',
    url: '',
    authorization_token: '',
    tool_configuration: {
      enabled: true,
      allowed_tools: []
    }
  });

  useEffect(() => {
    loadMCPServers();
  }, []);

  const loadMCPServers = async () => {
    try {
      const { data, error } = await supabase
        .from('mcp_servers')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setServers(data || []);
    } catch (error) {
      console.error('Error loading MCP servers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to normalize authorization token
  const normalizeAuthToken = (token?: string): string | undefined => {
    if (!token) return undefined;
    // Remove any existing "Bearer " prefix (case insensitive) to avoid duplication
    return token.replace(/^bearer\s+/i, '');
  };

  const handleSaveServer = async () => {
    try {
      if (!formData.name || !formData.url) {
        alert('Please fill in all required fields');
        return;
      }

      const serverData = {
        ...formData,
        // Normalize the authorization token
        authorization_token: normalizeAuthToken(formData.authorization_token),
        user_id: user?.id,
        status: 'disconnected'
      };

      if (editingServer?.id) {
        const { error } = await supabase
          .from('mcp_servers')
          .update(serverData)
          .eq('id', editingServer.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('mcp_servers')
          .insert([serverData]);

        if (error) throw error;
      }

      await loadMCPServers();
      resetForm();
    } catch (error) {
      console.error('Error saving MCP server:', error);
      alert('Failed to save MCP server. Please try again.');
    }
  };

  const handleDeleteServer = async (serverId: string) => {
    if (!confirm('Are you sure you want to delete this MCP server?')) return;

    try {
      const { error } = await supabase
        .from('mcp_servers')
        .delete()
        .eq('id', serverId);

      if (error) throw error;
      await loadMCPServers();
    } catch (error) {
      console.error('Error deleting MCP server:', error);
      alert('Failed to delete MCP server. Please try again.');
    }
  };

  const testServerConnection = async (server: MCPServer) => {
    setTestingServer(server.id!);
    try {
      // Test the MCP server connection
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/test-mcp-server`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          url: server.url,
          // Format the token properly - if it doesn't start with "Bearer ", add it
          authorization_token: server.authorization_token ? 
            (server.authorization_token.startsWith('Bearer ') ? 
              server.authorization_token : 
              `Bearer ${server.authorization_token}`) : 
            undefined
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Update server status and tools
        await supabase
          .from('mcp_servers')
          .update({ 
            status: 'connected',
            tools: result.tools 
          })
          .eq('id', server.id);
        
        await loadMCPServers();
      } else {
        // More specific error handling
        if (result.status === 401) {
          alert('Authentication failed: Please check your authorization token and try again.');
        } else {
          alert(`Failed to connect to MCP server: ${result.error || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Error testing MCP server:', error);
      alert('Failed to test MCP server connection. Please check the URL and network connection.');
    } finally {
      setTestingServer(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      authorization_token: '',
      tool_configuration: {
        enabled: true,
        allowed_tools: []
      }
    });
    setShowAddForm(false);
    setEditingServer(null);
  };

  const startEdit = (server: MCPServer) => {
    setFormData(server);
    setEditingServer(server);
    setShowAddForm(true);
  };

  const toggleTokenVisibility = (serverId: string) => {
    setShowToken(prev => ({
      ...prev,
      [serverId]: !prev[serverId]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <p className="text-slate-400">Loading MCP servers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-slate-600"></div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Server className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">MCP Server Manager</h1>
                  <p className="text-sm text-slate-400">Model Context Protocol Integration</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/25"
            >
              <Plus className="w-4 h-4" />
              <span>Add MCP Server</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview */}
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Total Servers</p>
                  <p className="text-2xl font-bold text-slate-50 mt-1">{servers.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                  <Server className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Connected</p>
                  <p className="text-2xl font-bold text-slate-50 mt-1">
                    {servers.filter(s => s.status === 'connected').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Available Tools</p>
                  <p className="text-2xl font-bold text-slate-50 mt-1">
                    {servers.reduce((sum, s) => sum + (s.tools?.length || 0), 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-amber-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {editingServer ? 'Edit MCP Server' : 'Add MCP Server'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Server Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Supabase MCP Server"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-50 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Server URL *
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://your-mcp-server.com/sse"
                      className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-50 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Must be HTTPS URL with SSE or Streamable HTTP transport</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Authorization Token
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showToken['form'] ? 'text' : 'password'}
                      value={formData.authorization_token || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, authorization_token: e.target.value }))}
                      placeholder="Token (optional, 'Bearer' prefix will be added if needed)"
                      className="w-full pl-10 pr-12 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-50 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => toggleTokenVisibility('form')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                    >
                      {showToken['form'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Enter token value only - "Bearer" prefix will be added automatically if needed</p>
                </div>

                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.tool_configuration?.enabled}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        tool_configuration: {
                          ...prev.tool_configuration,
                          enabled: e.target.checked
                        }
                      }))}
                      className="w-4 h-4 text-indigo-600 bg-slate-900 border-slate-600 rounded focus:ring-indigo-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-slate-300">Enable tools from this server</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveServer}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl font-medium transition-all duration-200"
                  >
                    {editingServer ? 'Update Server' : 'Add Server'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Servers List */}
        <div className="space-y-6">
          {servers.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Server className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-50 mb-2">No MCP Servers</h3>
              <p className="text-slate-400 max-w-md mx-auto mb-6">
                Add your first MCP server to extend Claude's capabilities with external tools and data sources.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/25"
              >
                Add Your First MCP Server
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {servers.map((server) => (
                <div key={server.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-3 h-3 rounded-full ${
                          server.status === 'connected' ? 'bg-emerald-500' :
                          server.status === 'testing' ? 'bg-amber-500 animate-pulse' :
                          'bg-slate-500'
                        }`}></div>
                        <h3 className="text-lg font-semibold text-slate-50">{server.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                          server.status === 'connected' ? 'bg-emerald-500/10 text-emerald-400' :
                          server.status === 'testing' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-slate-500/10 text-slate-400'
                        }`}>
                          {server.status === 'connected' ? 'Connected' :
                           server.status === 'testing' ? 'Testing...' :
                           'Disconnected'}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-slate-400">
                          <Globe className="w-4 h-4" />
                          <span>{server.url}</span>
                        </div>
                        {server.authorization_token && (
                          <div className="flex items-center space-x-2 text-sm text-slate-400">
                            <Shield className="w-4 h-4" />
                            <span>
                              {showToken[server.id!] ? 
                                server.authorization_token : 
                                '•'.repeat(Math.min(server.authorization_token.length, 20))
                              }
                            </span>
                            <button
                              onClick={() => toggleTokenVisibility(server.id!)}
                              className="text-slate-500 hover:text-slate-400 transition-colors"
                            >
                              {showToken[server.id!] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                          </div>
                        )}
                      </div>

                      {server.tools && server.tools.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-slate-300 mb-2">Available Tools ({server.tools.length})</h4>
                          <div className="flex flex-wrap gap-2">
                            {server.tools.slice(0, 6).map((tool) => (
                              <span
                                key={tool.name}
                                className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-sm rounded-lg border border-indigo-500/20"
                              >
                                {tool.name}
                              </span>
                            ))}
                            {server.tools.length > 6 && (
                              <span className="px-3 py-1 bg-slate-700 text-slate-400 text-sm rounded-lg">
                                +{server.tools.length - 6} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => testServerConnection(server)}
                        disabled={testingServer === server.id}
                        className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors duration-200 disabled:opacity-50"
                        title="Test Connection"
                      >
                        {testingServer === server.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => startEdit(server)}
                        className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors duration-200"
                        title="Edit Server"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteServer(server.id!)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors duration-200"
                        title="Delete Server"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};


