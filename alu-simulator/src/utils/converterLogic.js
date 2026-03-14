export const parseValue = (value, base) => {
  if (!value) return null;
  const bases = { bin: 2, oct: 8, dec: 10, hex: 16 };
  const num = parseInt(value, bases[base]);
  return isNaN(num) ? null : num;
};

// Formats a number to unsigned representation with given bit-width mapping
const toUnsigned = (num, bits) => {
  if (num < 0) {
    // compute two's complement unsigned equivalent
    num = num >>> 0; // converts to 32 bit unsigned
    if (bits < 32) {
       num = num & ((1 << bits) - 1);
    }
  }
  return num;
};

export const formatValue = (num, base, bits = 32) => {
  if (num === null || num === undefined) return '';
  num = toUnsigned(num, bits);
  
  if (base === 'bin') {
    return num.toString(2).padStart(bits, '0');
  } else if (base === 'oct') {
    return num.toString(8);
  } else if (base === 'hex') {
    return num.toString(16).toUpperCase();
  } else {
    // For decimal we show the signed value if we want, or unsigned. Usually in these converters,
    // if the user switches to decimal, we might want to show the two's complement signed decimal
    // Let's show signed if MSB is 1 for the specific bits width.
    const isNegative = (num & (1 << (bits - 1))) !== 0;
    if (isNegative && bits < 32) {
       // manual sign extension to JS scale for decimal printing
       let mask = ~((1 << bits) - 1);
       let signed = num | mask;
       return signed.toString(10);
    }
    // JS 32-bit math naturally treats bit 31 as negative when doing bitwise operations
    return (num | 0).toString(10); 
  }
};
