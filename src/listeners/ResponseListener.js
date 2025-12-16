import { Contract } from 'ethers';
import FUNCTIONS_ROUTER_ABI from '../chains/abis/chainlink/FUNCTIONS_ROUTER_ABI.js';
import { FulfillmentCode } from '../enums/index.js';

export class ResponseListener {
  constructor({ provider, functionsRouterAddress }) {
    this.provider = provider;
    this.functionsRouter = new Contract(functionsRouterAddress, FUNCTIONS_ROUTER_ABI, provider);
  }

  async listenForResponse(requestId, timeoutMs = 300000) {
    let expirationTimeout;
    const responsePromise = new Promise((resolve, reject) => {
      expirationTimeout = setTimeout(() => {
        reject('Response not received within timeout period');
      }, timeoutMs);

      this.functionsRouter.on(
        'RequestProcessed',
        (
          _requestId,
          subscriptionId,
          totalCostJuels,
          _,
          resultCode,
          response,
          err,
          returnData,
        ) => {
          if (requestId === _requestId && Number(resultCode) !== FulfillmentCode.INVALID_REQUEST_ID) {
            clearTimeout(expirationTimeout);
            this.functionsRouter.removeAllListeners('RequestProcessed');
            resolve({
              requestId,
              subscriptionId: Number(subscriptionId.toString()),
              totalCostInJuels: BigInt(totalCostJuels.toString()),
              responseBytesHexstring: response,
              errorString: Buffer.from(err.slice(2), 'hex').toString(),
              returnDataBytesHexstring: returnData,
              fulfillmentCode: Number(resultCode),
            });
          }
        },
      );
    });

    return responsePromise;
  }

  /**
   *
   * @param txHash Tx hash for the Functions Request
   * @param timeoutMs after which the listener throws, indicating  the time limit was exceeded (default 5 minutes)
   * @param confirmations  number of confirmations to wait for before considering the transaction successful (default 1, but recommend 2 or more)
   * @param checkIntervalMs frequency of checking if the Tx is  included on-chain (or if it got moved after a chain re-org) (default 2 seconds. Intervals longer than block time may cause the listener to wait indefinitely.)
   * @returns
   */
  async listenForResponseFromTransaction(
    txHash,
    timeoutMs = 3000000,
    confirmations = 1,
    checkIntervalMs = 2000,
  ) {
    return new Promise((resolve, reject) => {
      (async () => {
        let requestId;
        // eslint-disable-next-line prefer-const
        let checkTimeout;
        const expirationTimeout = setTimeout(() => {
          reject('Response not received within timeout period');
        }, timeoutMs);

        const check = async () => {
          try {
            const tx = await this.provider.getTransaction(txHash);
            if (!tx) {
              // Transaction not found yet, wait for next interval
              return;
            }
            
            // In ethers v6, we wait on the transaction response
            const receipt = await tx.wait(confirmations);
            
            // The requestId is in the first log, second topic (index 1)
            // event RequestStart(bytes32 indexed requestId, ...)
            const updatedId = receipt.logs[0].topics[1];
            
            if (updatedId !== requestId) {
              requestId = updatedId;
              const response = await this.listenForResponse(requestId, timeoutMs);
              if (updatedId === requestId) {
                // Resolve only if the ID hasn't changed in the meantime
                clearTimeout(expirationTimeout);
                clearInterval(checkTimeout);
                resolve(response);
              }
            }
          } catch (e) {
            if (e.message && e.message.includes('timeout')) {
                // ignore timeout from wait if any
            } else {
              console.error('Error listening for response from transaction', e);
              reject(e);
            }
          }
        };

        // Check periodically if the transaction has been re-orged and requestID changed
        checkTimeout = setInterval(check, checkIntervalMs);

        check();
      })();
    });
  }

  listenForResponses(
    subscriptionId,
    callback,
  ) {
    if (typeof subscriptionId === 'string') {
      subscriptionId = Number(subscriptionId);
    }

    this.functionsRouter.on(
      'RequestProcessed',
      (
        requestId,
        _subscriptionId,
        totalCostJuels,
        _,
        resultCode,
        response,
        err,
        returnData,
      ) => {
        if (
          subscriptionId === Number(_subscriptionId.toString()) &&
          Number(resultCode) !== FulfillmentCode.INVALID_REQUEST_ID
        ) {      
          this.functionsRouter.removeAllListeners('RequestProcessed');
          callback({
            requestId,
            subscriptionId: Number(subscriptionId.toString()),
            totalCostInJuels: BigInt(totalCostJuels.toString()),
            responseBytesHexstring: response,
            errorString: Buffer.from(err.slice(2), 'hex').toString(),
            returnDataBytesHexstring: returnData,
            fulfillmentCode: Number(resultCode),
          });
        }
      },
    );
  }

  stopListeningForResponses() {
    this.functionsRouter.removeAllListeners('RequestProcessed');
  }
}

export default ResponseListener;
