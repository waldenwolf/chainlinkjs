export const FUNCTIONS_COORDINATOR_ABI = [
    'function getThresholdPublicKey() external view returns (bytes)',
    'function getDONPublicKey() external view returns (bytes)',
    'function estimateCost(uint64 subscriptionId, bytes data, uint32 callbackGasLimit, uint256 gasPriceWei) external view returns (uint96)',
];

export default FUNCTIONS_COORDINATOR_ABI;