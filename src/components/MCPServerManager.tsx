// @ts-nocheck
import React from 'react';

// Temporarily disabled MCP Server Manager - needs mcp_servers table in database
export const MCPServerManager: React.FC = () => {
  return (
    <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/50">
      <h3 className="text-lg font-semibold text-slate-50 mb-2">MCP Server Manager</h3>
      <p className="text-slate-400">MCP Server functionality is currently disabled. Database migration needed.</p>
    </div>
  );
};