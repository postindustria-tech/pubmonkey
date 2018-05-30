import axios from 'axios'

const HTTPService = new class HTTP {
    GET(url) {
        return axios.get(url).then(({ data }) => data)
    }

    POST(url, data) {
        return axios({
            url,
            data,
            method: 'post',
            xsrfCookieName: 'csrftoken',
            xsrfHeaderName: 'x-csrftoken',
            headers: {
                'x-requested-with': 'XMLHttpRequest'
            }
        }).then(({ data }) => data)
    }
}

export { HTTPService }
