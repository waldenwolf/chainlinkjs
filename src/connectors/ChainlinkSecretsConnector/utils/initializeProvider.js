import { ethers } from 'ethers';

export const initializeProvider = (providerUri) => {
    const provider = new ethers.JsonRpcProvider(providerUri);
    return provider;
}

export default initializeProvider;