chrome.tabs.query({
    url: chrome.extension.getURL('index.html')
}, tabs => tabs.forEach(({ active, id }) => !active && chrome.tabs.remove(id)))

chrome.webRequest.onHeadersReceived.addListener(({ statusCode }) => {
    if (statusCode === 302) {
        chrome.tabs.create({ url: 'https://app.mopub.com/account/login/' }, ({ id }) => {
            chrome.tabs.onUpdated.addListener(function handler(tabId, { status, url }) {
                if (tabId === id && status === 'loading' && url === 'https://app.mopub.com/dashboard/') {
                    chrome.tabs.remove(id)
                    chrome.tabs.onUpdated.removeListener(handler)

                    let url = chrome.extension.getURL('index.html')

                    chrome.tabs.query({ url }, tabs =>
                        chrome.tabs.update(tabs[0].id, { url, active: true })
                    )
                }
            })
        })
    }
}, {
    urls: [ 'https://app.mopub.com/web-client/api/orders/query' ]
})
