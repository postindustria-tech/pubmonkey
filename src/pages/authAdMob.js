
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
        let isGoogleAuthOpen = false
        const admob = tabs.filter(tab => {
            const url = new URL(tab.url);
            const domain = url.hostname;
            if (domain === "accounts.google.com" && tab.title === "AdMob") {
                isGoogleAuthOpen = true
            }
            return domain === "apps.admob.com";
        });

        let admobSessionUpdatedAt = localStorage.getItem("admobSessionUpdatedAt") || 0;

        if (admob.length === 0 && !isGoogleAuthOpen) {
            chrome.tabs.create({ url: "https://apps.admob.com/v2/home", active: false }, function (tab) {
                CJ.admobRequest = {
                    frameId: 0,
                    tabId: tab.id,
                };
                admobSessionUpdatedAt = Date.now();
            });
        } else if (admob.length !== 0) {
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

                let {name} = data;

                // resolveName(name);
            });
        }

        // Refresh mopub's tab every 5 minutes for a valid csrf token
        if ((Number(admobSessionUpdatedAt) + 1000 * 60 * 5) < Date.now()) {
            admobSessionUpdatedAt = Date.now();
            localStorage.setItem("admobSessionUpdatedAt", admobSessionUpdatedAt.toString());
            if (CJ.admobRequest) {
                chrome.tabs.reload(CJ.admobRequest.tabId);
            }
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
            //"https://apps.admob.com"
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
    console.log("open login page")
    chrome.tabs.query({active: false}, function (tabs) {
        let isGoogleAuthOpen = false
        let authTabId = 0
        const admob = tabs.filter(tab => {
            const url = new URL(tab.url);
            const domain = url.hostname;
            console.log(tab)
            if (domain === "accounts.google.com" && tab.title === "AdMob") {
                isGoogleAuthOpen = true
                authTabId = tab.id
            }
            return domain === "apps.admob.com";
        });

        if (admob.length === 0 && !isGoogleAuthOpen) {
            CJ.checkAdMobTab()
            setTimeout(() => CJ.openLoginPage(), 1000)
        } else if (admob.length !== 0) {
            CJ.openLoginPageInTab(admob[0].id)
        } else {
            CJ.openLoginPageInTab(authTabId)
        }
    });
};

CJ.openLoginPageInTab = function(tabId) {
    console.log(tabId)
    chrome.tabs.update(tabId, {selected: true}, function () {
        chrome.tabs.onUpdated.addListener(function handler(
            _tabId,
            {status, url}
        ) {
            if (
                tabId === _tabId &&
                (status === "loading" || status === "Complete") &&
                (url === "https://apps.admob.com" || url === "https://apps.admob.com/v2/home")
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


CJ.adMobLogout = function() {
    chrome.tabs.query(
        { active:false },
        function(tabs) {

            let admob = tabs.filter(tab => {
                const url = new URL(tab.url);
                const domain = url.hostname;
                return domain === "apps.admob.com";
            });
            if (admob.length === 0) {
                chrome.tabs.create({ url: "https://apps.admob.com/v2/home", active: false }, function (tab) {
                });
                setTimeout(() => CJ.adMobLogout(), 3000)

            } else {
                let code = `document.querySelectorAll('[aria-label*="Google account"]')[0].click()`;
                chrome.tabs.executeScript(admob[0].id, { code }, function (result) {
                    console.log("click account")
                });

                code = `document.getElementsByTagName('material-button')[10].click()`;
                chrome.tabs.executeScript(admob[0].id, { code }, function (result) {
                    console.log("click logout")
                });
            }
        }
    );
}

CJ.closeAdmobAuthTab = function() {
    chrome.tabs.remove(
        CJ.admobRequest.tabId,
        function(tabs) {
            CJ.admobRequest.tabId = 0
            CJ.admobRequest.isPendingUrl = false
        }
    );
}

