import React from 'react';
import { formatValue } from '../utils/converterLogic';

const FlagRegister = ({ flags }) => {
  const flagsConfig = [
    { label: 'Z', tooltip: 'Zero', value: flags.z },
    { label: 'C', tooltip: 'Carry', value: flags.c },
    { label: 'V', tooltip: 'Overflow', value: flags.v },
    { label: 'N', tooltip: 'Negative', value: flags.n },
  ];

  return (
    <div className="flex gap-4">
      {flagsConfig.map(flag => (
        <div key={flag.label} className="flex flex-col items-center group cursor-help">
          <span className="text-xs font-mono text-slate-400 mb-1">{flag.label}</span>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-inner transition-colors duration-300 ${flag.value ? 'bg-green-500/20 text-green-400 border border-green-500' : 'bg-slate-800 text-slate-600 border border-slate-700'}`}>
            {flag.value ? '1' : '0'}
          </div>
          <div className="absolute opacity-0 group-hover:opacity-100 mt-16 px-2 py-1 bg-black text-xs text-white rounded transition-opacity pointer-events-none whitespace-nowrap z-10">
            {flag.tooltip}
          </div>
        </div>
      ))}
    </div>
  );
};

const ALUVisualizer = ({ op, aNum, bNum, bits, resultObj }) => {

  const formatBin = (val) => {
    if (val === null || val === undefined) return '-'.repeat(bits);
    return formatValue(val, 'bin', bits);
  };

  const strA = formatBin(aNum);
  const strB = formatBin(bNum);
  const strRes = formatBin(resultObj?.result);

  const isUnary = op === 'NOT';

  // Function to render bit wise characters with monospace alignment
  const renderBits = (str, label, isResult = false) => (
    <div className="flex items-center mb-1">
      <span className="w-12 text-slate-400 font-bold text-lg font-mono">{label}</span>
      <div className="flex flex-1 justify-end font-mono tracking-[0.5em] text-xl overflow-x-auto text-right">
        <span className={`${isResult ? 'text-green-400 font-bold' : 'text-slate-200'}`}>
          {str}
        </span>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-900 border border-slate-700/50 p-6 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] ring-1 ring-white/5 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

      <div className="flex justify-between items-start mb-8 relative z-10">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight mb-1 flex items-center gap-2">
            ALU Visualizer <span className="text-xs font-mono bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">OP: {op}</span>
          </h3>
          <p className="text-sm text-slate-400">Step-by-step binary execution</p>
        </div>
        {resultObj && <FlagRegister flags={resultObj.flags} />}
      </div>

      <div className="bg-slate-950 p-6 rounded-lg border border-slate-800 shadow-inner relative z-10 font-mono flex flex-col items-center">
        
        <div className="w-full max-w-2xl mx-auto flex flex-col">
          {renderBits(strA, isUnary ? ' A' : ' A')}
          {!isUnary && renderBits(strB, ` ${op === 'ADD' ? '+' : op === 'SUB' ? '-' : op === 'AND' ? '&' : op === 'OR' ? '|' : op === 'XOR' ? '^' : op}`)}
          
          <div className="w-full h-px bg-slate-700 my-4 shadow-[0_1px_0_rgba(255,255,255,0.05)]"></div>
          
          {renderBits(strRes, ' R', true)}
          
        </div>

      </div>
      
      {/* Additional math representation for ease of reading */}
      <div className="mt-6 flex justify-center text-slate-500 font-mono text-sm gap-2 bg-slate-800/50 py-2 rounded">
          <span>{aNum ?? '?'}</span>
          <span className="font-bold text-slate-400">{op}</span>
          {!isUnary && <span>{bNum ?? '?'}</span>}
          <span>=</span>
          <span className="text-slate-300 font-bold">{resultObj ? resultObj.result : '?'}</span>
          <span className="ml-4 opacity-50">Width: {bits}-bit</span>
      </div>
    </div>
  );
};

export default ALUVisualizer;
