async function createGatewayMessage(signer, method, don_id, payload) {
    const body = {
        message_id: `${Math.floor(Math.random() * Math.pow(2, 32))}`,
        method,
        don_id,
        receiver: '',
        payload,
    }

    const MessageIdMaxLen = 128
    const MessageMethodMaxLen = 64
    const MessageDonIdMaxLen = 64
    const MessageReceiverLen = 2 + 2 * 20

    const alignedMessageId = Buffer.alloc(MessageIdMaxLen)
    Buffer.from(body.message_id).copy(alignedMessageId)

    const alignedMethod = Buffer.alloc(MessageMethodMaxLen)
    Buffer.from(body.method).copy(alignedMethod)

    const alignedDonId = Buffer.alloc(MessageDonIdMaxLen)
    Buffer.from(body.don_id).copy(alignedDonId)

    const alignedReceiver = Buffer.alloc(MessageReceiverLen)
    Buffer.from(body.receiver).copy(alignedReceiver)

    let payloadJson = ''
    if (body.payload) {
        payloadJson = JSON.stringify(body.payload)
    }

    const messageBodyBuffer = Buffer.concat([
        alignedMessageId,
        alignedMethod,
        alignedDonId,
        alignedReceiver,
        Buffer.from(payloadJson),
    ])

    const gatewaySignature = await signer.signMessage(messageBodyBuffer)

    return JSON.stringify({
        id: body.message_id,
        jsonrpc: '2.0',
        method: body.method,
        params: {
            body,
            signature: gatewaySignature,
        },
    })
}

export { createGatewayMessage }