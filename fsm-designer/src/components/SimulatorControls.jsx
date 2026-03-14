import React, { useState, useEffect } from 'react';
import { Play, Pause, StepForward, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';

const SimulatorControls = ({ fsm, onStepUpdate, evaluation }) => {
  const [inputString, setInputString] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Stop playing if evaluation changes or string resets
  useEffect(() => {
    setIsPlaying(false);
    setCurrentStep(0);
    onStepUpdate(null);
  }, [fsm, inputString, onStepUpdate]);

  useEffect(() => {
    let timer;
    if (isPlaying && evaluation?.trace) {
      if (currentStep < evaluation.trace.length) {
        timer = setTimeout(() => {
          onStepUpdate(evaluation.trace[currentStep]);
          setCurrentStep(c => c + 1);
        }, 800);
      } else {
        setIsPlaying(false);
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, evaluation, onStepUpdate]);

  const handleStepForward = () => {
    if (evaluation?.trace && currentStep < evaluation.trace.length) {
      onStepUpdate(evaluation.trace[currentStep]);
      setCurrentStep(c => c + 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    onStepUpdate(null);
  };

  const statusColor = () => {
    if (!evaluation) return 'text-slate-400';
    if (currentStep < evaluation.trace?.length) return 'text-blue-400';
    return evaluation.isAccepted ? 'text-emerald-400' : 'text-rose-400';
  };

  const statusMessage = () => {
    if (!evaluation) return 'Enter input to evaluate';
    if (currentStep < evaluation.trace?.length) return `Evaluating step ${currentStep + 1} of ${evaluation.trace.length}`;
    if (evaluation.isAccepted) return '✅ Sequence Accepted';
    return `❌ Sequence Rejected: ${evaluation.status}`;
  };

  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 w-full mb-4 shadow-lg">
      <div className="flex items-center gap-4">
        
        {/* Input String */}
        <div className="flex-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 block">
             Input Sequence
          </label>
          <input 
             type="text" 
             value={inputString}
             onChange={(e) => setInputString(e.target.value)}
             placeholder="e.g. 0110"
             className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-2 rounded-lg outline-none focus:border-primary-500 font-mono"
          />
        </div>

        {/* Controls */}
        <div className="flex items-end pb-1 gap-2">
           <button 
             onClick={handleReset}
             className="p-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors"
             title="Reset Simulation"
           >
             <RotateCcw className="w-5 h-5" />
           </button>
           <button 
             onClick={handleStepForward}
             disabled={!evaluation || currentStep >= evaluation.trace?.length || isPlaying}
             className="p-2.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-slate-300 transition-colors"
             title="Step Forward"
           >
             <StepForward className="w-5 h-5" />
           </button>
           <button 
             onClick={() => setIsPlaying(!isPlaying)}
             disabled={!evaluation || currentStep >= evaluation.trace?.length}
             className="p-2.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
             title={isPlaying ? "Pause" : "Play"}
           >
             {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
           </button>
        </div>
      </div>

      {/* Playback Status Bar */}
      <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
         <div className="flex gap-1 overflow-x-auto max-w-[60%] font-mono text-lg">
            {inputString.split('').map((char, idx) => (
              <span 
                key={idx} 
                className={`w-8 h-8 flex items-center justify-center rounded ${
                  idx < currentStep 
                    ? 'bg-primary-500/20 text-primary-300 border border-primary-500/50' 
                    : idx === currentStep && isPlaying
                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 scale-110 shadow-lg'
                    : 'bg-slate-900 border border-slate-700 text-slate-500'
                } transition-all`}
              >
                {char}
              </span>
            ))}
         </div>
         <div className={`text-sm font-semibold flex items-center gap-2 ${statusColor()}`}>
            {evaluation?.isAccepted && currentStep >= evaluation.trace?.length ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {statusMessage()}
         </div>
      </div>
    </div>
  );
};

export default SimulatorControls;
