import React from 'react';
import { 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  ExternalLink,
  Calendar,
  Tag,
  Zap,
  CheckCircle,
  Clock,
  MoreVertical
} from 'lucide-react';
import { N8nWorkflow } from '../services/n8nService';

interface WorkflowListProps {
  workflows: N8nWorkflow[];
  onAction: (workflowId: string, action: 'activate' | 'deactivate' | 'delete' | 'edit' | 'view') => void;
  baseUrl?: string;
}

export const WorkflowList: React.FC<WorkflowListProps> = ({ workflows, onAction, baseUrl }) => {
  const getStatusColor = (workflow: N8nWorkflow) => {
    if (workflow.active) {
      return 'text-emerald-500';
    }
    return 'text-slate-400';
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
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getNodeCount = (workflow: N8nWorkflow) => {
    return workflow.nodes?.length || 0;
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-700/50 bg-slate-900/50">
        <div className="col-span-4 text-sm font-medium text-slate-300">Workflow</div>
        <div className="col-span-2 text-sm font-medium text-slate-300">Status</div>
        <div className="col-span-1 text-sm font-medium text-slate-300">Nodes</div>
        <div className="col-span-2 text-sm font-medium text-slate-300">Tags</div>
        <div className="col-span-2 text-sm font-medium text-slate-300">Last Updated</div>
        <div className="col-span-1 text-sm font-medium text-slate-300">Actions</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-slate-700/50">
        {workflows.map((workflow) => (
          <div
            key={workflow.id}
            className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-slate-700/20 transition-colors duration-200 group"
          >
            {/* Workflow Name */}
            <div className="col-span-4 min-w-0">
              <h3 className="text-slate-50 font-medium truncate group-hover:text-indigo-300 transition-colors duration-200">
                {workflow.name || 'Untitled Workflow'}
              </h3>
              <p className="text-sm text-slate-400 truncate">ID: {workflow.id}</p>
            </div>

            {/* Status */}
            <div className="col-span-2 flex items-center">
              <div className={`flex items-center space-x-2 ${getStatusColor(workflow)}`}>
                {getStatusIcon(workflow)}
                <span className="text-sm font-medium">
                  {workflow.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Node Count */}
            <div className="col-span-1 flex items-center">
              <div className="flex items-center space-x-1 text-sm text-slate-300">
                <Zap className="w-4 h-4 text-indigo-400" />
                <span>{getNodeCount(workflow)}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="col-span-2 flex items-center">
              <div className="flex flex-wrap gap-1">
                {workflow.tags && workflow.tags.length > 0 ? (
                  <>
                    {workflow.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center space-x-1 px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-lg"
                      >
                        <Tag className="w-3 h-3" />
                        <span>{typeof tag === 'string' ? tag : 'Tag'}</span>
                      </span>
                    ))}
                    {workflow.tags.length > 2 && (
                      <span className="inline-flex items-center px-2 py-1 bg-slate-700/50 text-slate-400 text-xs rounded-lg">
                        +{workflow.tags.length - 2}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-sm text-slate-500">No tags</span>
                )}
              </div>
            </div>

            {/* Last Updated */}
            <div className="col-span-2 flex items-center">
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(workflow.updatedAt)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="col-span-1 flex items-center justify-end">
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => onAction(workflow.id, workflow.active ? 'deactivate' : 'activate')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    workflow.active
                      ? 'hover:bg-amber-500/10 text-amber-400 hover:text-amber-300'
                      : 'hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300'
                  }`}
                  title={workflow.active ? 'Deactivate' : 'Activate'}
                >
                  {workflow.active ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>
                
                <button
                  onClick={() => onAction(workflow.id, 'edit')}
                  className="p-2 hover:bg-slate-600/50 text-slate-400 hover:text-slate-200 rounded-lg transition-all duration-200"
                  title="Edit in n8n"
                >
                  <Edit className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => onAction(workflow.id, 'view')}
                  className="p-2 hover:bg-slate-600/50 text-slate-400 hover:text-slate-200 rounded-lg transition-all duration-200"
                  title="View Executions"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>

                {/* More Actions Dropdown */}
                <div className="relative group/menu">
                  <button className="p-2 hover:bg-slate-600/50 text-slate-400 hover:text-slate-200 rounded-lg transition-all duration-200">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  <div className="absolute right-0 top-full mt-1 w-40 bg-slate-800 border border-slate-600 rounded-xl shadow-xl z-10 opacity-0 group-hover/menu:opacity-100 pointer-events-none group-hover/menu:pointer-events-auto transition-all duration-200">
                    <div className="p-1">
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
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {workflows.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">No workflows found</p>
        </div>
      )}
    </div>
  );
};