//src/components/MidiConsole.tsx

import React, { useEffect, useRef } from 'react';
import { Terminal, Trash2, Wifi, WifiOff, ChevronUp, ChevronDown } from 'lucide-react';

export interface ConsoleLog {
  timestamp: string;
  type: 'system' | 'input-on' | 'input-off' | 'error';
  message: string;
}

interface MidiConsoleProps {
  logs: ConsoleLog[];
  onClear: () => void;
  midiConnected: boolean;
  midiDeviceName: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const MidiConsole: React.FC<MidiConsoleProps> = ({
  logs,
  onClear,
  midiConnected,
  midiDeviceName,
  collapsed,
  onToggleCollapse,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && !collapsed) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, collapsed]);

  const bodyContent = (
    <div
      ref={containerRef}
      className="flex-1 p-3 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
    >
      {logs.length === 0 ? (
        <div className="h-full flex items-center justify-center text-slate-500 italic select-none">
          Console is empty. Play some notes to log MIDI events...
        </div>
      ) : (
        logs.map((log, index) => {
          let typeColor = 'text-purple-400';
          if (log.type === 'input-on') typeColor = 'text-emerald-400 font-medium';
          if (log.type === 'input-off') typeColor = 'text-blue-400';
          if (log.type === 'error') typeColor = 'text-rose-500 font-bold';

          return (
            <div key={index} className="flex gap-2 leading-relaxed hover:bg-slate-900/50 px-1 rounded">
              <span className="text-slate-600 select-none">[{log.timestamp}]</span>
              <span className={`w-16 uppercase select-none ${typeColor}`}>
                {log.type.replace('input-', '')}:
              </span>
              <span className="flex-1 break-all text-slate-300">{log.message}</span>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div className={`bg-slate-950 rounded-xl border border-slate-800/80 shadow-2xl flex flex-col font-mono text-xs text-slate-300 overflow-hidden transition-all duration-200 ${collapsed ? 'h-9' : 'h-60'}`}>
      {/* Console Header */}
      <div className="bg-slate-900 border-b border-slate-800/60 px-4 py-2 flex items-center justify-between select-none cursor-pointer flex-shrink-0 h-9" onClick={onToggleCollapse}>
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-purple-400" />
          <span className="font-semibold text-slate-200">MIDI Event Console</span>
        </div>

        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          {/* MIDI Connection Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800">
            {midiConnected ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-green-400 animate-pulse" />
                <span className="text-[10px] text-green-300 font-medium truncate max-w-[120px]">
                  {midiDeviceName}
                </span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[10px] text-slate-400 font-medium">MIDI Offline</span>
              </>
            )}
          </div>

          <button
            onClick={onClear}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
            title="Clear Console"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onToggleCollapse}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
            title={collapsed ? "Expand Console" : "Collapse Console"}
          >
            {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Console Body */}
      {!collapsed && bodyContent}
    </div>
  );
};
