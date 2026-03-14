import React from 'react';
import { Cpu, Terminal, CheckCircle2, XCircle } from 'lucide-react';

const ExecutionConsole = ({ snapshot }) => {
  if (!snapshot) {
    return (
      <div className="bg-slate-900 border border-slate-700/50 p-6 rounded-xl shadow-lg h-full flex flex-col justify-center items-center text-slate-500">
         <Cpu className="w-12 h-12 mb-4 opacity-50" />
         <p>Click "Run Code" to execute instructions.</p>
      </div>
    );
  }

  const { registers, flags, error, assertion } = snapshot;

  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-xl shadow-lg h-full flex flex-col overflow-hidden">
      <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-700 flex items-center gap-2">
         <Terminal className="w-4 h-4 text-emerald-400" />
         <h3 className="text-sm font-bold text-white tracking-wide">Execution Snapshot</h3>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto space-y-6">
        
        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm font-mono break-words">
            &gt; {error}
          </div>
        )}

        {/* Registers Grid */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Registers</h4>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(registers || {}).map(([reg, val]) => (
              <div key={reg} className="bg-slate-800 border border-slate-700 rounded-lg p-3 flex flex-col items-center justify-center relative overflow-hidden group">
                <span className="text-[10px] text-slate-500 font-bold mb-1">{reg}</span>
                <span className="text-xl font-mono text-emerald-300 group-hover:scale-110 transition-transform">{val}</span>
                <div className="absolute inset-0 border-2 border-emerald-500/0 group-hover:border-emerald-500/20 rounded-lg transition-colors pointer-events-none"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Flags */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Status Flags</h4>
          <div className="flex gap-4">
            <div className={`px-4 py-2 rounded-lg border font-mono text-sm ${flags?.Z ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
              <span className="mr-2">Z (Zero)</span>: {flags?.Z || 0}
            </div>
            <div className={`px-4 py-2 rounded-lg border font-mono text-sm ${flags?.N ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
              <span className="mr-2">N (Negative)</span>: {flags?.N || 0}
            </div>
          </div>
        </div>

        {/* Challenge Assertion Output */}
        {assertion && (
          <div className={`mt-6 p-4 rounded-xl border ${assertion.pass ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'} flex items-start gap-3`}>
             {assertion.pass ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
             <div>
                <h4 className={`text-sm font-bold ${assertion.pass ? 'text-emerald-400' : 'text-rose-400'}`}>
                  Test Result: {assertion.pass ? 'Passed' : 'Failed'}
                </h4>
                <p className="text-xs text-slate-300 mt-1">{assertion.message}</p>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ExecutionConsole;
