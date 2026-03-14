import React, { useMemo, useRef } from 'react';
import { generateClockTransitions, getWaveformPath, detectTimingViolations } from '../utils/signalUtils';

const TimingDiagramSVG = ({ signals, maxTime, svgRef }) => {
  const config = {
    rowHeight: 60,
    paddingY: 10,
    scaleX: 5, // 1 unit of time = 5px
    labelWidth: 100
  };

  const totalHeight = signals.length * config.rowHeight + 40; // +40 for top timeline axis
  const totalWidth = config.labelWidth + maxTime * config.scaleX + 20;

  // Pre-calculate all transitions and paths
  const renderedSignals = useMemo(() => {
    return signals.map(sig => {
      const transitions = sig.type === 'clock' 
        ? generateClockTransitions(sig.period, maxTime)
        : (sig.transitions || []);
      
      const pathData = getWaveformPath(transitions, maxTime, config);
      return { ...sig, computedTransitions: transitions, pathData };
    });
  }, [signals, maxTime, config]);

  // Compute timing violations visually
  const violations = useMemo(() => {
    let viols = [];
    const clocks = renderedSignals.filter(s => s.type === 'clock');
    const datas = renderedSignals.filter(s => s.type === 'data');
    
    // Very simplified setup/hold detection: 
    // Assumes Setup=2, Hold=2 for any Data line relative to any Clock line.
    clocks.forEach(clk => {
      datas.forEach(data => {
         const v = detectTimingViolations(clk.computedTransitions, data.computedTransitions, maxTime, 2, 2, 'rising');
         // Add visual coordinates
         v.forEach(viol => {
            viols.push({
              ...viol,
              x: viol.windowStart * config.scaleX + config.labelWidth,
              width: (viol.windowEnd - viol.windowStart) * config.scaleX,
              // Draw over the entire height to make it visible
              y: 20, 
              height: totalHeight - 20
            });
         });
      });
    });
    return viols;
  }, [renderedSignals, maxTime, config.scaleX, config.labelWidth, totalHeight]);


  // Generate X-axis grid lines
  const gridLines = [];
  for (let t = 0; t <= maxTime; t += 10) {
    gridLines.push(t);
  }

  return (
    <div className="w-full overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-inner p-4">
      <svg 
        ref={svgRef}
        width={totalWidth} 
        height={totalHeight} 
        className="font-sans"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width={10 * config.scaleX} height={totalHeight} patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2={totalHeight} stroke="#f1f5f9" strokeWidth="1" />
          </pattern>
          <pattern id="violation-hatch" width="4" height="4" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="4" stroke="#ef4444" strokeWidth="2" strokeOpacity="0.5"/>
          </pattern>
        </defs>

        {/* Background Grid */}
        <rect x={config.labelWidth} y="0" width={maxTime * config.scaleX} height={totalHeight} fill="url(#grid)" />

        {/* Top Timeline Axis */}
        <g transform={`translate(${config.labelWidth}, 20)`}>
          <line x1="0" y1="0" x2={maxTime * config.scaleX} y2="0" stroke="#cbd5e1" strokeWidth="2" />
          {gridLines.map(t => (
            <g key={`tick-${t}`} transform={`translate(${t * config.scaleX}, 0)`}>
              <line x1="0" y1="-5" x2="0" y2="5" stroke="#94a3b8" strokeWidth="1.5" />
              <text x="0" y="-10" textAnchor="middle" fontSize="10" fill="#64748b" className="font-mono">{t}</text>
            </g>
          ))}
        </g>

        {/* Render Violations (Behind signals) */}
        {violations.map((v, i) => (
          <g key={`viol-${i}`}>
             <rect 
               x={v.x} 
               y={v.y} 
               width={v.width} 
               height={v.height} 
               fill="url(#violation-hatch)" 
             />
             <rect 
               x={v.x} 
               y={v.y} 
               width={v.width} 
               height={v.height} 
               fill="rgba(239, 68, 68, 0.1)" 
               stroke="#ef4444" 
               strokeWidth="1" 
               strokeDasharray="2,2" 
             />
             <text x={v.x + v.width/2} y={v.height - 10} textAnchor="middle" fontSize="10" fill="#ef4444" fontWeight="bold">VIOLATION</text>
          </g>
        ))}

        {/* Signals */}
        {renderedSignals.map((sig, idx) => {
          const startY = 40 + (idx * config.rowHeight);
          
          return (
            <g key={sig.id} transform={`translate(0, ${startY})`}>
              {/* Signal Label Area */}
              <rect x="0" y="0" width={config.labelWidth} height={config.rowHeight} fill="#f8fafc" />
              <text x={config.labelWidth - 15} y={config.rowHeight / 2} dominantBaseline="middle" textAnchor="end" fontSize="12" fontWeight="bold" fill="#334155">
                {sig.name}
              </text>
              <line x1={config.labelWidth} y1="0" x2={config.labelWidth} y2={config.rowHeight} stroke="#cbd5e1" strokeWidth="2" />

              {/* Waveform Line */}
              <g transform={`translate(${config.labelWidth}, 0)`}>
                 {/* Center reference line faintly behind */}
                 <line x1="0" y1={config.rowHeight/2} x2={maxTime * config.scaleX} y2={config.rowHeight/2} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4,4" />
                 
                 {/* The actual signal path. Use fill="none" because it's a line */}
                 <path 
                   d={sig.pathData} 
                   fill="none" 
                   stroke={sig.type === 'clock' ? '#4f46e5' : '#0ea5e9'} 
                   strokeWidth="2.5" 
                   strokeLinecap="round" 
                   strokeLinejoin="round" 
                 />

                 {/* Optional: we could render vertical edges explicitly if we want perfect 90 degree corners instead of native path handling, but paths are fine. */}
              </g>
              
              {/* Row Divider */}
              <line x1="0" y1={config.rowHeight} x2={totalWidth} y2={config.rowHeight} stroke="#e2e8f0" strokeWidth="1" />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default TimingDiagramSVG;
