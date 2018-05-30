let APP_ID = 'aogdgbbodibojfifcgehledmeemcelii'

export const RPCController = new Proxy({}, {
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
