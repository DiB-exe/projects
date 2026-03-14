import React from 'react';
import { Plus, Trash2, Clock, Activity } from 'lucide-react';

const SignalEditor = ({ signals, setSignals, maxTime }) => {
  
  const addSignal = (type) => {
    const newId = `sig_${Date.now()}`;
    if (type === 'clock') {
      setSignals([...signals, { id: newId, name: 'CLK', type: 'clock', period: 20 }]);
    } else {
      setSignals([...signals, { id: newId, name: 'DATA', type: 'data', transitions: [{time: 0, val: 0}, {time: 30, val: 1}] }]);
    }
  };

  const removeSignal = (id) => {
    setSignals(signals.filter(s => s.id !== id));
  };

  const updateSignal = (id, updates) => {
    setSignals(signals.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleTransitionsStrChange = (id, str) => {
    // Basic parser for "time:val, time:val"
    try {
      const parts = str.split(',').map(s => s.trim()).filter(s => s);
      const trans = parts.map(p => {
        const [t, v] = p.split(':');
        return { time: Number(t), val: Number(v) };
      }).filter(t => !isNaN(t.time) && !isNaN(t.val));
      
      updateSignal(id, { transitions: trans });
    } catch(e) { /* ignore parse errors while typing */ }
  };

  const toTransitionsStr = (transitions) => {
    if (!transitions) return '';
    return transitions.map(t => `${t.time}:${t.val}`).join(', ');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
      
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          Signal Definitions
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => addSignal('clock')}
            className="flex items-center gap-1 text-xs font-medium bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors"
          >
            <Clock className="w-3 h-3" /> + CLK
          </button>
          <button 
            onClick={() => addSignal('data')}
            className="flex items-center gap-1 text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
          >
            <Activity className="w-3 h-3" /> + DATA
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {signals.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-sm">
            No signals defined. Add a Clock or Data line to begin.
          </div>
        )}

        {signals.map(sig => (
          <div key={sig.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col gap-3 group">
            
            <div className="flex justify-between items-start">
              <input 
                value={sig.name}
                onChange={(e) => updateSignal(sig.id, { name: e.target.value })}
                className="font-bold text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:border-blue-500 focus:outline-none w-1/3"
                placeholder="Signal Name"
              />
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${sig.type === 'clock' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'}`}>
                  {sig.type}
                </span>
                <button 
                  onClick={() => removeSignal(sig.id)}
                  className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {sig.type === 'clock' ? (
              <div className="flex items-center gap-2 text-sm">
                <label className="text-slate-500 text-xs font-medium">Period (T):</label>
                <input 
                  type="number" 
                  value={sig.period}
                  onChange={(e) => updateSignal(sig.id, { period: Number(e.target.value) || 10 })}
                  className="w-20 px-2 py-1 border border-slate-200 rounded text-slate-700 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            ) : (
               <div className="flex flex-col gap-1 text-sm">
                 <label className="text-slate-500 text-xs font-medium">Transitions (time:val):</label>
                 <input 
                   type="text"
                   defaultValue={toTransitionsStr(sig.transitions)}
                   onBlur={(e) => handleTransitionsStrChange(sig.id, e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleTransitionsStrChange(sig.id, e.currentTarget.value)}
                   className="w-full px-2 py-1.5 text-xs font-mono border border-slate-200 rounded text-slate-700 focus:ring-1 focus:ring-blue-500"
                   placeholder="0:0, 10:1, 25:0"
                 />
                 <p className="text-[10px] text-slate-400 mt-1">E.g., 0:0, 20:1, 40:0</p>
               </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SignalEditor;
