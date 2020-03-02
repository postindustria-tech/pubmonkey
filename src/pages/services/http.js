import axios from "ex-axios";
import Promise from "bluebird";

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
            let { tabId, frameId } = window.MopubAutomation.request,
                payload = {
                    isFormData,
                    url,
                    data,
                    method: 'post',
                    ...config
                };

             chrome.tabs.sendMessage(tabId, { action: 'request', payload }, { frameId }, (result = {}) => {
                let {ok, data, error} = result;

                if (ok) {
                    resolve(data);
                } else {
                    error = error || {errors: ["Fatal error"]};
                    error.errors = error.errors.map(error =>
                        typeof error === 'object' && error.hasOwnProperty('message')
                           ? error.message
                           : error
                    );
                    let err = new Error(error.errors);
                    err.data = error;
                    reject(err);
                }
             })
        })
    }
})();
