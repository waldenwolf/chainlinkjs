export const TERMS_OF_SERVICE_ALLOW_LIST_ABI = [
    "function acceptTermsOfService(address acceptor, address recipient, bytes32 r, bytes32 s, uint8 v) external",
    "function getMessage(address acceptor, address recipient) public pure returns (bytes32)",
    "function hasAccess(address user, bytes calldata data) external view returns (bool)",
    "function isBlockedSender(address sender) external view returns (bool)"
];

export default TERMS_OF_SERVICE_ALLOW_LIST_ABI;

