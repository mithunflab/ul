
import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Zap, 
  Workflow,
  Activity,
  DollarSign,
  Calendar
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-slate-700/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-50 mb-2">Master Dashboard</h1>
            <p className="text-slate-400 text-lg">
              Welcome to your platform control center. Monitor all activities and metrics.
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-emerald-500/10 rounded-xl px-4 py-2 border border-emerald-500/20">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">All Systems Operational</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/30">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/20">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex items-center space-x-1 text-emerald-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+12%</span>
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-50 mb-1">2,847</p>
            <p className="text-slate-400 text-sm">Total Users</p>
          </div>
        </div>

        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/30">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center border border-purple-500/20">
              <Workflow className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex items-center space-x-1 text-emerald-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+8%</span>
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-50 mb-1">18,429</p>
            <p className="text-slate-400 text-sm">Total Workflows</p>
          </div>
        </div>

        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/30">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-xl flex items-center justify-center border border-amber-500/20">
              <Zap className="w-6 h-6 text-amber-400" />
            </div>
            <div className="flex items-center space-x-1 text-red-400 text-sm">
              <TrendingUp className="w-4 h-4 rotate-180" />
              <span>-3%</span>
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-50 mb-1">847K</p>
            <p className="text-slate-400 text-sm">AI Credits Used</p>
          </div>
        </div>

        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/30">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-xl flex items-center justify-center border border-emerald-500/20">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex items-center space-x-1 text-emerald-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+24%</span>
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-50 mb-1">$45,890</p>
            <p className="text-slate-400 text-sm">Monthly Revenue</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* User Growth Chart */}
        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/30">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-50">User Growth</h3>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400">Last 30 days</span>
            </div>
          </div>
          
          <div className="h-64 bg-slate-900/30 rounded-xl border border-slate-700/50 flex items-center justify-center">
            <div className="text-center space-y-2">
              <BarChart3 className="w-12 h-12 text-slate-500 mx-auto" />
              <p className="text-slate-400">Chart visualization would go here</p>
              <p className="text-sm text-slate-500">Integration with charting library needed</p>
            </div>
          </div>
        </div>

        {/* Workflow Activity */}
        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/30">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-50">Workflow Activity</h3>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400">Real-time</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl border border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-slate-300">Active Workflows</span>
              </div>
              <span className="text-2xl font-bold text-slate-50">1,247</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl border border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span className="text-slate-300">Pending Workflows</span>
              </div>
              <span className="text-2xl font-bold text-slate-50">89</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl border border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-slate-300">Failed Workflows</span>
              </div>
              <span className="text-2xl font-bold text-slate-50">12</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/30">
        <h3 className="text-xl font-semibold text-slate-50 mb-6">Recent System Activity</h3>
        
        <div className="space-y-4">
          {[
            { action: 'New user registration', user: 'sarah@example.com', time: '2 minutes ago', type: 'success' },
            { action: 'Workflow deployment', user: 'john@example.com', time: '5 minutes ago', type: 'info' },
            { action: 'Credit purchase', user: 'mike@example.com', time: '12 minutes ago', type: 'success' },
            { action: 'API rate limit reached', user: 'system', time: '18 minutes ago', type: 'warning' },
            { action: 'Database backup completed', user: 'system', time: '1 hour ago', type: 'success' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-slate-900/30 rounded-xl border border-slate-700/50">
              <div className={`w-3 h-3 rounded-full ${
                activity.type === 'success' ? 'bg-emerald-400' :
                activity.type === 'warning' ? 'bg-amber-400' :
                activity.type === 'error' ? 'bg-red-400' :
                'bg-blue-400'
              }`}></div>
              
              <div className="flex-1">
                <p className="text-slate-200 font-medium">{activity.action}</p>
                <p className="text-sm text-slate-400">{activity.user}</p>
              </div>
              
              <span className="text-sm text-slate-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
