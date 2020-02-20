const CJ = (window.MopubAutomation = {}),
    EXTENSION_URL = chrome.extension.getURL("index.html");

var resolveName, resolveAdUnits, resolveLoggedIn;

CJ.username = new Promise(resolve => (resolveName = resolve));
CJ.adunits = new Promise(resolve => (resolveAdUnits = resolve));
CJ.loggedIn = new Promise(resolve => (resolveLoggedIn = resolve));


chrome.tabs.query({ url: EXTENSION_URL}, tabs =>
    tabs.forEach(({ active, id }) => !active && chrome.tabs.remove(id))
);

chrome.runtime.onMessage.addListener(({ name }, { frameId }) => {
    chrome.tabs.getCurrent(({ id: tabId }) => {
        CJ.request = {
            tabId,
            frameId
        }

        // console.log('iframe initialization', CJ.request)

        resolveName(name)
    })
})

// Refresh mopub's iframe every 5 minutes for a valid csrf token
setInterval(
    () => chrome.tabs.sendMessage(CJ.request.tabId, { action:'reload' }, { frameId: CJ.request.frameId }),
    5 * 60 * 1000
)

chrome.webRequest.onHeadersReceived.addListener(
    ({ responseHeaders }) =>
        ({
            responseHeaders: responseHeaders.filter(
                ({ name }) => name !== "x-frame-options"
            )
        })
    ,
    {
        urls: [
            '<all_urls>'
    ],
        types: ["sub_frame"]
    },
    ["blocking", "responseHeaders"]
);

const iframe = document.createElement('iframe')

document.body.append(iframe)

iframe.src = 'http://app.mopub.com/account'
iframe.height = 0
iframe.width = 0
iframe.style = 'border: none'


chrome.webRequest.onHeadersReceived.addListener(
    function handler({ statusCode }) {
        if (statusCode === 200) {
            resolveLoggedIn(true);
        } else {
            resolveLoggedIn(false);
        }

        chrome.webRequest.onHeadersReceived.removeListener(handler)
    },
    {
        urls: [
            "https://app.mopub.com/web-client/api/orders/query",
            "https://app.mopub.com/account/"
        ]
    }
);


CJ.openLoginPage = function () {
    chrome.tabs.create({ url: "https://app.mopub.com/dashboard", active: true }, function (tab) {
        chrome.tabs.onUpdated.addListener(function handler(tabId, { status, url }) {
            if (
                tabId === tab.id
                && status === 'loading'
                && (url.includes('//app.mopub.com/dashboard') || url.includes('//app.mopub.com/new-app'))
            ) {
                chrome.tabs.onUpdated.removeListener(handler);
                chrome.tabs.remove(tab.id);
                location.reload();
            }
        })
    })
};
