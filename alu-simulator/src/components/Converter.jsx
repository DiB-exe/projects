import React, { useState, useEffect } from 'react';
import { formatValue, parseValue } from '../utils/converterLogic';

const Converter = ({ label, numValue, onChangeNum, bits }) => {
  const [activeBase, setActiveBase] = useState('dec');
  const [rawText, setRawText] = useState('');

  // Sync external value changes into the active field correctly
  useEffect(() => {
    if (numValue === null) {
      setRawText('');
    } else {
      // only reformat the active base field if it doesn't match the current parsed value
      // (prevents cursor jumping while typing)
      const currentParsed = parseValue(rawText, activeBase);
      if (currentParsed !== numValue) {
        setRawText(formatValue(numValue, activeBase, bits));
      }
    }
  }, [numValue, bits, activeBase]);

  const handleChange = (e, base) => {
    const val = e.target.value;
    setActiveBase(base);
    setRawText(val);
    const parsed = parseValue(val, base);
    if (parsed !== null || val === '') {
      onChangeNum(parsed);
    }
  };

  const getDisplayValue = (base) => {
    if (activeBase === base) return rawText;
    return formatValue(numValue, base, bits);
  };

  const inputClasses = "w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100 font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors";
  const labelClasses = "block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1";

  return (
    <div className="bg-slate-900 border border-slate-700/50 p-5 rounded-xl shadow-lg ring-1 ring-white/5">
      <h3 className="text-lg font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{label}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>Hexadecimal</label>
          <input 
            type="text" 
            className={inputClasses}
            value={getDisplayValue('hex')}
            onChange={(e) => handleChange(e, 'hex')}
            placeholder="0"
          />
        </div>
        <div>
          <label className={labelClasses}>Decimal</label>
          <input 
            type="text" 
            className={inputClasses}
            value={getDisplayValue('dec')}
            onChange={(e) => handleChange(e, 'dec')}
            placeholder="0"
          />
        </div>
        <div>
          <label className={labelClasses}>Octal</label>
          <input 
            type="text" 
            className={inputClasses}
            value={getDisplayValue('oct')}
            onChange={(e) => handleChange(e, 'oct')}
            placeholder="0"
          />
        </div>
        <div>
          <label className={labelClasses}>Binary</label>
          <input 
            type="text" 
            className={inputClasses}
            value={getDisplayValue('bin')}
            onChange={(e) => handleChange(e, 'bin')}
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );
};

export default Converter;
