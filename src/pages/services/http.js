import axios from 'ex-axios'
import Promise from 'bluebird'

Promise.config({
    cancellation: true
})

axios.Promise = Promise

var csrftoken

chrome.cookies.get({ url: 'https://app.mopub.com', name: 'csrftoken' }, ({ value }) =>
    csrftoken = value
)

export const HTTPService = new class {
    GET(url, config = {}) {
        return axios.get(url, {
            ...config
        }).then(({ data }) => data)
    }

    POST(url, data = {}, config = {}, isFormData) {
        if (!window.MopubAutomation.request) {
            return
        }

        let { tabId, frameId } = window.MopubAutomation.request,
            payload = {
                isFormData,
                url,
                data,
                method: 'post',
                // xsrfCookieName: 'csrftoken',
                // xsrfHeaderName: 'x-csrftoken',
                headers: {
                    'x-requested-with': 'XMLHttpRequest',
                    // referer: 'https://app.mopub.com/orders',
                    // origin: 'https://app.mopub.com',
                    'x-csrftoken': csrftoken
                },
                ...config
            }


        return new Promise((resolve, reject) =>
            chrome.tabs.sendMessage(tabId, { action: 'request', payload }, { frameId }, ({ ok, data, error }) => {
                if (ok) {
                    resolve(data)
                } else {
                    let err = new Error

                    err.data = error

                    reject(err)
                }
        })
    )

        // return axios(data).then(({ data }) => data)
    }
}
