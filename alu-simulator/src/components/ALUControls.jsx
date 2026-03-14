import React from 'react';
import { Cpu, Settings2 } from 'lucide-react';

const ALUControls = ({ op, setOp, bits, setBits }) => {
  const operations = ['ADD', 'SUB', 'AND', 'OR', 'XOR', 'NOT', 'LSL', 'LSR', 'ASR'];
  const bitWidths = [4, 8, 16, 32];

  return (
    <div className="bg-slate-900 border border-slate-700/50 p-5 rounded-xl shadow-lg ring-1 ring-white/5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6 text-white">
        <Cpu className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-bold">ALU Settings</h3>
      </div>
      
      <div className="mb-6 flex-1">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Settings2 className="w-4 h-4" /> Bit Width
        </label>
        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
          {bitWidths.map(b => (
            <button
              key={b}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${bits === b ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
              onClick={() => setBits(b)}
            >
              {b}-bit
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Operation</label>
        <div className="grid grid-cols-3 gap-2">
          {operations.map(o => (
            <button
              key={o}
              className={`py-2 text-sm font-bold rounded border transition-all ${op === o ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-500 hover:text-white'}`}
              onClick={() => setOp(o)}
            >
              {o}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ALUControls;
