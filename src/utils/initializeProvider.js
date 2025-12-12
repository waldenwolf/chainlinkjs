import { ethers } from 'ethers';

export const initializeProvider = () => {
    const providerUri = process.env.PROVIDER_URI;

    const provider = new ethers.JsonRpcProvider(providerUri);

    return { provider };
}

export default initializeProvider;