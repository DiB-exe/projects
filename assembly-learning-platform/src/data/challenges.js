export const challenges = [
  {
    id: 1,
    title: 'Warmup: Move & Add',
    description: 'Load the value 10 into R1, the value 20 into R2, and then add them together storing the result in R1.',
    initialCode: `; Move 10 into R1
MOV R1, 10

; Move 20 into R2


; Add R2 into R1

`,
    // Evaluator checks if final registers meet assertions
    assert: (registers) => {
      const pass = registers.R1 === 30 && registers.R2 === 20;
      return { pass, message: pass ? 'Success! R1 is 30 and R2 is 20.' : `Expected R1=30, R2=20. Got R1=${registers.R1}, R2=${registers.R2}` };
    }
  },
  {
    id: 2,
    title: 'Conditional Jump',
    description: 'Write a loop that subtracts 1 from R1 until it reaches 0. Start by initializing R1 to 5.',
    initialCode: `MOV R1, 5
LOOP:
SUB R1, 1
CMP R1, 0
JNE LOOP
`,
    assert: (registers) => {
      const pass = registers.R1 === 0;
      return { pass, message: pass ? 'Perfect! The loop terminated when R1 hit 0.' : `Expected R1=0. Got R1=${registers.R1}` };
    }
  },
  {
    id: 3,
    title: 'Multiplication by Addition',
    description: 'Multiply R1 (value: 4) by R2 (value: 3) using only ADD and a loop. Store the final result in ACC.',
    initialCode: `MOV R1, 4    ; Multiplicand
MOV R2, 3    ; Multiplier (loop counter)
MOV ACC, 0   ; Accumulator

MULTIPLY:
; Add your logic here
`,
    assert: (registers) => {
      const pass = registers.ACC === 12;
      return { pass, message: pass ? 'Excellent! You successfully built a multiplier.' : `Expected ACC=12. Got ACC=${registers.ACC}` };
    }
  }
];
