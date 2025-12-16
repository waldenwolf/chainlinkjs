export default function signedInt256toBigInt(hex) {
    const binary = BigInt(hex).toString(2).padStart(256, '0')
    // if the first bit is 0, number is positive
    if (binary[0] === '0') {
      return BigInt(hex)
    }
    return -(BigInt(2) ** BigInt(255)) + BigInt(`0b${binary.slice(1)}`)
  }

export { signedInt256toBigInt };