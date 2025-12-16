import { ReturnType } from '../enums/index.js';
import isValidHexadecimal from './isValidHexadecimal.js';
import signedInt256toBigInt from './signedInt256toBigInt.js';

export const decodeResult = (resultHexstring, expectedReturnType) => {
  if (!isValidHexadecimal(resultHexstring) && resultHexstring.slice(0, 2) !== '0x') {
    throw Error(`'${resultHexstring}' is not a valid hexadecimal string`);
  }
  expectedReturnType = expectedReturnType.toLowerCase();

  if (!Object.values(ReturnType).includes(expectedReturnType)) {
    throw Error(
      `'${expectedReturnType}' is not valid.  Must be one of the following: ${Object.values(
        ReturnType,
      )}`,
    );
  }

  const resultHexBits = resultHexstring.slice(2).length * 4;
  
  let decodedOutput;
  switch (expectedReturnType) {
    case ReturnType.uint256:
      if (resultHexBits > 256) {
        throw Error(
          `'${resultHexstring}' has '${resultHexBits}' bits which is too large for uint256`,
        );
      }
      if (resultHexstring === '0x') {
        return BigInt(0);
      }
      decodedOutput = BigInt('0x' + resultHexstring.slice(2).slice(-64));
      break;
    case ReturnType.int256:
      if (resultHexBits > 256) {
        throw Error(
          `'${resultHexstring}' has '${resultHexBits}' bits which is too large for int256`,
        );
      }
      if (resultHexstring === '0x') {
        return BigInt(0);
      }
      decodedOutput = signedInt256toBigInt('0x' + resultHexstring.slice(2).slice(-64));
      break;
    case ReturnType.string:
      if (resultHexstring === '0x') {
        return '';
      }
      decodedOutput = Buffer.from(resultHexstring.slice(2), 'hex').toString();
      break;
    case ReturnType.bytes:
      decodedOutput = resultHexstring;
      break;
    default:
      throw new Error(`unexpected return type to decode: '${expectedReturnType}'.`);
  }

  return decodedOutput;
};

export default decodeResult;
