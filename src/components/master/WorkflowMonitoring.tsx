import React, { useState } from 'react';
import { 
  Workflow, 
  Search, 
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  Pause,
  MoreVertical
} from 'lucide-react';

export const WorkflowMonitoring: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'running' | 'paused' | 'error'>('all');

  const workflows = [
    {
      id: '1',
      name: 'Email Newsletter Automation',
      user: 'sarah@example.com',
      status: 'running',
      lastRun: '2024-03-10T14:30:00Z',
      successRate: 98.5,
      totalRuns: 1247,
      avgRunTime: '2.3s'
    },
    {
      id: '2',
      name: 'Data Sync Pipeline',
      user: 'john@example.com',
      status: 'error',
      lastRun: '2024-03-10T13:45:00Z',
      successRate: 85.2,
      totalRuns: 892,
      avgRunTime: '15.7s'
    },
    {
      id: '3',
      name: 'Social Media Scheduler',
      user: 'mike@example.com',
      status: 'paused',
      lastRun: '2024-03-09T16:20:00Z',
      successRate: 94.1,
      totalRuns: 456,
      avgRunTime: '5.1s'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'paused': return <Pause className="w-5 h-5 text-amber-400" />;
      default: return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-emerald-400 bg-emerald-400/10';
      case 'error': return 'text-red-400 bg-red-400/10';
      case 'paused': return 'text-amber-400 bg-amber-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700/30">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 rounded-xl flex items-center justify-center border border-indigo-500/20">
            <Workflow className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-50">Workflow Monitoring</h1>
            <p className="text-slate-400">Monitor all user workflows across the platform</p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-slate-300">Running</span>
            </div>
            <p className="text-2xl font-bold text-slate-50">1,247</p>
          </div>
          
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center space-x-2 mb-2">
              <Pause className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-slate-300">Paused</span>
            </div>
            <p className="text-2xl font-bold text-slate-50">89</p>
          </div>
          
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center space-x-2 mb-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-slate-300">Errors</span>
            </div>
            <p className="text-2xl font-bold text-slate-50">12</p>
          </div>
          
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-slate-300">Avg Success Rate</span>
            </div>
            <p className="text-2xl font-bold text-slate-50">94.2%</p>
          </div>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/30">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search workflows or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-50 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="running">Running</option>
              <option value="paused">Paused</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
      </div>

      {/* Workflows Table */}
      <div className="bg-slate-800/30 rounded-2xl border border-slate-700/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/30 border-b border-slate-700/50">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Workflow</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Owner</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Status</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Performance</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Last Run</th>
                <th className="text-right p-4 text-sm font-semibold text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {workflows.map((workflow) => (
                <tr key={workflow.id} className="hover:bg-slate-800/30 transition-colors duration-200">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-lg flex items-center justify-center border border-indigo-500/20">
                        <Workflow className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-200">{workflow.name}</p>
                        <p className="text-sm text-slate-400">ID: {workflow.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-slate-300">{workflow.user}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(workflow.status)}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                        {workflow.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Success Rate</span>
                        <span className="text-sm font-medium text-slate-200">{workflow.successRate}%</span>
                      </div>
                      <div className="w-full bg-slate-700/50 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full"
                          style={{ width: `${workflow.successRate}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>{workflow.totalRuns} runs</span>
                        <span>avg {workflow.avgRunTime}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-slate-400">
                      {new Date(workflow.lastRun).toLocaleString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-2 bg-emerald-600/20 hover:bg-emerald-600/30 rounded-lg text-emerald-400 transition-all duration-200">
                        <Play className="w-4 h-4" />
                      </button>
                      
                      <button className="p-2 bg-amber-600/20 hover:bg-amber-600/30 rounded-lg text-amber-400 transition-all duration-200">
                        <Pause className="w-4 h-4" />
                      </button>
                      
                      <button className="p-2 bg-slate-600/20 hover:bg-slate-600/30 rounded-lg text-slate-400 transition-all duration-200">
                        <MoreVertical className="w-4 h-4" />
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
