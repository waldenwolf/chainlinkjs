import { ethers } from 'ethers';

import VRF_COORDINATOR_ABI from '../../../chains/abis/chainlink/VRF_COORDINATOR_ABI.js';
import LINK_TOKEN_ABI from '../../../chains/abis/tokens/LINK_ABI.js';

import VRF_COORDINATOR_ADDRESSES from '../../../chains/addresses/chainlink/VRF_COORDINATOR_ADDRESSES.js';
import LINK_ADDRESSES from '../../../chains/addresses/tokens/LINK_ADDRESSES.js';

export const initializeContracts = (provider, network, chain) => {
    const coordinatorAddress = VRF_COORDINATOR_ADDRESSES[chain][network];

    const vrfCoordinator = new ethers.Contract(
        coordinatorAddress,
        VRF_COORDINATOR_ABI,
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
        console.warn(`LINK token address not found for ${network}/${chain}. LINK funding will not be available.`);
    }

    return { vrfCoordinator, linkToken };
}

export default initializeContracts;