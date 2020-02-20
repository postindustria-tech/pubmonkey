import axios from 'axios'

window.onload = () => {
    if(window.self !== window.top) {
        const headers = {
                'x-requested-with': 'XMLHttpRequest',
                'x-csrftoken': document.cookie.replace(/.*csrftoken=([^;]+)\;?.*/g, '$1')
            }

        let accountContainer = document.querySelectorAll('nav div span.Icon')[0],
            name = accountContainer ? accountContainer.parentNode.innerText.trim() : ''

        // initialization
        chrome.runtime.sendMessage({
            name
        })

        chrome.runtime.onMessage.addListener(({ action, payload }, { id }, sendResponse) => {
            try {
                if (action === 'reload') {
                    // console.log('iframe reloaded!')
                    location.reload();
                    return true
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

                    payload.headers = headers;

                    axios(payload)
                        .then(({ data }) => sendResponse({ ok: true, data }))
                        .catch(err => sendResponse({ ok: false, error: err.response.data }));

                    return true
                }
            } catch(err) {
                sendResponse({ ok: false, error: err })
                return true
            }

        });
    }
}
