import React, { useState, useRef } from 'react';
import SignalEditor from './components/SignalEditor';
import TimingDiagramSVG from './components/TimingDiagramSVG';
import ExportToolbar from './components/ExportToolbar';
import { Activity } from 'lucide-react';

function App() {
  const [signals, setSignals] = useState([
    { id: 'sig_1', name: 'CLK', type: 'clock', period: 20 },
    { id: 'sig_2', name: 'ENABLE', type: 'data', transitions: [{time:0, val:1}, {time:80, val:0}] },
    { id: 'sig_3', name: 'DATA_IN', type: 'data', transitions: [{time:0, val:0}, {time:28, val:1}, {time:50, val:0}, {time:62, val:1}] } // Example intentional violation at time 62 logic (setup violation for edge 60)
  ]);
  
  const [maxTime, setMaxTime] = useState(100);
  const svgRef = useRef(null);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-200">
      
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
               <Activity className="w-5 h-5" />
             </div>
             <h1 className="text-xl font-black text-slate-800 tracking-tight">Timing Diagram Viewer</h1>
          </div>
          <ExportToolbar svgRef={svgRef} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column: Editor */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Simulation Max Time</label>
             <input 
               type="number" 
               value={maxTime} 
               onChange={(e) => setMaxTime(Number(e.target.value) || 100)}
               className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
             />
             <p className="text-xs text-slate-400 mt-2">Sets the horizontal window of the diagram.</p>
          </div>
          
          <div className="flex-1">
             <SignalEditor signals={signals} setSignals={setSignals} maxTime={maxTime} />
          </div>
        </div>

        {/* Right Column: Visualizer */}
        <div className="lg:col-span-3">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
             <h2 className="text-lg font-bold text-slate-800 mb-6 flex justify-between items-center">
                Generated Waveform
                <span className="text-xs font-normal text-slate-500 bg-slate-100 px-3 py-1 rounded-full">SVG Powered</span>
             </h2>
             
             <div className="flex-1 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50 p-4 overflow-hidden flex items-center justify-center">
                {signals.length === 0 ? (
                  <div className="text-center text-slate-400">
                     <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                     <p>Add signals to generate a timing diagram</p>
                  </div>
                ) : (
                  <TimingDiagramSVG signals={signals} maxTime={maxTime} svgRef={svgRef} />
                )}
             </div>
             
             <div className="mt-6 flex gap-4 text-xs text-slate-500">
               <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-100 border border-red-500 rounded"></span> Setup/Hold Violation (2t threshold)</div>
               <div className="flex items-center gap-2"><span className="w-3 h-1 bg-indigo-600 rounded"></span> Clock Edge Target</div>
             </div>
          </div>
        </div>

      </main>

    </div>
  );
}

export default App;
