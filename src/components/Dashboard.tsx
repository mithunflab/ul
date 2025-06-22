import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, Eye, EyeOff, Plug, CheckCircle, XCircle, Loader, Bell, Settings, ChevronRight, Plus, Folder, Play, Save, ZoomIn, ZoomOut, RefreshCw, Sparkles, User, Mic, Square as Stop, Send, Activity, Zap, Clock, AlertTriangle, Database, Globe, Workflow, MessageSquare, ChevronLeft, ChevronDown } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../hooks/useAuth';
import { useN8n } from '../hooks/useN8n';

interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  position: { x: number; y: number };
  status: 'idle' | 'running' | 'success' | 'error';
  icon: string;
  color: string;
}

interface WorkflowConnection {
  from: string;
  to: string;
}

interface GeneratedWorkflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  description: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  workflowPreview?: {
    nodes: string[];
    description: string;
  };
  generatedWorkflow?: GeneratedWorkflow;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    connections, 
    activeConnection, 
    workflows, 
    loading: n8nLoading, 
    error: n8nError,
    testConnection,
    saveConnection,
    loadWorkflows,
    activateWorkflow,
    deactivateWorkflow,
    executeWorkflow
  } = useN8n();

  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [n8nUrl, setN8nUrl] = useState('');
  const [n8nApiKey, setN8nApiKey] = useState('');
  const [instanceName, setInstanceName] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activePanel, setActivePanel] = useState<'info' | 'workflow' | 'ai'>('workflow');
  const [isRecording, setIsRecording] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState<GeneratedWorkflow | null>(null);
  const [isGeneratingWorkflow, setIsGeneratingWorkflow] = useState(false);
  const [animatingNodes, setAnimatingNodes] = useState<string[]>([]);
  
  // Panel visibility states
  const [isChatbotCollapsed, setIsChatbotCollapsed] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Refs to prevent DOM manipulation conflicts
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const workflowCanvasRef = useRef<HTMLDivElement>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout[]>([]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi! I'm your AI workflow assistant. I can help you create n8n workflows using voice commands or text descriptions. What would you like to automate?",
      timestamp: new Date()
    }
  ]);

  // Predefined workflow templates
  const workflowTemplates = {
    'contact-form-email': {
      id: 'contact-form-email',
      name: 'Contact Form to Email',
      description: 'Sends email notifications when contact form is submitted',
      nodes: [
        {
          id: 'webhook-1',
          name: 'Webhook Trigger',
          type: 'webhook',
          position: { x: 100, y: 200 },
          status: 'idle' as const,
          icon: 'Globe',
          color: 'bg-emerald-500'
        },
        {
          id: 'filter-1',
          name: 'Filter Data',
          type: 'filter',
          position: { x: 350, y: 200 },
          status: 'idle' as const,
          icon: 'Zap',
          color: 'bg-blue-500'
        },
        {
          id: 'email-1',
          name: 'Send Email',
          type: 'email',
          position: { x: 600, y: 200 },
          status: 'idle' as const,
          icon: 'Send',
          color: 'bg-purple-500'
        }
      ],
      connections: [
        { from: 'webhook-1', to: 'filter-1' },
        { from: 'filter-1', to: 'email-1' }
      ]
    },
    'slack-notifications': {
      id: 'slack-notifications',
      name: 'Slack Lead Notifications',
      description: 'Sends Slack notifications for new HubSpot leads',
      nodes: [
        {
          id: 'hubspot-1',
          name: 'HubSpot Trigger',
          type: 'hubspot',
          position: { x: 100, y: 200 },
          status: 'idle' as const,
          icon: 'Database',
          color: 'bg-orange-500'
        },
        {
          id: 'transform-1',
          name: 'Transform Data',
          type: 'transform',
          position: { x: 350, y: 200 },
          status: 'idle' as const,
          icon: 'Zap',
          color: 'bg-indigo-500'
        },
        {
          id: 'slack-1',
          name: 'Send to Slack',
          type: 'slack',
          position: { x: 600, y: 200 },
          status: 'idle' as const,
          icon: 'MessageSquare',
          color: 'bg-green-500'
        }
      ],
      connections: [
        { from: 'hubspot-1', to: 'transform-1' },
        { from: 'transform-1', to: 'slack-1' }
      ]
    }
  };

  // Cleanup function for animation timeouts
  const clearAnimationTimeouts = useCallback(() => {
    animationTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
    animationTimeoutRef.current = [];
  }, []);

  // Check for existing connection on mount
  useEffect(() => {
    if (connections.length === 0 && !activeConnection) {
      setShowConnectionModal(true);
    }
  }, [connections, activeConnection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAnimationTimeouts();
    };
  }, [clearAnimationTimeouts]);

  const handleTestConnection = async () => {
    if (!n8nUrl || !n8nApiKey || !instanceName) {
      setConnectionResult({
        success: false,
        message: 'Please fill in all fields'
      });
      return;
    }

    setIsConnecting(true);
    setConnectionResult(null);
    
    try {
      const result = await testConnection(n8nUrl, n8nApiKey, instanceName);
      setConnectionResult(result);
      
      if (result.success) {
        // Auto-save successful connection
        setTimeout(async () => {
          try {
            await saveConnection(
              n8nUrl, 
              n8nApiKey, 
              instanceName, 
              result.data?.workflowCount,
              result.data?.version
            );
            setShowConnectionModal(false);
            // Reset form
            setN8nUrl('');
            setN8nApiKey('');
            setInstanceName('');
            setConnectionResult(null);
          } catch (error) {
            console.error('Auto-save failed:', error);
          }
        }, 2000);
      }
    } catch (error) {
      setConnectionResult({
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed'
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      // Simulate voice recording
      const timeout = setTimeout(() => {
        setIsRecording(false);
        setChatInput("Create a workflow that sends me an email when someone fills out my contact form");
      }, 3000);
      
      animationTimeoutRef.current.push(timeout);
    }
  };

  const handleSendMessage = useCallback(() => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsGenerating(true);

    // Simulate AI response
    const timeout = setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I'll create a workflow that triggers when your contact form is submitted and sends you an email notification. Here's what I'll build:",
        timestamp: new Date(),
        workflowPreview: {
          nodes: ['Webhook Trigger', 'Filter Data', 'Send Email'],
          description: 'Contact form to email notification'
        },
        generatedWorkflow: workflowTemplates['contact-form-email']
      };

      setChatMessages(prev => [...prev, aiMessage]);
      setIsGenerating(false);
    }, 2000);

    animationTimeoutRef.current.push(timeout);
  }, [chatInput]);

  const handleGenerateWorkflow = useCallback((workflow: GeneratedWorkflow) => {
    // Clear any existing timeouts
    clearAnimationTimeouts();
    
    setIsGeneratingWorkflow(true);
    setActivePanel('workflow');
    
    // Clear existing workflow and animations
    setCurrentWorkflow(null);
    setAnimatingNodes([]);
    
    // Start generating workflow with animation
    const initialTimeout = setTimeout(() => {
      setCurrentWorkflow(workflow);
      
      // Animate nodes appearing one by one
      workflow.nodes.forEach((node, index) => {
        const nodeTimeout = setTimeout(() => {
          setAnimatingNodes(prev => {
            if (prev.includes(node.id)) return prev;
            return [...prev, node.id];
          });
        }, index * 800);
        
        animationTimeoutRef.current.push(nodeTimeout);
      });
      
      // Finish generation
      const finishTimeout = setTimeout(() => {
        setIsGeneratingWorkflow(false);
      }, workflow.nodes.length * 800 + 1000);
      
      animationTimeoutRef.current.push(finishTimeout);
    }, 500);

    animationTimeoutRef.current.push(initialTimeout);
  }, [clearAnimationTimeouts]);

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Globe,
      Zap,
      Send,
      Database,
      MessageSquare
    };
    return icons[iconName] || Activity;
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    const name = user.user_metadata?.full_name || user.email;
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatLastExecution = (workflow: any) => {
    // Mock data for now
    const times = ['2 minutes ago', '1 hour ago', '3 hours ago', '1 day ago'];
    return times[Math.floor(Math.random() * times.length)];
  };

  // Scroll to bottom of chat when new messages are added
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <div className="h-screen bg-slate-900 flex flex-col overflow-hidden">
      {/* Top Navigation - Fixed Height */}
      <nav className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size={32} />
            <h1 className="text-xl font-bold text-white">WorkFlow AI</h1>
            
            {/* Connection Status Indicator */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
              activeConnection 
                ? 'bg-emerald-500/10 border-emerald-500/20' 
                : 'bg-red-500/10 border-red-500/20'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                activeConnection ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
              }`}></div>
              <span className={`text-sm font-medium ${
                activeConnection ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {activeConnection ? `Connected to ${activeConnection.instance_name}` : 'Not Connected'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowConnectionModal(true)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {getUserInitials()}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Tab Navigation - Fixed Height */}
      <div className="lg:hidden bg-slate-800/50 border-b border-slate-700/50 px-4 py-2 flex-shrink-0">
        <div className="flex space-x-1">
          {[
            { id: 'info', label: 'n8n Info', icon: Database },
            { id: 'workflow', label: 'Workflow', icon: Workflow },
            { id: 'ai', label: 'AI Chat', icon: MessageSquare }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePanel(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  activePanel === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Three-Panel Layout - Fills remaining height */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - n8n Info */}
        <div className={`${
          isSidebarCollapsed ? 'w-16' : 'w-80'
        } bg-slate-800/30 border-r border-slate-700/50 flex flex-col transition-all duration-300 ${
          activePanel === 'info' ? 'block' : 'hidden'
        } lg:block relative flex-shrink-0`}>
          
          {/* Collapse Button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-3 top-6 w-6 h-6 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-full flex items-center justify-center text-slate-300 hover:text-white transition-colors z-10"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>

          {!isSidebarCollapsed ? (
            <>
              {/* n8n Instance Overview - Fixed Height */}
              <div className="p-6 border-b border-slate-700/50 flex-shrink-0">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  n8n Instance
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Status</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        activeConnection ? 'bg-emerald-500' : 'bg-red-500'
                      }`}></div>
                      <span className={`font-medium ${
                        activeConnection ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {activeConnection ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>

                  {activeConnection && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Instance</span>
                        <span className="text-white font-medium">{activeConnection.instance_name}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Version</span>
                        <span className="text-white font-medium">{activeConnection.version || 'Unknown'}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Workflows</span>
                        <span className="text-white font-medium">{workflows.length}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Last Connected</span>
                        <span className="text-white font-medium text-sm">
                          {activeConnection.last_connected 
                            ? new Date(activeConnection.last_connected).toLocaleTimeString()
                            : 'Never'
                          }
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Recent Workflows - Scrollable Area */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-6 pb-4 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-semibold text-white">Workflows</h4>
                    {n8nLoading && <Loader className="w-4 h-4 text-indigo-400 animate-spin" />}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-6 pb-6">
                  {n8nError ? (
                    <div className="text-red-400 text-sm p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      {n8nError}
                    </div>
                  ) : workflows.length > 0 ? (
                    <div className="space-y-3">
                      {workflows.map((workflow) => (
                        <div
                          key={workflow.id}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700/30 cursor-pointer transition-colors group"
                        >
                          <div className={`w-3 h-3 rounded-full ${
                            workflow.active ? 'bg-emerald-500' : 'bg-slate-500'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate group-hover:text-indigo-400 transition-colors">
                              {workflow.name}
                            </p>
                            <p className="text-slate-400 text-sm">{formatLastExecution(workflow)}</p>
                          </div>
                          <div className="flex gap-1">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (workflow.active) {
                                  deactivateWorkflow(workflow.id);
                                } else {
                                  activateWorkflow(workflow.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-white transition-colors"
                              title={workflow.active ? 'Deactivate' : 'Activate'}
                            >
                              {workflow.active ? <Stop className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                            </button>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-300" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : activeConnection ? (
                    <div className="text-slate-400 text-sm text-center py-8">
                      No workflows found in your n8n instance
                    </div>
                  ) : (
                    <div className="text-slate-400 text-sm text-center py-8">
                      Connect your n8n instance to view workflows
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions - Fixed Height */}
              <div className="p-6 border-t border-slate-700/50 flex-shrink-0">
                <h4 className="text-md font-semibold text-white mb-4">Quick Actions</h4>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-300 hover:text-white hover:bg-slate-700/30 rounded-lg transition-colors">
                    <Plus className="w-5 h-5" />
                    Create Workflow
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-300 hover:text-white hover:bg-slate-700/30 rounded-lg transition-colors">
                    <Folder className="w-5 h-5" />
                    Browse Templates
                  </button>
                  <button 
                    onClick={() => setShowConnectionModal(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-300 hover:text-white hover:bg-slate-700/30 rounded-lg transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                    Connection Settings
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Collapsed Sidebar */
            <div className="p-4 space-y-4">
              <div className="flex flex-col items-center gap-4">
                <Database className="w-6 h-6 text-slate-400" />
                <div className={`w-3 h-3 rounded-full ${
                  activeConnection ? 'bg-emerald-500' : 'bg-red-500'
                }`}></div>
              </div>
              
              <div className="space-y-2">
                <button className="w-full p-3 text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg transition-colors flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </button>
                <button className="w-full p-3 text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg transition-colors flex items-center justify-center">
                  <Folder className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setShowConnectionModal(true)}
                  className="w-full p-3 text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Center Panel - Workflow Generation */}
        <div className={`flex-1 flex flex-col ${
          activePanel === 'workflow' ? 'block' : 'hidden'
        } lg:block`}>
          {/* Toolbar - Fixed Height */}
          <div className="bg-slate-800/50 border-b border-slate-700/50 px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Workflow className="w-6 h-6" />
                  Workflow Builder
                </h2>
                <div className="flex items-center gap-2">
                  <button 
                    disabled={!currentWorkflow}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-4 h-4" />
                    Deploy
                  </button>
                  <button 
                    disabled={!currentWorkflow}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition-colors">
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition-colors">
                  <ZoomOut className="w-5 h-5" />
                </button>
                <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition-colors">
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Canvas Area - Fills remaining space, no scroll */}
          <div className="flex-1 relative bg-slate-900/50 overflow-hidden" ref={workflowCanvasRef}>
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%" className="pointer-events-none">
                <defs>
                  <pattern
                    id="grid"
                    width="20"
                    height="20"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 20 0 L 0 0 0 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Workflow Visualization */}
            {currentWorkflow ? (
              <div className="relative z-10 p-8 h-full">
                {/* Workflow Title */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{currentWorkflow.name}</h3>
                  <p className="text-slate-400">{currentWorkflow.description}</p>
                </div>

                {/* Workflow Nodes */}
                <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
                  {/* Connection Lines */}
                  {currentWorkflow.connections.map((connection, index) => {
                    const fromNode = currentWorkflow.nodes.find(n => n.id === connection.from);
                    const toNode = currentWorkflow.nodes.find(n => n.id === connection.to);
                    
                    if (!fromNode || !toNode) return null;
                    
                    const fromX = fromNode.position.x + 100; // Node width/2
                    const fromY = fromNode.position.y + 40; // Node height/2
                    const toX = toNode.position.x;
                    const toY = toNode.position.y + 40;
                    
                    return (
                      <g key={`${connection.from}-${connection.to}`}>
                        <defs>
                          <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 0.8 }} />
                            <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 0.8 }} />
                          </linearGradient>
                        </defs>
                        <line
                          x1={fromX}
                          y1={fromY}
                          x2={toX}
                          y2={toY}
                          stroke={`url(#gradient-${index})`}
                          strokeWidth="3"
                          strokeDasharray="5,5"
                          className={`transition-all duration-1000 ${
                            animatingNodes.includes(connection.to) ? 'opacity-100' : 'opacity-0'
                          }`}
                        >
                          <animate
                            attributeName="stroke-dashoffset"
                            values="10;0"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                        </line>
                        {/* Arrow */}
                        <polygon
                          points={`${toX-8},${toY-4} ${toX},${toY} ${toX-8},${toY+4}`}
                          fill="#8b5cf6"
                          className={`transition-all duration-1000 ${
                            animatingNodes.includes(connection.to) ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Nodes */}
                {currentWorkflow.nodes.map((node) => {
                  const IconComponent = getIconComponent(node.icon);
                  const isAnimating = animatingNodes.includes(node.id);
                  
                  return (
                    <div
                      key={node.id}
                      className={`absolute transition-all duration-500 ${
                        isAnimating 
                          ? 'opacity-100 scale-100 translate-y-0' 
                          : 'opacity-0 scale-75 translate-y-4'
                      }`}
                      style={{
                        left: node.position.x,
                        top: node.position.y,
                        zIndex: 10
                      }}
                    >
                      <div className={`${node.color} text-white p-6 rounded-2xl shadow-xl border-2 border-white/20 min-w-[200px] hover:scale-105 transition-transform duration-200 cursor-pointer`}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg">{node.name}</h4>
                            <p className="text-white/80 text-sm capitalize">{node.type}</p>
                          </div>
                        </div>
                        
                        {/* Status Indicator */}
                        <div className="flex items-center gap-2 mt-3">
                          <div className={`w-2 h-2 rounded-full ${
                            node.status === 'success' ? 'bg-emerald-400' :
                            node.status === 'error' ? 'bg-red-400' :
                            node.status === 'running' ? 'bg-yellow-400 animate-pulse' :
                            'bg-slate-400'
                          }`}></div>
                          <span className="text-white/80 text-sm capitalize">{node.status}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Generation Progress */}
                {isGeneratingWorkflow && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800/90 backdrop-blur-sm rounded-2xl p-8 border border-slate-600">
                    <div className="text-center">
                      <Loader className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">Generating Workflow</h3>
                      <p className="text-slate-400">Creating nodes and connections...</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Empty State */
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="w-24 h-24 bg-slate-800 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Start Building Your Workflow
                  </h3>
                  <p className="text-slate-400 mb-6">
                    Use AI to generate workflows or drag and drop nodes to build manually
                  </p>
                  <button 
                    onClick={() => setActivePanel('ai')}
                    className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-indigo-500/25"
                  >
                    Generate with AI
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Status Bar - Fixed Height */}
          <div className="bg-slate-800/50 border-t border-slate-700/50 px-6 py-3 flex-shrink-0">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="text-slate-400">
                  Nodes: <span className="text-white">{currentWorkflow?.nodes.length || 0}</span>
                </span>
                <span className="text-slate-400">
                  Connections: <span className="text-white">{currentWorkflow?.connections.length || 0}</span>
                </span>
                <span className="text-slate-400">
                  Status: <span className={currentWorkflow ? 'text-emerald-400' : 'text-slate-500'}>
                    {currentWorkflow ? 'Ready' : 'Empty'}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${currentWorkflow ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
                <span className="text-slate-400">
                  {currentWorkflow ? 'Workflow loaded' : 'Ready to build'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - AI Chatbot */}
        <div className={`${
          isChatbotCollapsed ? 'w-16' : 'w-96'
        } bg-slate-800/30 border-l border-slate-700/50 flex flex-col transition-all duration-300 ${
          activePanel === 'ai' ? 'block' : 'hidden'
        } lg:block relative flex-shrink-0`}>
          
          {/* Collapse Button */}
          <button
            onClick={() => setIsChatbotCollapsed(!isChatbotCollapsed)}
            className="absolute -left-3 top-6 w-6 h-6 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-full flex items-center justify-center text-slate-300 hover:text-white transition-colors z-10"
          >
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isChatbotCollapsed ? 'rotate-180' : ''}`} />
          </button>

          {!isChatbotCollapsed ? (
            <>
              {/* Chat Header - Fixed Height */}
              <div className="p-6 border-b border-slate-700/50 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
                    <p className="text-slate-400 text-sm">
                      Create workflows with voice or text
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Messages - Scrollable Area */}
              <div 
                ref={chatMessagesRef}
                className="flex-1 overflow-y-auto p-6 space-y-4"
              >
                {chatMessages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : ''}`}>
                    {message.type === 'ai' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <div className={`max-w-xs ${message.type === 'user' ? 'order-first' : ''}`}>
                      <div className={`rounded-2xl p-4 ${
                        message.type === 'user' 
                          ? 'bg-indigo-600 rounded-tr-md' 
                          : 'bg-slate-800/50 rounded-tl-md'
                      }`}>
                        <p className="text-white">{message.content}</p>
                      </div>
                      
                      {message.workflowPreview && (
                        <div className="mt-3 bg-slate-900/50 rounded-xl p-3 space-y-2">
                          {message.workflowPreview.nodes.map((node, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <div className={`w-3 h-3 rounded-full ${
                                index === 0 ? 'bg-emerald-500' : 
                                index === 1 ? 'bg-blue-500' : 'bg-purple-500'
                              }`}></div>
                              <span className={
                                index === 0 ? 'text-emerald-400' : 
                                index === 1 ? 'text-blue-400' : 'text-purple-400'
                              }>
                                {node}
                              </span>
                            </div>
                          ))}
                          {message.generatedWorkflow && (
                            <button 
                              onClick={() => handleGenerateWorkflow(message.generatedWorkflow!)}
                              className="w-full mt-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 text-sm"
                            >
                              Generate Workflow
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {message.type === 'user' && (
                      <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {isGenerating && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-slate-800/50 rounded-2xl rounded-tl-md p-4 max-w-xs">
                      <div className="flex items-center gap-2">
                        <Loader className="w-4 h-4 text-indigo-400 animate-spin" />
                        <span className="text-slate-400">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Voice/Text Input - Fixed Height */}
              <div className="p-6 border-t border-slate-700/50 flex-shrink-0">
                <div className="space-y-4">
                  {/* Voice Recording Button */}
                  <div className="flex justify-center">
                    <button
                      onClick={handleVoiceRecord}
                      className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl ${
                        isRecording
                          ? 'bg-red-500 hover:bg-red-400 animate-pulse'
                          : 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500'
                      }`}
                    >
                      {isRecording ? (
                        <Stop className="w-8 h-8 text-white" />
                      ) : (
                        <Mic className="w-8 h-8 text-white" />
                      )}
                    </button>
                  </div>

                  <div className="text-center">
                    <p className="text-slate-400 text-sm">
                      {isRecording
                        ? 'Recording... Click to stop'
                        : 'Click to record or type below'}
                    </p>
                  </div>

                  {/* Text Input */}
                  <div className="relative">
                    <textarea
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Describe the workflow you want to create..."
                      className="w-full px-4 py-3 pr-12 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none"
                      rows={3}
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim()}
                      className="absolute bottom-3 right-3 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Collapsed Chatbot */
            <div className="p-4 flex flex-col items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              
              <button
                onClick={handleVoiceRecord}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-400 animate-pulse'
                    : 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500'
                }`}
              >
                {isRecording ? (
                  <Stop className="w-6 h-6 text-white" />
                ) : (
                  <Mic className="w-6 h-6 text-white" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* n8n Connection Modal */}
      {showConnectionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Link className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Connect Your n8n Instance
                </h2>
                <p className="text-slate-400">
                  Enter your n8n details to start automating workflows
                </p>
              </div>

              {/* Connection Form */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Instance Name
                  </label>
                  <input
                    type="text"
                    value={instanceName}
                    onChange={(e) => setInstanceName(e.target.value)}
                    placeholder="My n8n Instance"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    n8n URL
                  </label>
                  <input
                    type="url"
                    value={n8nUrl}
                    onChange={(e) => setN8nUrl(e.target.value)}
                    placeholder="https://your-n8n-instance.com"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={n8nApiKey}
                      onChange={(e) => setN8nApiKey(e.target.value)}
                      placeholder="Enter your n8n API key"
                      className="w-full px-4 py-3 pr-12 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors duration-200"
                    >
                      {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Test Connection Button */}
                <button 
                  onClick={handleTestConnection}
                  disabled={isConnecting || !n8nUrl || !n8nApiKey || !instanceName}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConnecting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <Plug className="w-5 h-5" />
                      Test & Save Connection
                    </>
                  )}
                </button>

                {/* Connection Status */}
                {connectionResult && (
                  <div className={`p-4 rounded-xl border ${
                    connectionResult.success 
                      ? 'bg-emerald-500/10 border-emerald-500/20' 
                      : 'bg-red-500/10 border-red-500/20'
                  }`}>
                    <div className="flex items-center gap-3">
                      {connectionResult.success ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <p className={`font-medium ${
                        connectionResult.success ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {connectionResult.message}
                      </p>
                    </div>
                    {connectionResult.success && (
                      <p className="text-emerald-300 text-sm mt-2">
                        Connection will be saved automatically...
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Close Button */}
              {activeConnection && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowConnectionModal(false)}
                    className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;