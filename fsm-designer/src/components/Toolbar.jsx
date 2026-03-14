import React from 'react';
import { MousePointer2, CircleDashed, ArrowUpRight, Trash2, CheckSquare, Flag, Save, FolderOpen } from 'lucide-react';
import { PRESETS } from '../data/presets';

const TOOLS = [
  { id: 'select', icon: MousePointer2, label: 'Select / Drag Node' },
  { id: 'state', icon: CircleDashed, label: 'Add New State' },
  { id: 'transition', icon: ArrowUpRight, label: 'Add Transition' },
  { id: 'delete', icon: Trash2, label: 'Delete Element' },
  { id: 'toggleAccept', icon: CheckSquare, label: 'Toggle Accept State' },
  { id: 'setStart', icon: Flag, label: 'Set Start State' }
];

const Toolbar = ({ activeTool, setActiveTool, onLoadPreset }) => {

  const handleExport = () => {
    // Basic export hook (JSON)
    alert("In a full build, this would trigger a download of the current FSM JSON.");
  };

  return (
    <div className="bg-slate-800 p-4 border-b border-slate-700 flex items-center justify-between shadow-md">
       <div className="flex items-center gap-6">
         <h1 className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
           FSM Designer
         </h1>
         
         {/* Build Tools */}
         <div className="flex items-center gap-1 bg-slate-900/50 p-1 rounded-lg border border-slate-700/50">
           {TOOLS.map(t => {
             const Icon = t.icon;
             return (
               <button
                 key={t.id}
                 onClick={() => setActiveTool(t.id)}
                 title={t.label}
                 className={`p-2 rounded transition-colors ${activeTool === t.id ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}
               >
                 <Icon className="w-5 h-5" />
               </button>
             );
           })}
         </div>

         {/* Presets Dropdown */}
         <div className="ml-4">
           <select 
             onChange={(e) => {
               if(e.target.value !== "") {
                  onLoadPreset(PRESETS[parseInt(e.target.value)].fsm);
                  e.target.value = "";
               }
             }}
             className="bg-slate-900 border border-slate-700 text-sm text-slate-300 px-3 py-2 rounded outline-none focus:border-primary-500"
           >
             <option value="">Load Challenge Preset...</option>
             {PRESETS.map((p, i) => (
               <option key={i} value={i}>{p.name}</option>
             ))}
           </select>
         </div>
       </div>

       {/* Utilities */}
       <div className="flex items-center gap-2">
         <button className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 transition-colors">
            <FolderOpen className="w-4 h-4" /> Load
         </button>
         <button onClick={handleExport} className="flex items-center gap-2 text-sm font-semibold text-white px-3 py-2 rounded bg-primary-600 hover:bg-primary-500 transition-colors shadow-lg">
            <Save className="w-4 h-4" /> Export JSON
         </button>
       </div>
    </div>
  );
};

export default Toolbar;
