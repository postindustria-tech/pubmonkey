
const CJ = (window.MopubAutomation = {}),
    EXTENSION_URL = chrome.extension.getURL("index.html");

var resolveName, resolveAdUnits;

CJ.username = new Promise(resolve => (resolveName = resolve));
CJ.adunits = new Promise(resolve => (resolveAdUnits = resolve));

CJ.refreshMopub = () => {
    // Refresh mopub's tab every 5 minutes for a valid csrf token
    let mopubSessionUpdatedAt = localStorage.getItem("mopubSessionUpdatedAt") || 0;

    if ((Number(mopubSessionUpdatedAt) + 1000 * 60 * 5) < Date.now()) {
        localStorage.setItem("mopubSessionUpdatedAt", (Date.now()).toString());
        chrome.tabs.reload(CJ.request.tabId);
    }
}

chrome.tabs.query({ url: EXTENSION_URL}, tabs =>
    tabs.forEach(({active, id}) => !active && chrome.tabs.remove(id))
);

chrome.tabs.query({ active:false }, function (tabs) {

    const mopub = tabs.filter(tab => {
        const url = new URL(tab.url);
        const domain = url.hostname;
        return domain === "app.mopub.com";
    });

    let mopubSessionUpdatedAt = localStorage.getItem("mopubSessionUpdatedAt") || 0;

    if (mopub.length === 0) {
        chrome.tabs.create({ url: "https://app.mopub.com/dashboard", active: false }, function (tab) {
            CJ.request = {
                frameId: 0,
                tabId: tab.id
            };
            mopubSessionUpdatedAt = Date.now();

            CJ.refreshMopub();
        });
    } else {
        let tabId = mopub[0].id;
        let frameId = 0;

        // On enable need to add permission "webNavigation"
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

            CJ.refreshMopub();
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
        if (statusCode === 200) {
            resolveLoggedIn(true);
        } else {
            resolveLoggedIn(false);
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

    chrome.tabs.query({active: false}, function (tabs) {
        const mopub = tabs.filter(tab => {
            const url = new URL(tab.url);
            const domain = url.hostname;
            return domain === "app.mopub.com";
        });

        let tabId = mopub[0].id;

        chrome.tabs.update(tabId, {selected: true}, function () {
            chrome.tabs.onUpdated.addListener(function handler(
                _tabId,
                {status, url}
            ) {
                if (
                    tabId === _tabId &&
                    status === "loading" &&
                    (url === "https://app.mopub.com/dashboard" ||
                        url === "https://app.mopub.com/dashboard/" ||
                        url === "https://app.mopub.com/new-app")
                ) {
                    // chrome.tabs.remove(tabId);
                    chrome.tabs.onUpdated.removeListener(handler);

                    let url = EXTENSION_URL;

                    chrome.tabs.query({url}, tabs =>
                        chrome.tabs.update(tabs[0].id, {url, active: true})
                    );
                }
            });
        });

    });
};
