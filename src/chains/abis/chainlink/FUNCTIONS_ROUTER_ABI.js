export const FUNCTIONS_ROUTER_ABI = [
    // Functions Router
    'function getContractById(bytes32 contractId) external view returns (address)',
    // Subscription Management
    "function createSubscription() external returns (uint64)",
    "function createSubscriptionWithConsumer(address consumer) external returns (uint64)",
    "function cancelSubscription(uint64 subscriptionId, address to) external",
    "function ownerCancelSubscription(uint64 subscriptionId) external",
    "function addConsumer(uint64 subscriptionId, address consumer) external",
    "function removeConsumer(uint64 subscriptionId, address consumer) external",
    "function proposeSubscriptionOwnerTransfer(uint64 subscriptionId, address newOwner) external",
    "function acceptSubscriptionOwnerTransfer(uint64 subscriptionId) external",

    // Subscription
    "function getSubscription(uint64 subscriptionId) external view returns (tuple(uint96 balance, address owner, uint96 blockedBalance, address proposedOwner, address[] consumers, bytes32 flags))",
    "function getSubscriptionCount() external view returns (uint64)",
    "function pendingRequestExists(uint64 subscriptionId) external view returns (bool)",

    // Encrypted Secrets Management
    "function setEncryptedSecretsReference(uint64 subscriptionId, string encryptedSecretsUrl) external",

    // Function Execution
    "function sendRequest(uint64 subscriptionId, bytes data, uint16 dataVersion, uint32 callbackGasLimit, bytes32 donId) external returns (bytes32)",
    "function sendRequestToProposed(uint64 subscriptionId, bytes data, uint16 dataVersion, uint32 callbackGasLimit, bytes32 donId) external returns (bytes32)",
    "function fulfill(bytes response, bytes err, uint96 juelsPerGas, uint96 costWithoutCallback, address transmitter, tuple(bytes32 requestId, address coordinator, uint96 estimatedTotalCostJuels, address client, uint64 subscriptionId, uint32 callbackGasLimit, uint72 adminFee, uint72 donFee, uint40 gasOverheadBeforeCallback, uint40 gasOverheadAfterCallback, uint32 timeoutTimestamp) commitment) external returns (uint8, uint96)",

    // Configuration & Utils
    "function getConfig() external view returns (tuple(uint16 maxConsumersPerSubscription, uint72 adminFee, bytes4 handleOracleFulfillmentSelector, uint16 gasForCallExactCheck, uint32[] maxCallbackGasLimits, uint16 subscriptionDepositMinimumRequests, uint72 subscriptionDepositJuels))",
    "function isValidCallbackGasLimit(uint64 subscriptionId, uint32 callbackGasLimit) external view",
    "function typeAndVersion() external view returns (string)",

    // Events
    "event SubscriptionCreated(uint64 indexed subscriptionId, address owner)",
    "event SubscriptionConsumerAdded(uint64 indexed subscriptionId, address consumer)",
    "event SubscriptionConsumerRemoved(uint64 indexed subscriptionId, address consumer)",
    "event SubscriptionCancelled(uint64 indexed subscriptionId, address fundsRecipient, uint256 fundsAmount)",
    "event SubscriptionFunded(uint64 indexed subscriptionId, uint256 oldBalance, uint256 newBalance)",
    "event SubscriptionOwnerTransferRequested(uint64 indexed subscriptionId, address from, address to)",
    "event SubscriptionOwnerTransferred(uint64 indexed subscriptionId, address from, address to)",
    "event RequestStart(bytes32 indexed requestId, bytes32 indexed donId, uint64 indexed subscriptionId, address subscriptionOwner, address requestingContract, address requestInitiator, bytes data, uint16 dataVersion, uint32 callbackGasLimit, uint96 estimatedTotalCostJuels)",
    "event RequestProcessed(bytes32 indexed requestId, uint64 indexed subscriptionId, uint96 totalCostJuels, address transmitter, uint8 resultCode, bytes response, bytes err, bytes callbackReturnData)"
];

export default FUNCTIONS_ROUTER_ABI;