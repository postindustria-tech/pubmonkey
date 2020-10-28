
const CJ = (window.AdMobAutomation = {}),
    EXTENSION_URL = chrome.extension.getURL("index.html");

var resolveName, resolveAdUnits;

CJ.username = new Promise(resolve => (resolveName = resolve));
CJ.adunits = new Promise(resolve => (resolveAdUnits = resolve));

chrome.tabs.query({ url: EXTENSION_URL}, tabs =>
    tabs.forEach(({active, id}) => !active && chrome.tabs.remove(id))
);

CJ.checkAdMobTab = function(){
    chrome.tabs.query({ active:false }, function (tabs) {
        const admob = tabs.filter(tab => {
            const url = new URL(tab.url);
            const domain = url.hostname;
            return domain === "apps.admob.com";
        });

        if (admob.length === 0) {
            chrome.tabs.create({ url: "https://apps.admob.com/v2/home", active: false }, function (tab) {
                CJ.admobRequest = {
                    frameId: 0,
                    tabId: tab.id
                };
            });
        } else {
            let tabId = admob[0].id;
            let frameId = 0;

            // On enable need to add permission "webNavigation"
            // chrome.webNavigation.getAllFrames({ tabId: tabId }, function (details) {
            //     console.log(details);
            // });

            CJ.admobRequest = {
                frameId: 0,
                tabId: tabId
            };

            chrome.tabs.sendMessage(tabId, {action: "init"}, {frameId}, data => {
                if (!data) {
                    return;
                }

                console.log(data);
                let {name} = data;

                // resolveName(name);
            });
        }

    });
}

CJ.checkAdMobTab()

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
            "https://apps.admob.com/v2/home",
            "https://apps.admob.com"
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
        urls: ["https://apps.admob.com/*"],
        types: ["sub_frame"]
    },
    ["blocking", "responseHeaders"]
);

CJ.openLoginPage = function () {

    chrome.tabs.query({active: false}, function (tabs) {
        const admob = tabs.filter(tab => {
            const url = new URL(tab.url);
            const domain = url.hostname;
            return domain === "apps.admob.com";
        });

        if (admob.length === 0) {
            CJ.checkAdMobTab()
            setTimeout(() => CJ.openLoginPage(), 1000)
        } else {
            CJ.openLoginPageInTab(admob[0].id)
        }
    });
};

CJ.openLoginPageInTab = function(tabId) {
    chrome.tabs.update(tabId, {selected: true}, function () {
        chrome.tabs.onUpdated.addListener(function handler(
            _tabId,
            {status, url}
        ) {
            if (
                tabId === _tabId &&
                status === "loading" &&
                (url === "https://apps.admob.com" || url === "https://apps.admob.com/")
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
}
