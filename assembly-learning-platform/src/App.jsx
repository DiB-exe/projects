import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import CodeWorkspace from './components/CodeWorkspace';
import ExecutionConsole from './components/ExecutionConsole';
import CpuSimulator from './engine/CpuSimulator';
import { challenges } from './data/challenges';

// Instantiate external to prevent recreating on re-renders,
// though React state holds the snapshot
const cpu = new CpuSimulator();

function App() {
  const [activeChallengeId, setActiveChallengeId] = useState(challenges[0].id);
  const [code, setCode] = useState(challenges[0].initialCode);
  
  // Holds the evaluated output { registers, flags, error, assertion }
  const [snapshot, setSnapshot] = useState(null);

  // When challenge changes, reset view
  useEffect(() => {
    const active = challenges.find(c => c.id === activeChallengeId);
    if (active) {
      // eslint-disable-next-line
      setCode(active.initialCode);
      setSnapshot(null); // Clear previous runs
    }
  }, [activeChallengeId]);

  const handleRun = () => {
    const active = challenges.find(c => c.id === activeChallengeId);
    
    // Parse user code
    cpu.parse(code);
    
    // Execute up to 1000 instructions
    const result = cpu.executeAll(1000);
    
    // Check against challenge assertion if no runtime error occurred
    let assertionResult = null;
    if (!result.error && active && active.assert) {
      assertionResult = active.assert(result.registers);
    }

    setSnapshot({
      ...result,
      assertion: assertionResult
    });
  };

  return (
    <div className="h-screen w-full bg-[#030712] text-slate-200 overflow-hidden flex font-sans">
      
      {/* Absolute background effects */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none z-0"></div>

      <Sidebar 
        challenges={challenges} 
        activeChallengeId={activeChallengeId} 
        onSelectChallenge={setActiveChallengeId} 
      />

      {/* Main Work Area */}
      <main className="flex-1 flex flex-col p-6 gap-6 relative z-10">
        
        {/* Top chunk: Editor */}
        <div className="flex-1 min-h-[50%]">
          <CodeWorkspace code={code} setCode={setCode} onRun={handleRun} />
        </div>

        {/* Bottom chunk: Console */}
        <div className="h-1/3 min-h-[250px]">
          <ExecutionConsole snapshot={snapshot} />
        </div>

      </main>

    </div>
  );
}

export default App;
