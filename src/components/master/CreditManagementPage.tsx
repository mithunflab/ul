
import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  Plus, 
  Minus, 
  User, 
  Zap, 
  Workflow,
  Filter,
  MoreVertical,
  Eye,
  Edit3,
  History
} from 'lucide-react';

interface UserCredit {
  id: string;
  email: string;
  name: string;
  ai_credits: number;
  workflow_credits: number;
  total_used_ai: number;
  total_used_workflows: number;
  created_at: string;
  last_activity: string;
  status: 'active' | 'inactive' | 'suspended';
}

export const CreditManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserCredit[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserCredit | null>(null);
  const [showAddCredits, setShowAddCredits] = useState(false);
  const [creditAmount, setCreditAmount] = useState({ ai: 0, workflow: 0 });
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - replace with actual API calls
  const mockUsers: UserCredit[] = [
    {
      id: '1',
      email: 'john@example.com',
      name: 'John Doe',
      ai_credits: 150,
      workflow_credits: 25,
      total_used_ai: 850,
      total_used_workflows: 75,
      created_at: '2024-01-15',
      last_activity: '2024-03-10',
      status: 'active'
    },
    {
      id: '2',
      email: 'sarah@example.com',
      name: 'Sarah Wilson',
      ai_credits: 75,
      workflow_credits: 12,
      total_used_ai: 425,
      total_used_workflows: 38,
      created_at: '2024-02-01',
      last_activity: '2024-03-09',
      status: 'active'
    },
    {
      id: '3',
      email: 'mike@example.com',
      name: 'Mike Johnson',
      ai_credits: 0,
      workflow_credits: 5,
      total_used_ai: 200,
      total_used_workflows: 15,
      created_at: '2024-02-20',
      last_activity: '2024-03-05',
      status: 'inactive'
    }
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      // TODO: Load from Supabase users table with credit information
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUsers(mockUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addCredits = async (userId: string, aiCredits: number, workflowCredits: number) => {
    try {
      // TODO: Update credits in Supabase
      console.log('Adding credits:', { userId, aiCredits, workflowCredits });
      
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              ai_credits: user.ai_credits + aiCredits,
              workflow_credits: user.workflow_credits + workflowCredits
            }
          : user
      ));
      
      setShowAddCredits(false);
      setSelectedUser(null);
      setCreditAmount({ ai: 0, workflow: 0 });
    } catch (error) {
      console.error('Failed to add credits:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-400 bg-emerald-400/10';
      case 'inactive': return 'text-amber-400 bg-amber-400/10';
      case 'suspended': return 'text-red-400 bg-red-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700/30">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-xl flex items-center justify-center border border-emerald-500/20">
            <CreditCard className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-50">Credit Management</h1>
            <p className="text-slate-400">Manage AI and workflow credits for all users</p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-slate-300">Total AI Credits</span>
            </div>
            <p className="text-2xl font-bold text-slate-50">
              {users.reduce((sum, user) => sum + user.ai_credits, 0).toLocaleString()}
            </p>
          </div>
          
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center space-x-2 mb-2">
              <Workflow className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-slate-300">Total Workflow Credits</span>
            </div>
            <p className="text-2xl font-bold text-slate-50">
              {users.reduce((sum, user) => sum + user.workflow_credits, 0).toLocaleString()}
            </p>
          </div>
          
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center space-x-2 mb-2">
              <User className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-slate-300">Active Users</span>
            </div>
            <p className="text-2xl font-bold text-slate-50">
              {users.filter(user => user.status === 'active').length}
            </p>
          </div>
          
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center space-x-2 mb-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-slate-300">Credits Used Today</span>
            </div>
            <p className="text-2xl font-bold text-slate-50">1,247</p>
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
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-50 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-slate-300 transition-all duration-200">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white font-semibold transition-all duration-200">
              <Plus className="w-4 h-4" />
              <span>Bulk Add Credits</span>
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800/30 rounded-2xl border border-slate-700/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/30 border-b border-slate-700/50">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">User</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">AI Credits</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Workflow Credits</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Usage</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Status</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Last Activity</th>
                <th className="text-right p-4 text-sm font-semibold text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/30 transition-colors duration-200">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{user.name[0]}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-200">{user.name}</p>
                        <p className="text-sm text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span className="font-semibold text-slate-200">{user.ai_credits.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Workflow className="w-4 h-4 text-indigo-400" />
                      <span className="font-semibold text-slate-200">{user.workflow_credits}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="text-sm text-slate-300">AI: {user.total_used_ai.toLocaleString()}</div>
                      <div className="text-sm text-slate-300">WF: {user.total_used_workflows}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-slate-400">
                      {new Date(user.last_activity).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowAddCredits(true);
                        }}
                        className="p-2 bg-emerald-600/20 hover:bg-emerald-600/30 rounded-lg text-emerald-400 transition-all duration-200"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      
                      <button className="p-2 bg-slate-600/20 hover:bg-slate-600/30 rounded-lg text-slate-400 transition-all duration-200">
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button className="p-2 bg-slate-600/20 hover:bg-slate-600/30 rounded-lg text-slate-400 transition-all duration-200">
                        <History className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Credits Modal */}
      {showAddCredits && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-slate-700">
            <h3 className="text-xl font-bold text-slate-50 mb-6">
              Add Credits to {selectedUser.name}
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  AI Credits
                </label>
                <input
                  type="number"
                  value={creditAmount.ai}
                  onChange={(e) => setCreditAmount(prev => ({ ...prev, ai: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-50 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
                  placeholder="Enter AI credits to add"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Workflow Credits
                </label>
                <input
                  type="number"
                  value={creditAmount.workflow}
                  onChange={(e) => setCreditAmount(prev => ({ ...prev, workflow: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                  placeholder="Enter workflow credits to add"
                />
              </div>
            </div>
            
            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => {
                  setShowAddCredits(false);
                  setSelectedUser(null);
                  setCreditAmount({ ai: 0, workflow: 0 });
                }}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-300 font-semibold transition-all duration-200"
              >
                Cancel
              </button>
              
              <button
                onClick={() => addCredits(selectedUser.id, creditAmount.ai, creditAmount.workflow)}
                className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white font-semibold transition-all duration-200"
              >
                Add Credits
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
