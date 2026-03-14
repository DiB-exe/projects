class CpuSimulator {
  constructor() {
    this.reset();
  }

  reset() {
    this.registers = {
      R1: 0,
      R2: 0,
      R3: 0,
      R4: 0,
      ACC: 0,
    };
    this.flags = {
      Z: 0, // Zero flag
      N: 0, // Negative flag
    };
    this.pc = 0; // Program Counter
    this.halted = false;
    this.error = null;
    this.output = []; // For potential OUT instructions or debugging
    this.labels = {}; // Maps label name to line number
    this.instructions = [];
  }

  // Resolves a parameter to its numeric value (either a register reference or immediate value)
  getValue(param) {
    if (Object.prototype.hasOwnProperty.call(this.registers, param)) {
      return this.registers[param];
    }
    const num = parseInt(param, 10);
    if (!isNaN(num)) return num;
    throw new Error(`Invalid parameter or uninitialized register: ${param}`);
  }

  setRegister(reg, val) {
    if (!Object.prototype.hasOwnProperty.call(this.registers, reg)) {
      throw new Error(`Invalid destination register: ${reg}`);
    }
    this.registers[reg] = val;
    this.updateFlags(val);
  }

  updateFlags(val) {
    this.flags.Z = val === 0 ? 1 : 0;
    this.flags.N = val < 0 ? 1 : 0;
  }

  parse(code) {
    this.reset();
    const lines = code.split('\n');
    
    // First pass: extract labels and clean up
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].split(';')[0].trim(); // Remove comments
      if (!line) {
        this.instructions.push({ type: 'NOP', args: [], original: lines[i] });
        continue;
      }

      // Check for labels (e.g., "START:")
      if (line.endsWith(':')) {
        const labelStr = line.slice(0, -1);
        this.labels[labelStr] = i;
        this.instructions.push({ type: 'LABEL', args: [labelStr], original: line });
        continue;
      }

      // Parse instruction
      const parts = line.split(/[ ,]+/); // Split by space or comma
      const type = parts[0].toUpperCase();
      const args = parts.slice(1).filter(Boolean).map(a => a.toUpperCase());
      
      this.instructions.push({ type, args, original: line });
    }
  }

  step() {
    if (this.halted || this.pc >= this.instructions.length) {
      this.halted = true;
      return false;
    }

    const inst = this.instructions[this.pc];
    this.pc++; // Increment PC before execution so jumps can override it

    try {
      switch (inst.type) {
        case 'NOP':
        case 'LABEL':
          break; // Do nothing
          
        case 'MOV':
        case 'LDR':
          if (inst.args.length !== 2) throw new Error("MOV requires 2 arguments (dest, src)");
          this.setRegister(inst.args[0], this.getValue(inst.args[1]));
          break;
          
        case 'ADD':
          if (inst.args.length !== 2) throw new Error("ADD requires 2 arguments (dest, src)");
          this.setRegister(inst.args[0], this.getValue(inst.args[0]) + this.getValue(inst.args[1]));
          break;
          
        case 'SUB':
          if (inst.args.length !== 2) throw new Error("SUB requires 2 arguments (dest, src)");
          this.setRegister(inst.args[0], this.getValue(inst.args[0]) - this.getValue(inst.args[1]));
          break;

        case 'MUL':
          if (inst.args.length !== 2) throw new Error("MUL requires 2 arguments (dest, src)");
          this.setRegister(inst.args[0], this.getValue(inst.args[0]) * this.getValue(inst.args[1]));
          break;

        case 'CMP': {
          if (inst.args.length !== 2) throw new Error("CMP requires 2 arguments (a, b)");
          const res = this.getValue(inst.args[0]) - this.getValue(inst.args[1]);
          this.updateFlags(res);
          break;
        }

        case 'JMP':
        case 'B':
          if (inst.args.length !== 1) throw new Error("JMP requires 1 argument (label)");
          if (this.labels[inst.args[0]] !== undefined) {
             this.pc = this.labels[inst.args[0]];
          } else {
             throw new Error(`Unknown label: ${inst.args[0]}`);
          }
          break;

        case 'JE':
        case 'BEQ':
          if (inst.args.length !== 1) throw new Error("JE requires 1 argument (label)");
          if (this.flags.Z === 1) {
             if (this.labels[inst.args[0]] !== undefined) this.pc = this.labels[inst.args[0]];
             else throw new Error(`Unknown label: ${inst.args[0]}`);
          }
          break;

        case 'JNE':
        case 'BNE':
          if (inst.args.length !== 1) throw new Error("JNE requires 1 argument (label)");
          if (this.flags.Z === 0) {
             if (this.labels[inst.args[0]] !== undefined) this.pc = this.labels[inst.args[0]];
             else throw new Error(`Unknown label: ${inst.args[0]}`);
          }
          break;

        case 'HALT':
        case 'SWI':
        case 'HLT':
          this.halted = true;
          break;

        default:
          throw new Error(`Unknown instruction: ${inst.type}`);
      }
    } catch (err) {
      this.error = `Error at line ${this.pc}: ${err.message}`;
      this.halted = true;
    }

    return !this.halted;
  }

  // Utility to run all lines up to a limit (prevent infinite loops)
  executeAll(maxSteps = 1000) {
    let steps = 0;
    while (!this.halted && steps < maxSteps) {
      this.step();
      steps++;
    }
    if (steps >= maxSteps) {
      this.error = "Execution halted: Max steps exceeded (Infinite loop?)";
    }
    return {
      registers: { ...this.registers },
      flags: { ...this.flags },
      error: this.error
    };
  }
}

export default CpuSimulator;
