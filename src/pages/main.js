console.log('page script loaded!')

const RPCController = new Proxy({}, {
    get(target, method) {
        return (...args) =>
            new Promise((resolve, reject) =>
                chrome.runtime.sendMessage(
                    { rpc: true, method, args },
                    ({ ok, result, error }) =>
                        ok ? resolve(result) : reject(error)
                )
            )
    }
})
