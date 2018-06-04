const StoreService = new class SyncStore {
    get(...keys) {
        console.log(keys)
        return new Promise(resolve =>
            chrome.storage.sync.get(keys, resolve)
        )
    }

    set(data) {
        return new Promise(resolve =>
            chrome.storage.sync.set(data, resolve)
        )
    }

    add(data) {
        let keys = Object.keys(data)

        console.log(keys)

        return this.get(...keys)
            .then(result => {
                keys.forEach(key =>
                    result[key] = (result[key] || []).concat(data[key])
                )

                return this.set(result)
            })
    }
}

export { StoreService }
