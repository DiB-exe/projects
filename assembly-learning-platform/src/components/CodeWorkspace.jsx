import React from 'react';
import Editor from '@monaco-editor/react';

const CodeWorkspace = ({ code, setCode, onRun }) => {
  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700/50 shadow-2xl ring-1 ring-white/5 relative">
      <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-700 flex justify-between items-center backdrop-blur-md">
        <div className="flex gap-2">
           <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
           <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
           <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        </div>
        <span className="text-xs font-mono text-slate-400">assembly-sandbox.asm</span>
        <button 
          onClick={onRun}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        >
          Run Code
        </button>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="assembly"
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            lineHeight: 1.6,
            padding: { top: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
          }}
        />
      </div>
    </div>
  );
};

export default CodeWorkspace;
