export const VRF_COORDINATOR_ABI = [
    "function createSubscription() external returns (uint256)",
    "function cancelSubscription(uint256 subId, address to)",
    "function addConsumer(uint256 subId, address consumer)",
    "function removeConsumer(uint256 subId, address consumer)",
    "function getSubscription(uint256 subId) external view returns (uint96 balance, uint96 nativeBalance, uint64 reqCount, address subOwner, address[] memory consumers)",
    "function fundSubscriptionWithNative(uint256 subId) external payable",
    "function fundSubscription(uint256 subId)",
    "function requestRandomWords(bytes32 keyHash, uint256 subId, uint16 minimumRequestConfirmations, uint32 callbackGasLimit, uint32 numWords) external returns (uint256 requestId)",
    "function getRequestConfig() external view returns (uint16, uint32, bytes32[] memory)",
    // Events
    "event SubscriptionCreated(uint256 indexed subId, address owner)",
    "event SubscriptionFunded(uint256 indexed subId, uint256 oldBalance, uint256 newBalance)",
    "event SubscriptionConsumerAdded(uint256 indexed subId, address consumer)",
    "event SubscriptionConsumerRemoved(uint256 indexed subId, address consumer)",
    "event SubscriptionCancelled(uint256 indexed subId, address to, uint256 amount)"
];

export default VRF_COORDINATOR_ABI;