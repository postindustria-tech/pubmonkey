import axios from "ex-axios";
import HTMLParser from "fast-html-parser";

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
        // console.log(domain);
        return domain === "app.mopub.com";
    });

    console.log(mopub);

    if (mopub.length === 0) {
        chrome.tabs.create({ url: "https://app.mopub.com/account", active: false });
    } else {

        let tabId = mopub[0].id;
        let frameId = 0;

        chrome.webNavigation.getAllFrames({ tabId: tabId }, function (details) {
            console.log(details);
        });

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
        console.log({frameId, tabId});
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

// parseAdUnits();

function parseAdUnits() {
    axios
        .get("https://app.mopub.com/account/", {responseType: "text"})
        .then(({data}) => {
            // let DOM = HTMLParser.parse(data),
            //     mapping = DOM.querySelectorAll('tr.app')
            //         .map(root => {
            //             let appName = parseEscaped(root.querySelector('strong').firstChild.rawText)
            //
            //             return root.querySelectorAll('.adunit')
            //                 .map(({ childNodes }) => {
            //                     let id = getAttr(childNodes
            //                         .filter(({ tagName }) =>
            //                             tagName === 'input'
            //                         )[0].rawAttrs, 'value')
            //
            //                     let name = childNodes
            //                         .filter(({ classNames }) => classNames && classNames.indexOf('adunit-name') !== -1)
            //                         .map(({ childNodes }) => childNodes[0].rawText)[0]
            //
            //                     return { id, name, appName }
            //                 })
            //         })
            //         .reduce((acc, curr) => acc.concat(curr), [])

            axios
                .get("https://app.mopub.com/web-client/api/ad-units/query")
                .then(({data}) => {
                    resolveAdUnits(
                        data
                            .map(adunit => {
                                // let { id } = mapping.filter(({ name, id, appName }) => name === adunit.name && appName === adunit.appName)[0]
                                return {
                                    ...adunit
                                    // id
                                };
                            })
                            .sort((a, b) => {
                                if (a.appName > b.appName) {
                                    return 1;
                                }

                                if (a.appName < b.appName) {
                                    return -1;
                                }

                                return 0;
                            })
                    );
                });
        })
        .catch(error => {
            console.log({error});
            ModalWindowService.ErrorPopup.showMessage("Network error");
        });
}

function getAttr(rawAttrs, name) {
    if (getAttr.rx == null) {
        getAttr.rx = {};
    }

    if (getAttr.rx[name] == null) {
        getAttr.rx[name] = new RegExp(name + '="([^"]+)"');
    }

    let rx = getAttr.rx[name];

    if (rx.test(rawAttrs)) {
        return rawAttrs.match(rx)[1];
    } else {
        return "";
    }
}

function parseEscaped(string) {
    let {parser} = parseEscaped;

    if (parser == null) {
        parser = parseEscaped.parser = new DOMParser();
    }

    return parser.parseFromString(string, "text/html").body.textContent;
}
