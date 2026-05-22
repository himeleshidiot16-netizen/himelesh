import React from "react";
import { Database, AlertCircle } from "lucide-react";
import { DbConfig } from "../types";

interface DbIndicatorProps {
  config: DbConfig | null;
  loading: boolean;
  onRefresh: () => void;
}

export const DbIndicator: React.FC<DbIndicatorProps> = ({ config, loading, onRefresh }) => {
  if (loading) {
    return (
      <div className="flex items-center gap-2 p-3 bg-zinc-900/50 rounded-md border border-zinc-800 animate-pulse">
        <Database className="w-4 h-4 text-zinc-600 animate-spin" />
        <span className="text-xs font-mono text-zinc-500">Checking system...</span>
      </div>
    );
  }

  if (!config) {
    return (
      <button 
        onClick={onRefresh}
        className="w-full flex items-center justify-between p-3.5 bg-red-950/20 rounded-md border border-red-900/30 hover:bg-zinc-805 transition text-left"
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
          </span>
          <span className="text-xs font-mono text-red-400">Offline Error</span>
        </div>
        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
      </button>
    );
  }

  const isDb = config.mode === "database";
  const isConnected = config.connected;
  const isError = !!config.error;

  let dotColor = "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]";
  let pingColor = "bg-yellow-400";
  let statusText = "Memory Storage";
  let hoverBg = "hover:bg-zinc-805";
  let borderColor = "border-zinc-800";

  if (isDb && isConnected) {
    dotColor = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]";
    pingColor = "bg-emerald-400";
    statusText = "Database Live";
    hoverBg = "hover:bg-zinc-805";
    borderColor = "border-zinc-800";
  } else if (isError) {
    dotColor = "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]";
    pingColor = "bg-red-400";
    statusText = "Database Down";
    hoverBg = "hover:bg-zinc-805";
    borderColor = "border-zinc-800";
  }

  return (
    <button
      onClick={onRefresh}
      className={`w-full group flex flex-col gap-1.5 p-3.5 bg-zinc-900/30 rounded-md border ${borderColor} ${hoverBg} transition text-left`}
      title="Click to re-verify connectivity"
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pingColor} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`}></span>
          </span>
          <span className="text-xs font-semibold font-display text-zinc-300 group-hover:text-zinc-100 transition">
            {statusText}
          </span>
        </div>
        <Database className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-400 transition" />
      </div>
      <div className="text-[10px] font-mono text-zinc-500 truncate" title={config.dbName}>
        {isDb ? `Coll: ${config.dbName}` : "In-Memory Engine"}
      </div>
      {config.error && (
        <span className="text-[9px] font-mono text-red-400 mt-1 line-clamp-1 border-t border-red-950/50 pt-1">
          {config.error}
        </span>
      )}
    </button>
  );
};
