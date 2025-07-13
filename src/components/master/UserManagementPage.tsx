import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  UserPlus,
  Mail,
  Activity,
  Ban,
  CheckCircle,
  AlertCircle,
  Edit3
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  last_login: string;
  status: 'active' | 'inactive' | 'suspended';
  role: 'user' | 'admin' | 'premium';
  workflow_count: number;
  ai_usage: number;
  subscription_tier: string;
}

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');

  // Mock data
  const mockUsers: User[] = [
    {
      id: '1',
      email: 'john@example.com',
      name: 'John Doe',
      created_at: '2024-01-15T10:30:00Z',
      last_login: '2024-03-10T14:22:00Z',
      status: 'active',
      role: 'premium',
      workflow_count: 15,
      ai_usage: 850,
      subscription_tier: 'Premium'
    },
    {
      id: '2',
      email: 'sarah@example.com',
      name: 'Sarah Wilson',
      created_at: '2024-02-01T09:15:00Z',
      last_login: '2024-03-09T16:45:00Z',
      status: 'active',
      role: 'user',
      workflow_count: 8,
      ai_usage: 425,
      subscription_tier: 'Free'
    },
    {
      id: '3',
      email: 'mike@example.com',
      name: 'Mike Johnson',
      created_at: '2024-02-20T11:20:00Z',
      last_login: '2024-03-05T08:30:00Z',
      status: 'inactive',
      role: 'user',
      workflow_count: 3,
      ai_usage: 200,
      subscription_tier: 'Free'
    }
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // TODO: Load from Supabase users table
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUsers(mockUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-400 bg-emerald-400/10';
      case 'inactive': return 'text-amber-400 bg-amber-400/10';
      case 'suspended': return 'text-red-400 bg-red-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-purple-400 bg-purple-400/10';
      case 'premium': return 'text-amber-400 bg-amber-400/10';
      case 'user': return 'text-slate-400 bg-slate-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700/30">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/20">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-50">User Management</h1>
            <p className="text-slate-400">Manage all platform users and their permissions</p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-slate-300">Total Users</span>
            </div>
            <p className="text-2xl font-bold text-slate-50">{users.length}</p>
          </div>
          
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-slate-300">Active Users</span>
            </div>
            <p className="text-2xl font-bold text-slate-50">
              {users.filter(u => u.status === 'active').length}
            </p>
          </div>
          
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-slate-300">Premium Users</span>
            </div>
            <p className="text-2xl font-bold text-slate-50">
              {users.filter(u => u.role === 'premium').length}
            </p>
          </div>
          
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-slate-300">Suspended</span>
            </div>
            <p className="text-2xl font-bold text-slate-50">
              {users.filter(u => u.status === 'suspended').length}
            </p>
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
              className="w-full pl-12 pr-6 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-50 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            
            <button className="flex items-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold transition-all duration-200">
              <UserPlus className="w-4 h-4" />
              <span>Add User</span>
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
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Role</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Status</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Usage</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Joined</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-300">Last Login</th>
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
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="text-sm text-slate-300">
                        {user.workflow_count} workflows
                      </div>
                      <div className="text-sm text-slate-400">
                        {user.ai_usage.toLocaleString()} AI tokens
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-slate-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-slate-400">
                      {new Date(user.last_login).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg text-blue-400 transition-all duration-200">
                        <Mail className="w-4 h-4" />
                      </button>
                      
                      <button className="p-2 bg-slate-600/20 hover:bg-slate-600/30 rounded-lg text-slate-400 transition-all duration-200">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      
                      <button className="p-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg text-red-400 transition-all duration-200">
                        <Ban className="w-4 h-4" />
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
