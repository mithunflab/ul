import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  Square, 
  User, 
  Loader, 
  MessageSquare,
  Zap,
  CheckCircle,
  Play,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  X
} from 'lucide-react';
import Logo from './Logo';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  workflowPreview?: {
    nodes: string[];
    description: string;
  };
  generatedWorkflow?: any;
  isTyping?: boolean;
}

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onGenerateWorkflow: (workflow: any) => void;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  isGenerating: boolean;
  onClose?: () => void; // Add close handler
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  onGenerateWorkflow,
  isRecording,
  onStartRecording,
  onStopRecording,
  isGenerating,
  onClose
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const suggestedPrompts = [
    "Create a workflow that sends Slack notifications for new HubSpot leads",
    "Build an automation to sync Google Sheets with Airtable",
    "Set up email alerts when my website goes down",
    "Create a social media cross-posting workflow"
  ];

  return (
    <div className="flex flex-col h-full bg-slate-800/30 border-l border-slate-700/50">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <Logo size={16} />
          </div>
          <span className="text-white font-medium">WorkFlow AI</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white transition-colors"
          title="Close Chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area - Full Height */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          /* Welcome State */
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center">
              <Logo size={32} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white mb-2">
                Welcome to WorkFlow AI
              </h4>
              <p className="text-slate-400 mb-6">
                Describe the automation you want to create, and I'll build it for you.
              </p>
            </div>
            
            {/* Suggested Prompts */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-300">Try these examples:</p>
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setInputValue(prompt)}
                  className="block w-full text-left p-3 bg-slate-900/50 hover:bg-slate-800/50 border border-slate-600/50 hover:border-slate-500/50 rounded-xl text-slate-300 hover:text-white transition-all duration-200 text-sm"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages */
          messages.map((message) => (
            <div key={message.id} className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : ''}`}>
              {message.type === 'ai' && (
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Logo size={16} />
                </div>
              )}
              
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-first' : ''}`}>
                {/* Message Bubble */}
                <div className={`rounded-2xl p-4 ${
                  message.type === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-md' 
                    : 'bg-slate-800/50 text-white rounded-tl-md border border-slate-700/50'
                }`}>
                  {message.isTyping ? (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-slate-400 text-sm">AI is thinking...</span>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>

                {/* Timestamp */}
                <div className={`mt-1 text-xs text-slate-500 ${message.type === 'user' ? 'text-right' : ''}`}>
                  {formatTime(message.timestamp)}
                </div>

                {/* Workflow Preview */}
                {message.workflowPreview && (
                  <div className="mt-4 bg-slate-900/50 border border-slate-600/50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium text-sm">Workflow Generated</span>
                    </div>
                    
                    <div className="space-y-2">
                      {message.workflowPreview.nodes.map((node, index) => (
                        <div key={index} className="flex items-center gap-3 text-sm">
                          <div className={`w-3 h-3 rounded-full ${
                            index === 0 ? 'bg-emerald-500' : 
                            index === 1 ? 'bg-blue-500' : 
                            index === 2 ? 'bg-purple-500' : 'bg-amber-500'
                          }`}></div>
                          <span className="text-slate-300">{node}</span>
                          {index < message.workflowPreview.nodes.length - 1 && (
                            <Zap className="w-3 h-3 text-slate-500" />
                          )}
                        </div>
                      ))}
                    </div>

                    {message.generatedWorkflow && (
                      <div className="flex gap-2 pt-2">
                        <button 
                          onClick={() => onGenerateWorkflow(message.generatedWorkflow)}
                          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 text-sm"
                        >
                          <Play className="w-4 h-4" />
                          Generate Workflow
                        </button>
                        <button className="flex items-center gap-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white py-2 px-3 rounded-xl transition-all duration-200 text-sm">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* AI Message Actions */}
                {message.type === 'ai' && !message.isTyping && (
                  <div className="flex items-center gap-2 mt-2">
                    <button className="p-1 text-slate-500 hover:text-emerald-400 transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-slate-500 hover:text-red-400 transition-colors">
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-slate-500 hover:text-slate-300 transition-colors">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-slate-500 hover:text-slate-300 transition-colors">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {message.type === 'user' && (
                <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {isGenerating && (
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Logo size={16} />
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl rounded-tl-md p-4 max-w-xs">
              <div className="flex items-center gap-2">
                <Loader className="w-4 h-4 text-indigo-400 animate-spin" />
                <span className="text-slate-400">Analyzing your request...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-6 border-t border-slate-700/50 space-y-4">
        {/* Text Input with Mic and Send */}
        <div className="relative">
          {/* Microphone Button - Left Side */}
          <button
            onClick={isRecording ? onStopRecording : onStartRecording}
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 z-10 ${
              isRecording
                ? 'bg-red-500 hover:bg-red-400 animate-pulse'
                : 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 hover:scale-105'
            }`}
          >
            {isRecording ? (
              <Square className="w-5 h-5 text-white" />
            ) : (
              <Mic className="w-5 h-5 text-white" />
            )}
          </button>

          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Describe the workflow you want to create..."
            className="w-full pl-16 pr-14 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none min-h-[48px] max-h-[120px]"
            rows={1}
          />

          {/* Send Button - Right Side */}
          <button 
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Recording Status */}
        {isRecording && (
          <div className="flex items-center justify-center gap-2 text-red-400 animate-pulse">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm font-medium">Recording... Click mic to stop</span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 text-xs">
          <button 
            onClick={() => setInputValue("Create a workflow that sends me Slack notifications when we get new leads in HubSpot")}
            className="px-3 py-1 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-lg transition-colors"
          >
            Lead Notifications
          </button>
          <button 
            onClick={() => setInputValue("Build an automation to sync Google Sheets with Airtable every hour")}
            className="px-3 py-1 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-lg transition-colors"
          >
            Data Sync
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;