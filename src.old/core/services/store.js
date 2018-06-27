const StorageService = new class Storage {
    get(...keys) {
        return new Promise(resolve =>
            chrome.storage.local.get(keys, resolve)
        )
    }

    set(data) {
        return new Promise(resolve =>
            chrome.storage.local.set(data, resolve)
        )
    }

    // add(data) {
    //     let keys = Object.keys(data)
    //
    //     return this.get(...keys)
    //         .then(result => {
    //             keys.forEach(key =>
    //                 result[key] = (result[key] || []).concat(data[key])
    //             )
    //
    //             return this.set(result)
    //         })
    // }
}

export { StorageService }
