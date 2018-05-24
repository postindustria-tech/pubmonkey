console.log('content script loaded')

let APP_ID = 'aogdgbbodibojfifcgehledmeemcelii'

const RPCController = new Proxy({}, {
    get(target, method) {
        return (...args) =>
            new Promise((resolve, reject) =>
                chrome.runtime.sendMessage(
                    APP_ID,
                    { rpc: true, method, args },
                    ({ ok, result, error }) =>
                        ok ? resolve(result) : reject(error)
                )
            )
    }
})

RPCController.something(5,6,7).then(result => console.log(result))
