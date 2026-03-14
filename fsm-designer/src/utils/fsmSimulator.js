/**
 * Evaluates an FSM against an input string.
 * @param {Object} fsm - The FSM definition { states: [], transitions: [], startState: id, acceptStates: [] }
 * @param {string} input - The string to evaluate (e.g. "0110")
 * @returns {Array} List of trace steps: [{ char, fromState, toState, isAccept }]
 */
export const evaluateFSM = (fsm, input) => {
  const trace = [];
  let currentState = fsm.startState;

  if (!currentState) return { trace, status: 'Invalid FSM (No Start State)' };

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    
    // Find valid transition
    const transition = fsm.transitions.find(t => 
      t.from === currentState && 
      t.label.split(',').map(s => s.trim()).includes(char)
    );

    if (!transition) {
      // Rejection by dead end
      return { 
        trace, 
        status: 'Rejected (No valid transition)',
        failedAtStep: i
      };
    }

    trace.push({
      step: i,
      char,
      fromState: currentState,
      toState: transition.to,
      transitionId: transition.id
    });

    currentState = transition.to;
  }

  const isAccepted = fsm.acceptStates.includes(currentState);

  return {
    trace,
    finalState: currentState,
    status: isAccepted ? 'Accepted' : 'Rejected (Not in Accept State)',
    isAccepted
  };
};
