import React, { useState, useEffect } from 'react';
import Converter from './components/Converter';
import ALUControls from './components/ALUControls';
import ALUVisualizer from './components/ALUVisualizer';
import { performALUOperation } from './utils/aluLogic';
import { Calculator } from 'lucide-react';

function App() {
  const [aNum, setANum] = useState(null);
  const [bNum, setBNum] = useState(null);
  const [bits, setBits] = useState(8);
  const [op, setOp] = useState('ADD');

  const [resultObj, setResultObj] = useState(null);

  useEffect(() => {
    setResultObj(performALUOperation(op, aNum, bNum, bits));
  }, [aNum, bNum, op, bits]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* Background ambient light */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none z-0"></div>

      <div className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white/5 border border-white/10 rounded-2xl mb-4 shadow-2xl shadow-indigo-500/20 backdrop-blur-xl">
            <Calculator className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-indigo-400 mb-4 tracking-tight">ALU Simulator</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">Hardware-level binary calculator and radix converter featuring live execution, flag registers, and two's complement arithmetic mapping.</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 space-y-8 flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 align-stretch">
              <Converter label="Operand A" numValue={aNum} onChangeNum={setANum} bits={bits} />
              <Converter label="Operand B" numValue={bNum} onChangeNum={setBNum} bits={bits} />
            </div>

            <div className="flex-1">
              <ALUVisualizer op={op} aNum={aNum} bNum={bNum} bits={bits} resultObj={resultObj} />
            </div>
          </div>

          <div className="lg:col-span-4 h-full">
            <ALUControls op={op} setOp={setOp} bits={bits} setBits={setBits} />
          </div>

        </main>
        
        <footer className="mt-20 text-center text-slate-500 text-sm">
          Built with React & Tailwind CSS. Designed for educational purposes to visualize Arithmetic Logic Unit functions.
        </footer>
      </div>
    </div>
  );
}

export default App;
