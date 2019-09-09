
const CJ = (window.MopubAutomation = {}),
    EXTENSION_URL = chrome.extension.getURL("index.html");

var resolveName, resolveAdUnits;

CJ.username = new Promise(resolve => (resolveName = resolve));
CJ.adunits = new Promise(resolve => (resolveAdUnits = resolve));

chrome.tabs.query({ url: EXTENSION_URL}, tabs =>
    tabs.forEach(({active, id}) => !active && chrome.tabs.remove(id))
);

chrome.tabs.query({ active:false }, function (tabs) {

    const mopub = tabs.filter(tab => {
        const url = new URL(tab.url);
        const domain = url.hostname;
        return domain === "app.mopub.com";
    });

    if (mopub.length === 0) {
        chrome.tabs.create({ url: "https://app.mopub.com/account", active: false }, function (tab) {
            // console.log(tab);
            CJ.request = {
                frameId: 0,
                tabId: tab.id
            };
        });
    } else {
        let tabId = mopub[0].id;
        let frameId = 0;

        // chrome.webNavigation.getAllFrames({ tabId: tabId }, function (details) {
        //     console.log(details);
        // });

        CJ.request = {
            frameId: 0,
            tabId: tabId
        };

        chrome.tabs.sendMessage(tabId, {action: "init"}, {frameId}, data => {
            if (!data) {
                return;
            }

            let {name} = data;

            resolveName(name);
        });
    }
});

chrome.webRequest.onHeadersReceived.addListener(
    ({frameId, tabId}) => {
        // console.log({frameId, tabId});
        if (frameId) {
            CJ.request = {frameId, tabId};

            chrome.tabs.sendMessage(tabId, {action: "init"}, {frameId}, data => {
                if (!data) {
                    return;
                }

                let {name} = data;

                resolveName(name);
            });
        }
    },
    {urls: ["https://app.mopub.com/*"]}
);

var resolveLoggedIn;
CJ.loggedIn = new Promise(resolve => (resolveLoggedIn = resolve));

chrome.webRequest.onHeadersReceived.addListener(
    ({statusCode}) => {
        if (statusCode === 302) {
            resolveLoggedIn(false);
        } else {
            resolveLoggedIn(true);
        }
    },
    {
        urls: [
            "https://app.mopub.com/web-client/api/orders/query",
            "https://app.mopub.com/account/"
        ]
    }
);

chrome.webRequest.onHeadersReceived.addListener(
    ({responseHeaders}) => ({
        responseHeaders: responseHeaders.filter(
            ({name}) => name !== "x-frame-options"
        )
    }),
    {
        urls: ["https://app.mopub.com/*"],
        types: ["sub_frame"]
    },
    ["blocking", "responseHeaders"]
);

CJ.openLoginPage = function () {
    chrome.tabs.create(
        {url: "https://app.mopub.com/account/login/"},
        ({id}) => {
            chrome.tabs.onUpdated.addListener(function handler(
                tabId,
                {status, url}
            ) {
                if (
                    tabId === id &&
                    status === "loading" &&
                    (url === "https://app.mopub.com/dashboard/" ||
                        url === "https://app.mopub.com/new-app")
                ) {
                    chrome.tabs.remove(id);
                    chrome.tabs.onUpdated.removeListener(handler);

                    let url = EXTENSION_URL;

                    chrome.tabs.query({url}, tabs =>
                        chrome.tabs.update(tabs[0].id, {url, active: true})
                    );
                }
            });
        }
    );
};
