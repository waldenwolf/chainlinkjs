export default function isValidHexadecimal(str) {
    const regex = /^0x[0-9a-fA-F]+$/
    return regex.test(str)
}

export { isValidHexadecimal };
