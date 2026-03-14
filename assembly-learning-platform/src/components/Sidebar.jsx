import React from 'react';
import { BookOpen, Cpu, Target } from 'lucide-react';

const Sidebar = ({ challenges, activeChallengeId, onSelectChallenge }) => {
  const activeChallenge = challenges.find(c => c.id === activeChallengeId);

  return (
    <div className="bg-slate-900 border-r border-slate-800 w-80 h-full flex flex-col text-slate-300">
      <div className="p-6 border-b border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400">
            <Cpu className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Assembly Simulator</h1>
        </div>
        <p className="text-xs text-slate-500">Learn low-level execution interactively.</p>
      </div>

      {/* Challenge List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Select Challenge</div>
        <div className="px-4 space-y-2">
          {challenges.map(c => (
            <button
              key={c.id}
              onClick={() => onSelectChallenge(c.id)}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeChallengeId === c.id ? 'bg-indigo-600/10 text-indigo-300 border border-indigo-500/30' : 'hover:bg-slate-800 text-slate-400 border border-transparent'}`}
            >
              <Target className={`w-4 h-4 ${activeChallengeId === c.id ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span className="text-sm font-medium truncate">{c.title}</span>
            </button>
          ))}
        </div>

        {/* Challenge Description */}
        {activeChallenge && (
          <div className="mt-8 px-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-4">
               <BookOpen className="w-4 h-4" /> Mission Details
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl text-sm leading-relaxed text-slate-300">
              {activeChallenge.description}
            </div>
          </div>
        )}
        
        {/* Quick Reference */}
        <div className="mt-8 px-6 mb-8">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Command Reference</div>
            <div className="space-y-3 text-xs">
              <div className="bg-slate-800/30 p-2 rounded border border-slate-800"><span className="text-emerald-400 font-mono font-bold">MOV dest, src</span><br/><span className="text-slate-500">Moves value from src to dest.</span></div>
              <div className="bg-slate-800/30 p-2 rounded border border-slate-800"><span className="text-emerald-400 font-mono font-bold">ADD dest, val</span><br/><span className="text-slate-500">Adds val to dest register.</span></div>
              <div className="bg-slate-800/30 p-2 rounded border border-slate-800"><span className="text-emerald-400 font-mono font-bold">SUB dest, val</span><br/><span className="text-slate-500">Subtracts val from dest.</span></div>
              <div className="bg-slate-800/30 p-2 rounded border border-slate-800"><span className="text-emerald-400 font-mono font-bold">CMP reg, val</span><br/><span className="text-slate-500">Compares reg to val, setting Z/N flags.</span></div>
              <div className="bg-slate-800/30 p-2 rounded border border-slate-800"><span className="text-emerald-400 font-mono font-bold">JMP / JE / JNE</span><br/><span className="text-slate-500">Jumps to LABEL (Unconditional, Equal, Not Equal).</span></div>
            </div>
        </div>

      </div>

    </div>
  );
};

export default Sidebar;
