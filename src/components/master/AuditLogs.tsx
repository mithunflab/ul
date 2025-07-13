import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Calendar,
  Download,
  Eye,
  User,
  Settings,
  Database,
  Shield,
  AlertTriangle
} from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  details: string;
  ip_address: string;
  user_agent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'auth' | 'user' | 'system' | 'workflow' | 'security';
}

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'auth' | 'user' | 'system' | 'workflow' | 'security'>('all');
  const [dateRange, setDateRange] = useState('7d');

  // Mock data
  const mockLogs: AuditLog[] = [
    {
      id: '1',
      timestamp: '2024-03-10T14:30:25Z',
      user: 'admin@example.com',
      action: 'User Created',
      resource: 'User: john@example.com',
      details: 'New user account created via admin panel',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      severity: 'medium',
      category: 'user'
    },
    {
      id: '2',
      timestamp: '2024-03-10T14:15:12Z',
      user: 'system',
      action: 'Config Updated',
      resource: 'Global n8n Configuration',
      details: 'Global n8n URL updated from previous value',
      ip_address: '127.0.0.1',
      user_agent: 'System Process',
      severity: 'high',
      category: 'system'
    },
    {
      id: '3',
      timestamp: '2024-03-10T13:45:08Z',
      user: 'sarah@example.com',
      action: 'Failed Login',
      resource: 'Authentication System',
      details: 'Multiple failed login attempts detected',
      ip_address: '203.0.113.45',
      user_agent: 'curl/7.68.0',
      severity: 'critical',
      category: 'security'
    },
    {
      id: '4',
      timestamp: '2024-03-10T13:30:45Z',
      user: 'john@example.com',
      action: 'Workflow Deployed',
      resource: 'Workflow: Email Automation',
      details: 'User deployed new workflow to n8n instance',
      ip_address: '192.168.1.105',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      severity: 'low',
      category: 'workflow'
    }
  ];

  React.useEffect(() => {
    // TODO: Load actual audit logs from Supabase
    setLogs(mockLogs);
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'high': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
      case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      case 'low': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'auth': return <Shield className="w-4 h-4" />;
      case 'user': return <User className="w-4 h-4" />;
      case 'system': return <Settings className="w-4 h-4" />;
      case 'workflow': return <Database className="w-4 h-4" />;
      case 'security': return <AlertTriangle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700/30">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl flex items-center justify-center border border-orange-500/20">
            <FileText className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-50">Audit Logs</h1>
            <p className="text-slate-400">Track all system activities and user actions</p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-slate-300">Critical Events</span>
            </div>
            <p className="text-2xl font-bold text-slate-50">3</p>
          </div>
          
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-slate-300">Security Events</span>
            </div>
            <p className="text-2xl font-bold text-slate-50">12</p>
          </div>
          
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center space-x-2 mb-2">
              <User className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-slate-300">User Actions</span>
            </div>
            <p className="text-2xl font-bold text-slate-50">156</p>
          </div>
          
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-slate-300">Total Events</span>
            </div>
            <p className="text-2xl font-bold text-slate-50">{logs.length}</p>
          </div>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/30">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search logs by user, action, or resource..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-50 placeholder-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
            >
              <option value="all">All Categories</option>
              <option value="auth">Authentication</option>
              <option value="user">User Management</option>
              <option value="system">System</option>
              <option value="workflow">Workflows</option>
              <option value="security">Security</option>
            </select>
            
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
            >
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>

            <button className="flex items-center space-x-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 rounded-xl text-white font-semibold transition-all duration-200">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-800/30 rounded-2xl border border-slate-700/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/30 border-b border-slate-700/50">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Timestamp</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">User</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Action</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Resource</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Severity</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">IP Address</th>
                <th className="text-right p-4 text-sm font-semibold text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors duration-200">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 text-slate-400">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {log.user === 'system' ? 'S' : log.user[0]?.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-slate-200 font-medium">{log.user}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(log.category)}
                      <span className="text-slate-200">{log.action}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-slate-300 text-sm">{log.resource}</span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(log.severity)}`}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-slate-400 text-sm font-mono">{log.ip_address}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end">
                      <button className="p-2 bg-slate-600/20 hover:bg-slate-600/30 rounded-lg text-slate-400 transition-all duration-200">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
