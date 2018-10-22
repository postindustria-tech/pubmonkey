import axios from 'ex-axios'
import HTMLParser from 'fast-html-parser'

const CJ = window.MopubAutomation = {},
      EXTENSION_URL = chrome.extension.getURL('index.html')

chrome.tabs.query({
    url: EXTENSION_URL
}, tabs =>
    tabs.forEach(({ active, id }) =>
        !active && chrome.tabs.remove(id)
    )
)

var resolveLoggedIn
CJ.loggedIn = new Promise(resolve => resolveLoggedIn = resolve)

chrome.webRequest.onHeadersReceived.addListener(({ statusCode }) => {
    if (statusCode === 302) {
        resolveLoggedIn(false)
    } else {
        resolveLoggedIn(true)
    }
}, {
    urls: [ 'https://app.mopub.com/web-client/api/orders/query', 'https://app.mopub.com/advertise/orders/new/' ]
})

chrome.webRequest.onHeadersReceived.addListener(
    ({ responseHeaders }) => ({
        responseHeaders: responseHeaders.filter(({ name }) =>
            name !== 'x-frame-options'
    ) }),
    {
     urls: [ 'https://app.mopub.com/*' ],
     types: [ 'sub_frame' ]
    },
    [ 'blocking', 'responseHeaders' ]
)

CJ.openLoginPage = function() {
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

// parseUserName()
let resolveName, resolveAdUnits
CJ.username = new Promise(resolve => resolveName = resolve)
CJ.adunits = new Promise(resolve => resolveAdUnits = resolve)
function parseUserName() {
    let resolveName, resolveAdUnits

    CJ.username = new Promise(resolve => resolveName = resolve)
    CJ.adunits = new Promise(resolve => resolveAdUnits = resolve)

    axios.get('https://app.mopub.com/advertise/orders/new/', { responseType: 'text' })
        .then(({ data }) => {
            let DOM = HTMLParser.parse(data),
                name = DOM.querySelector('#account-menu').childNodes[1].firstChild.rawText.replace(/^\s*(.+)\s*$/, '$1'),
                mapping = DOM.querySelectorAll('tr.app')
                    .map(root => {
                        let appName = parseEscaped(root.querySelector('strong').firstChild.rawText)

                        return root.querySelectorAll('.adunit')
                            .map(({ childNodes }) => {
                                let id = getAttr(childNodes
                                    .filter(({ tagName }) =>
                                        tagName === 'input'
                                    )[0].rawAttrs, 'value')

                                let name = childNodes
                                    .filter(({ classNames }) => classNames && classNames.indexOf('adunit-name') !== -1)
                                    .map(({ childNodes }) => childNodes[0].rawText)[0]

                                return { id, name, appName }
                            })
                    })
                    .reduce((acc, curr) => acc.concat(curr), [])

            axios.get('https://app.mopub.com/web-client/api/ad-units/query')
                .then(({ data }) => {
                    resolveAdUnits(
                        data.map(adunit => {
                            let { id } = mapping.filter(({ name, id, appName }) => name === adunit.name && appName === adunit.appName)[0]
                            return {
                                ...adunit,
                                id
                            }
                        })
                        .sort((a, b) => {
                            if (a.appName > b.appName) {
                                return 1
                            }

                            if (a.appName < b.appName) {
                                return -1
                            }

                            return 0
                        })
                    )
                })

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

function parseEscaped(string) {
    let { parser } = parseEscaped

    if (parser == null) {
        parser = parseEscaped.parser = new DOMParser
    }

    return parser.parseFromString(string,'text/html').body.textContent
}
