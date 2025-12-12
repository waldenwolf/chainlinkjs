import { ethers } from 'ethers';

import FUNCTIONS_ROUTER_ABI from '../../../chains/abis/chainlink/FUNCTIONS_ROUTER_ABI.js';
import LINK_TOKEN_ABI from '../../../chains/abis/tokens/LINK_ABI.js';

import FUNCTIONS_ROUTER_ADDRESSES from '../../../chains/addresses/chainlink/FUNCTIONS_ROUTER_ADDRESSES.js';
import LINK_ADDRESSES from '../../../chains/addresses/tokens/LINK_ADDRESSES.js';

export const initializeContracts = (provider, chain, network) => {
    const routerAddress = FUNCTIONS_ROUTER_ADDRESSES[chain][network];
    const functionRouter = new ethers.Contract(
        routerAddress,
        FUNCTIONS_ROUTER_ABI,
        provider
    );

    const linkTokenAddress = LINK_ADDRESSES[chain]?.[network];

    let linkToken;
    if (linkTokenAddress) {
        linkToken = new ethers.Contract(
            linkTokenAddress,
            LINK_TOKEN_ABI,
            provider
        );
    } else {
        console.warn(`LINK token address not found for ${chain}/${network}. LINK funding will not be available.`);
    }

    return { functionRouter, linkToken };
}

export default initializeContracts;