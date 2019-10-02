import axios from "ex-axios";
import Promise from "bluebird";

let csrftoken = null;

// export function GetValidCSRFToken() {
//     chrome.cookies.get(
//         {url: "https://app.mopub.com", name: "csrftoken"},
//         ({value}) => {
//             csrftoken = value;
//             // console.log(value);
//             console.log("got a new CSRF token");
//         }
//     );
// }
//
// GetValidCSRFToken();

export const HTTPService = new (class {

    GET(url, config = {}) {
        return axios
            .get(url, {
                ...config
            })
            .then(({data}) => data)
            .catch(error => {
                let auth = false;
                if (error.response) {
                    if (error.response.status === 401) {
                        // window.MopubAutomation.openLoginPage();
                        ModalWindowService.ErrorPopup.showMessage(
                            "Please login to your MoPub account to continue",
                            "Not logged in"
                        );
                        auth = true;
                        return;
                    }
                }
                if (!auth) {
                    ModalWindowService.ErrorPopup.showMessage("Network error");
                }
            });
    }

    POST(url, data = {}, config = {}, isFormData) {
        if (!window.MopubAutomation.request) {
            return;
        }

        return new Promise((resolve, reject) => {
            let mopubSessionUpdatedAt = localStorage.getItem("mopubSessionUpdatedAt") || 0;
            if ((Number(mopubSessionUpdatedAt) + 1000 * 60 * 5) < Date.now()) {
                console.log('mopub CSRF token has expired');
                mopubSessionUpdatedAt = Date.now();
                localStorage.setItem("mopubSessionUpdatedAt", mopubSessionUpdatedAt.toString());

                let {tabId, frameId} = window.MopubAutomation.request;

                chrome.tabs.reload(tabId, {}, function () {
                    setTimeout(function () {
                        resolve();
                        // chrome.cookies.get(
                        //     {url: "https://app.mopub.com", name: "csrftoken"},
                        //     ({value}) => {
                        //         csrftoken = value;
                        //         console.log("got a new CSRF token");
                        //         resolve();
                        //     }
                        // );
                    }, 3000);
                });
            } else {
                resolve();
            }
        })
        .then(() => {

            return new Promise((resolve, reject) => {

                let {tabId, frameId} = window.MopubAutomation.request,
                    payload = {
                        isFormData,
                        url,
                        data,
                        method: "post",
                        // xsrfCookieName: 'csrftoken',
                        // xsrfHeaderName: 'x-csrftoken',
                        headers: {
                            // 'x-requested-with': 'XMLHttpRequest',
                            // referer: 'https://app.mopub.com/orders',
                            // origin: 'https://app.mopub.com',
                            // "x-csrftoken": csrftoken
                        },
                        ...config
                    };

                chrome.tabs.sendMessage(tabId, {action: "request", payload}, {frameId}, (result = {}) => {
                    // console.log('payload: ', payload);
                    let {ok, data, error} = result;
                    if (ok) {
                        resolve(data);
                    } else {
                        chrome.tabs.query({active: false}, function (tabs) {
                            const mopub = tabs.filter(tab => {
                                const url = new URL(tab.url);
                                const domain = url.hostname;
                                return domain === "app.mopub.com";
                            });

                            if (mopub.length === 0) {
                                alert("Mopub tab has been closed or refreshed. Operation aborted.");
                                reject();
                                return;
                            } else {
                                error = error || {errors: ["Fatal error"]};
                                let err = new Error(error.errors);
                                err.data = error;
                                reject(err);
                            }
                        });
                    }
                })
            });
        });
    }
})();
