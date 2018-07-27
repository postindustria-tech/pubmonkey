import axios from 'ex-axios'
import HTMLParser from 'fast-html-parser'

const EXTENSION_URL = chrome.extension.getURL('index.html')

chrome.tabs.query({
    url: EXTENSION_URL
}, tabs => tabs.forEach(({ active, id }) => !active && chrome.tabs.remove(id)))

chrome.webRequest.onHeadersReceived.addListener(({ statusCode }) => {
    if (statusCode === 302) {
        chrome.tabs.create({ url: 'https://app.mopub.com/account/login/' }, ({ id }) => {
            chrome.tabs.onUpdated.addListener(function handler(tabId, { status, url }) {
                if (tabId === id && status === 'loading' && (url === 'https://app.mopub.com/dashboard/' || url === 'https://app.mopub.com/new-app')) {
                    chrome.tabs.remove(id)
                    chrome.tabs.onUpdated.removeListener(handler)

                    let url = EXTENSION_URL

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

const CJ = window.MopubAutomation = {}

parseUserName()

function parseUserName() {
    let resolveName, resolveAdUnits

    CJ.username = new Promise(resolve => resolveName = resolve)
    CJ.adunits = new Promise(resolve => resolveAdUnits = resolve)

    axios.get('https://app.mopub.com/advertise/orders/new/', { responseType: 'text' })
        .then(({ data }) => {
            let DOM = HTMLParser.parse(data),
                name = DOM.querySelectorAll('#account-menu')[0].childNodes[1].childNodes[0].rawText.replace(/^\s*(.+)\s*$/, '$1'),
                mapping = DOM.querySelectorAll('.adunit')
                    .map(({ childNodes }) => {
                        let id = getAttr(childNodes
                            .filter(({ tagName }) =>
                                tagName === 'input'
                            )[0].rawAttrs, 'value')

                        let name = childNodes
                            .filter(({ classNames }) => classNames && classNames.indexOf('adunit-name') !== -1)
                            .map(({ childNodes }) => childNodes[0].rawText)[0]

                        return { id, name }
                    })

            axios.get('https://app.mopub.com/web-client/api/ad-units/query')
                .then(({ data }) => {
                    resolveAdUnits(data.map(adunit => {
                        let { id } = mapping.filter(({ name, id }) => name === adunit.name)[0]
                        return {
                            ...adunit,
                            id
                        }
                    }))
                })

            // resolveAdUnits(
            //
            // )

            resolveName(name)
        })
}


function getAttr(rawAttrs, name) {
    if (getAttr.rx == null) {
        getAttr.rx = {}
    }

    if (getAttr.rx[name] == null) {
        getAttr.rx[name] = new RegExp(name + '="([^"]+)"')
    }

    let rx = getAttr.rx[name]

    if (rx.test(rawAttrs)) {
        return rawAttrs.match(rx)[1]
    } else {
        return ''
    }
}
