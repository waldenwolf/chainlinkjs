export function getChainID() {
    if(!process.env.CHAIN){
        throw new Error('CHAIN not found in environment variables');
    }
    if(!process.env.NETWORK){
        throw new Error('NETWORK not found in environment variables');
    }

    switch(process.env.CHAIN){
        case 'ethereum':
            return process.env.NETWORK === 'mainnet' ? 1 : 11155111;
        case 'polygon':
            return process.env.NETWORK === 'mainnet' ? 137 : 84532;
        case 'arbitrum':
            return process.env.NETWORK === 'mainnet' ? 42161 : 421611;
        case 'optimism':
            return process.env.NETWORK === 'mainnet' ? 10 : 420;
        case 'base':
            return process.env.NETWORK === 'mainnet' ? 8453 : 84531;
        default:
            throw new Error(`Unsupported chain: ${process.env.CHAIN}`);
    }
}

export default getChainID;