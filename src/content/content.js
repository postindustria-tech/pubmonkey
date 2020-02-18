import axios from 'axios'

const isLoadedByFrame = window.self !== window.top

let headers = {
    'x-requested-with': 'XMLHttpRequest',
    'x-csrftoken': document.cookie.replace(/.*csrftoken=([^;]+)\;?.*/g, '$1')
};


if(isLoadedByFrame) {
    chrome.runtime.onMessage.addListener(({ action, payload }, { id }, sendResponse) => {
        try {
            if (action === 'init') {
                sendResponse({
                    name: document.querySelectorAll('nav div span.Icon')[0].parentNode.innerText.trim()
                })
            }

            if (action === 'request') {
                if (payload.isFormData) {
                    let formData = new FormData,
                        { data } = payload

                    Object.keys(data).forEach(key => {
                        if (
                            ['form-0-weekdays', 'adunits', 'targeted_countries'].includes(key)
                            && Array.isArray(data[key])
                        ) {
                            data[key].forEach(value => formData.append(key, value))
                        } else {
                            formData.append(key, data[key])
                        }
                    });

                    delete payload.isFormData
                    payload.data = formData
                }

                let response = (...args) => {
                    // console.log(args)
                    sendResponse(...args)
                };

                payload.headers = headers;

                axios(payload)
                    .then(({ data }) => data)
                    .then(data => response({ ok: true, data }))
                    .catch(error => {
                        response({ ok: false, error: error.response.data })
                    });

                return true
            }
        } catch(err) {
            sendResponse({ ok: false, error: err })
        }
    });
}
