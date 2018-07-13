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

    POST(url, data, config = {}) {
        return axios({
            url,
            data,
            method: 'post',
            // xsrfCookieName: 'csrftoken',
            // xsrfHeaderName: 'x-csrftoken',
            headers: {
                'x-requested-with': 'XMLHttpRequest',
                'x-csrftoken': csrftoken
            },
            ...config
        }).then(({ data }) => data)
    }
}
