import { ethers } from "ethers";
import { getChainID } from "./getChainID.js";

export function getProvider() {
    if (!process.env.PROVIDER_URI) {
        throw new Error('PROVIDER_URI not found in environment variables');
    }
    try {
        return new ethers.JsonRpcProvider(process.env.PROVIDER_URI, getChainID());
    } catch (error) {
        return new ethers.JsonRpcProvider(process.env.PROVIDER_URI);
    }
}

export default getProvider;