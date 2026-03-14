/**
 * Generates regular clock transitions up to maxTime
 */
export const generateClockTransitions = (period, maxTime) => {
  const transitions = [];
  let currentTime = 0;
  let val = 1; // start high or low, typically clocks start low and rise on edge, but let's start low.
  val = 0;

  // Initial state doesn't need a transition at time 0 if we assume it starts at 0, 
  // but let's explicitly push it
  transitions.push({ time: 0, val });

  while (currentTime < maxTime) {
    currentTime += period / 2;
    if (currentTime <= maxTime) {
      val = val === 1 ? 0 : 1;
      // We push a logical transition.
      // E.g. at time 5, val goes to 1. Which implies from 0..5 val was 0.
      transitions.push({ time: currentTime, val });
    }
  }
  return transitions;
};

/**
 * Converts a set of logical transitions [{time, val}, ...] into SVG Path commands
 * drawing a continuous waveform line.
 */
export const getWaveformPath = (transitions, maxTime, config) => {
  const { rowHeight, paddingY, scaleX } = config;
  
  // y=0 is top of row
  // High value (1) goes to paddingY
  // Low value (0) goes to rowHeight - paddingY
  // Z value (high impedance) goes to middle
  
  const getY = (v) => {
    if (v === 1) return paddingY;
    if (v === 0) return rowHeight - paddingY;
    return rowHeight / 2; // High-Z or unknown
  };

  if (!transitions || transitions.length === 0) {
    // defaults to 0 line
    const y = getY(0);
    return `M 0,${y} L ${maxTime * scaleX},${y}`;
  }

  // Sort transitions by time just in case
  const sorted = [...transitions].sort((a,b) => a.time - b.time);

  let pathData = [];
  
  // Start point
  let currentVal = sorted[0].val;
  let startY = getY(currentVal);
  pathData.push(`M ${sorted[0].time * scaleX},${startY}`);

  for (let i = 1; i < sorted.length; i++) {
    const t = sorted[i];
    // Draw horizontal line at current value to the new transition time
    pathData.push(`L ${t.time * scaleX},${getY(currentVal)}`);
    
    // Switch value
    currentVal = t.val;
    // Draw vertical (or angled) transition to the new value at the same time
    // For a slight slope (realistic), we could add a tiny delta X, but digital looks fine strictly vertical
    pathData.push(`L ${t.time * scaleX},${getY(currentVal)}`);
  }

  // Draw final horizontal line to maxTime
  if (sorted[sorted.length - 1].time < maxTime) {
    pathData.push(`L ${maxTime * scaleX},${getY(currentVal)}`);
  }

  return pathData.join(' ');
};

/**
 * Detects Setup and Hold time violations.
 * Compares data transitions against active clock edges.
 */
export const detectTimingViolations = (clockTransitions, dataTransitions, maxTime, setupTime, holdTime, activeEdge = 'rising') => {
  const violations = [];
  
  // Extract active clock edges
  const edges = clockTransitions.filter(t => {
    // If rising edge: val becomes 1. If falling: val becomes 0.
    return activeEdge === 'rising' ? t.val === 1 : t.val === 0;
  });

  // Calculate the unstable window for each data transition
  // Actually, standard Setup/Hold is measured *around* the clock edge.
  // Data must be stable (no transitions) within [ edgeTime - setupTime, edgeTime + holdTime ]
  
  edges.forEach(edge => {
    const windowStart = edge.time - setupTime;
    const windowEnd = edge.time + holdTime;
    
    // Check if any data transition occurs inside this window
    dataTransitions.forEach(dt => {
      if (dt.time > windowStart && dt.time < windowEnd) {
        violations.push({
          time: dt.time,
          edgeTime: edge.time,
          windowStart,
          windowEnd
        });
      }
    });
  });

  return violations;
};
