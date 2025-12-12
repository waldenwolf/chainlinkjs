export const LINK_TOKEN_ABI = [
    "function transferAndCall(address to, uint256 value, bytes data) external returns (bool success)",
    "function decimals() external view returns (uint8)",
    "function balanceOf(address account) external view returns (uint256)",
    "function approve(address spender, uint256 amount) external returns (bool)"
];

export default LINK_TOKEN_ABI;