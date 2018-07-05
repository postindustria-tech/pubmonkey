import axios, { CancelToken} from 'axios'

var csrftoken

chrome.cookies.get({ url: 'https://app.mopub.com', name: 'csrftoken' }, ({ value }) =>
    csrftoken = value
)

const HTTPService = new class HTTP {
    GET(url) {
        let source = CancelToken.source(),
            promise = axios.get(url, {
                cancelToken: source.token
            }).then(({ data }) => data)

        promise.cancel = msg => source.cancel(msg)

        return promise
        // return axios.get(url, {
        //     cancelToken: source.token
        // }).then(({ data }) => data)
    }

    POST(url, data) {
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
                cancelToken: source.token
            }).then(({ data }) => data)

        promise.cancel = msg => source.cancel(msg)

        return promise
    }
}

export { HTTPService }
