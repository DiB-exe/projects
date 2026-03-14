export const PRESETS = [
  {
    name: 'Binary Divisible by 3',
    description: 'Accepts binary strings that represent a number divisible by 3.',
    fsm: {
      states: [
        { id: 's0', label: 'S0 (Rem 0)', x: 150, y: 200 },
        { id: 's1', label: 'S1 (Rem 1)', x: 350, y: 100 },
        { id: 's2', label: 'S2 (Rem 2)', x: 350, y: 300 }
      ],
      transitions: [
        { id: 't1', from: 's0', to: 's0', label: '0' },
        { id: 't2', from: 's0', to: 's1', label: '1' },
        { id: 't3', from: 's1', to: 's2', label: '0' },
        { id: 't4', from: 's1', to: 's0', label: '1' },
        { id: 't5', from: 's2', to: 's1', label: '0' },
        { id: 't6', from: 's2', to: 's2', label: '1' }
      ],
      startState: 's0',
      acceptStates: ['s0']
    }
  },
  {
    name: 'Vending Machine (15¢)',
    description: 'Accepts exact change of 15 cents using Nickels (N) and Dimes (D).',
    fsm: {
      states: [
        { id: '0c', label: '0¢', x: 100, y: 200 },
        { id: '5c', label: '5¢', x: 250, y: 150 },
        { id: '10c', label: '10¢', x: 400, y: 150 },
        { id: '15c', label: '15¢ (Vend)', x: 550, y: 200 }
      ],
      transitions: [
        { id: 't1', from: '0c', to: '5c', label: 'N' },
        { id: 't2', from: '0c', to: '10c', label: 'D' },
        { id: 't3', from: '5c', to: '10c', label: 'N' },
        { id: 't4', from: '5c', to: '15c', label: 'D' },
        { id: 't5', from: '10c', to: '15c', label: 'N' }
      ],
      startState: '0c',
      acceptStates: ['15c']
    }
  }
];
