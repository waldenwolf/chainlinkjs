import { ethers } from "ethers";

export const transferAndCall = async (tokenContract, functionRouterAddress, amount, subscriptionId, signer) => {
    if (!tokenContract) {
        throw new Error(`LINK token required`);
    }

    const decimals = await tokenContract.decimals();

    // For Token (link but may be other?) funding, the data is just the subscription ID encoded as bytes
    const subscriptionIdBytes = ethers.zeroPadValue(ethers.toBeHex(subscriptionId), 32);

    const unitAmount = ethers.parseUnits(amount, decimals);
    const data = tokenContract.interface.encodeFunctionData('transferAndCall', [
        functionRouterAddress,
        unitAmount,
        subscriptionIdBytes
    ]);


    const tx = await signer.sendTransaction({
        to: tokenContract.target,
        data: data
    });

    const receipt = await tx.wait();

    return {
        success: true,
        transactionHash: receipt.hash,
        subscriptionId,
        unitAmount
    };
}

export default transferAndCall;