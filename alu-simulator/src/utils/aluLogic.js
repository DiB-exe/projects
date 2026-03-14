export const performALUOperation = (op, aNum, bNum, bits) => {
  if (aNum === null || bNum === null) return null;

  let result = 0;
  let c = false; // carry
  let overflow = false;
  
  // Masks for specified bit width
  const bitMask = (1 << bits) - 1;
  const signMask = 1 << (bits - 1);

  const unsignedA = aNum & bitMask;
  const unsignedB = bNum & bitMask;

  switch (op) {
    case 'ADD': {
      const sum = unsignedA + unsignedB;
      result = sum & bitMask;
      c = sum > bitMask;
      
      const aSign = unsignedA & signMask;
      const bSign = unsignedB & signMask;
      const resSign = result & signMask;
      overflow = (aSign === bSign) && (aSign !== resSign);
      break;
    }
    case 'SUB': {
      // a - b is a + (~b) + 1
      const invB = (~unsignedB) & bitMask;
      const sum = unsignedA + invB + 1;
      result = sum & bitMask;
      c = sum > bitMask; 
      
      const aSign = unsignedA & signMask;
      const bSign = invB & signMask;
      const resSign = result & signMask;
      overflow = (aSign === bSign) && (aSign !== resSign);
      break;
    }
    case 'AND':
      result = (unsignedA & unsignedB) & bitMask;
      break;
    case 'OR':
      result = (unsignedA | unsignedB) & bitMask;
      break;
    case 'XOR':
      result = (unsignedA ^ unsignedB) & bitMask;
      break;
    case 'NOT':
      // typically only applies to A
      result = ~unsignedA & bitMask;
      break;
    case 'LSL':
      // Logical Shift Left on A by B
      const shiftL = unsignedB % bits; // shift amount usually modulo bit-width
      result = (unsignedA << shiftL) & bitMask;
      c = shiftL > 0 ? ((unsignedA & (1 << (bits - shiftL))) !== 0) : false;
      break;
    case 'LSR': {
      const shiftR = unsignedB % bits;
      result = (unsignedA >> shiftR) & bitMask;
      c = shiftR > 0 ? ((unsignedA & (1 << (shiftR - 1))) !== 0) : false;
      break;
    }
    case 'ASR': { // Arithmetic Shift Right
      const shiftAR = unsignedB % bits;
      // JS bitwise >> is sign-propagating for 32-bit numbers. 
      // We need to sign extend unsignedA to 32 bits first.
      let signedA = unsignedA;
      if (unsignedA & signMask) {
        signedA = unsignedA | ~bitMask;
      }
      result = (signedA >> shiftAR) & bitMask;
      c = shiftAR > 0 ? ((signedA & (1 << (shiftAR - 1))) !== 0) : false;
      break;
    }
  }

  const z = result === 0;
  const n = (result & signMask) !== 0;

  return { result, flags: { z, c, v: overflow, n } };
};
