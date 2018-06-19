import axios from 'axios'

var csrftoken

chrome.cookies.get({ url: 'https://app.mopub.com', name: 'csrftoken' }, ({ value }) =>
    csrftoken = value
)

const HTTPService = new class HTTP {
    GET(url) {
        return axios.get(url).then(({ data }) => data)
    }

    POST(url, data) {
        return axios({
            url,
            data,
            method: 'post',
            // xsrfCookieName: 'csrftoken',
            // xsrfHeaderName: 'x-csrftoken',
            headers: {
                'x-requested-with': 'XMLHttpRequest',
                'x-csrftoken': csrftoken
            }
        }).then(({ data }) => data)
    }
}

export { HTTPService }
