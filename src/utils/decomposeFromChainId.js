export function decomposeFromChainId(chainId) {
    switch(chainId) {
        case 1:
            return { chain: 'ethereum', network: 'mainnet' };
        case 11155111:
            return { chain: 'ethereum', network: 'sepolia' };
        case 137:
            return { chain: 'polygon', network: 'mainnet' };
        case 80002:
            return { chain: 'polygon', network: 'amoy' };
        case 42161:
            return { chain: 'arbitrum', network: 'mainnet' };
        case 421614:
            return { chain: 'arbitrum', network: 'sepolia' };
        case 10:
            return { chain: 'optimism', network: 'mainnet' };
        case 420:
            return { chain: 'optimism', network: 'sepolia' };
        case 8453:
            return { chain: 'base', network: 'mainnet' };
        case 84532:
            return { chain: 'base', network: 'sepolia' };
        default:
            return { chain: null, network: null };
    }
}

export default decomposeFromChainId;