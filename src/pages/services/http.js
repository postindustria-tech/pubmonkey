import axios, { CancelToken} from 'ex-axios'
import Promise from 'bluebird'

Promise.config({
    cancellation: true
})

// axios.Promise = Promise

var csrftoken

chrome.cookies.get({ url: 'https://app.mopub.com', name: 'csrftoken' }, ({ value }) =>
    csrftoken = value
)

export const HTTPService = new class {
    GET(url, config = {}) {
        let source = CancelToken.source(),
            promise = axios.get(url, {
                cancelToken: source.token,
                ...config
            }).then(({ data }) => data)

        promise.cancel = msg => source.cancel(msg)

        return promise
        // return axios.get(url, {
        //     cancelToken: source.token
        // }).then(({ data }) => data)
    }

    POST(url, data, config = {}) {
        let source = CancelToken.source(),
            promise = axios({
                url,
                data,
                method: 'post',
                // xsrfCookieName: 'csrftoken',
                // xsrfHeaderName: 'x-csrftoken',
                headers: {
                    'x-requested-with': 'XMLHttpRequest',
                    'x-csrftoken': csrftoken
                },
                cancelToken: source.token,
                ...config
            }).then(({ data }) => data)

        promise.cancel = msg => source.cancel(msg)

        return promise
    }
}
