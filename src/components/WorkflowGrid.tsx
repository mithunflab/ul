import React from 'react';
import { 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  MoreVertical, 
  ExternalLink,
  Clock,
  Calendar,
  Tag,
  Zap,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { N8nWorkflow } from '../services/n8nService';

interface WorkflowGridProps {
  workflows: N8nWorkflow[];
  onAction: (workflowId: string, action: 'activate' | 'deactivate' | 'delete' | 'edit' | 'view') => void;
  baseUrl?: string;
}

export const WorkflowGrid: React.FC<WorkflowGridProps> = ({ workflows, onAction, baseUrl }) => {
  const getStatusColor = (workflow: N8nWorkflow) => {
    if (workflow.active) {
      return 'text-emerald-500 bg-emerald-500/10';
    }
    return 'text-slate-400 bg-slate-400/10';
  };

  const getStatusIcon = (workflow: N8nWorkflow) => {
    if (workflow.active) {
      return <CheckCircle className="w-4 h-4" />;
    }
    return <Pause className="w-4 h-4" />;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getNodeCount = (workflow: N8nWorkflow) => {
    return workflow.nodes?.length || 0;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {workflows.map((workflow) => (
        <div
          key={workflow.id}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-indigo-500/30 transition-all duration-300 group"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-slate-50 truncate group-hover:text-indigo-300 transition-colors duration-200">
                {workflow.name || 'Untitled Workflow'}
              </h3>
              
              {/* Status Badge */}
              <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium mt-2 ${getStatusColor(workflow)}`}>
                {getStatusIcon(workflow)}
                <span>{workflow.active ? 'Active' : 'Inactive'}</span>
              </div>
            </div>

            {/* Actions Dropdown */}
            <div className="relative group/menu">
              <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100">
                <MoreVertical className="w-4 h-4 text-slate-400" />
              </button>
              
              <div className="absolute right-0 top-full mt-1 w-48 bg-slate-800 border border-slate-600 rounded-xl shadow-xl z-10 opacity-0 group-hover/menu:opacity-100 pointer-events-none group-hover/menu:pointer-events-auto transition-all duration-200">
                <div className="p-1">
                  <button
                    onClick={() => onAction(workflow.id, workflow.active ? 'deactivate' : 'activate')}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors duration-200"
                  >
                    {workflow.active ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>Deactivate</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Activate</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => onAction(workflow.id, 'edit')}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors duration-200"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit in n8n</span>
                  </button>
                  
                  <button
                    onClick={() => onAction(workflow.id, 'view')}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors duration-200"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View Executions</span>
                  </button>
                  
                  <div className="h-px bg-slate-600 my-1"></div>
                  
                  <button
                    onClick={() => onAction(workflow.id, 'delete')}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Workflow Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-2 text-sm">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span className="text-slate-400">Nodes:</span>
              <span className="text-slate-200 font-medium">{getNodeCount(workflow)}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span className="text-slate-400">Updated:</span>
              <span className="text-slate-200 font-medium">{formatDate(workflow.updatedAt)}</span>
            </div>
          </div>

          {/* Tags */}
          {workflow.tags && workflow.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {workflow.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center space-x-1 px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-lg"
                >
                  <Tag className="w-3 h-3" />
                  <span>{typeof tag === 'string' ? tag : 'Tag'}</span>
                </span>
              ))}
              {workflow.tags.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 bg-slate-700/50 text-slate-400 text-xs rounded-lg">
                  +{workflow.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex items-center space-x-2 pt-4 border-t border-slate-700/50">
            <button
              onClick={() => onAction(workflow.id, workflow.active ? 'deactivate' : 'activate')}
              className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                workflow.active
                  ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
              }`}
            >
              {workflow.active ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Start</span>
                </>
              )}
            </button>
            
            <button
              onClick={() => onAction(workflow.id, 'edit')}
              className="flex items-center justify-center p-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-slate-200 rounded-lg transition-all duration-200"
            >
              <Edit className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onAction(workflow.id, 'view')}
              className="flex items-center justify-center p-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-slate-200 rounded-lg transition-all duration-200"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};