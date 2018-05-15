import axios from 'axios'
import HTMLParser from 'fast-html-parser'
import { saveAs } from 'file-saver'

const API_URL = 'https://app.mopub.com/web-client/api',
      fileinput = document.createElement('input')

fileinput.setAttribute('type', 'file')
fileinput.setAttribute('accept', 'application/json')

fileinput.addEventListener('change', () => {
    if (fileinput.files && fileinput.files[0]) {
        let file = fileinput.files[0],
            reader = new FileReader

        reader.onload = e => {
            let orders = JSON.parse(e.target.result),
                formData = collectCreationData(orders[0].lineItems[0])

            createNewOrder(formData)
                .then(result => console.log(result))

            fileinput.value = ''
        }

        reader.readAsText(file)
    }
})

function createNewOrder(formData) {
    return axios({
        url: 'https://app.mopub.com/advertise/orders/new/',
        method: 'post',
        xsrfCookieName: 'csrftoken',
        xsrfHeaderName: 'x-csrftoken',
        headers: {
            'x-requested-with': 'XMLHttpRequest'
        },
        data: formData
    })
}

function collectCreationData(data) {
    let formData = new FormData

    Object.keys(data).forEach(key => {
        if (
            ['form-0-weekdays', 'adunits', 'targeted_countries'].includes(key)
            && Array.isArray(data[key])
        ) {
            data[key].forEach(value => formData.append(key, value))
        } else {
            formData.append(key, data[key])
        }
    })

    return formData
}

chrome.runtime.onMessage.addListener(({ action }, sender, sendResponse) => {
    // if (action === 'backup_orders') {
    //     axios.get(`${API_URL}/orders/query`)
    //         .then(({ data: orders }) => Promise.all(
    //             orders.map(({ key }) =>
    //                 axios.get(`${API_URL}/orders/get?key=${key}`)
    //                     .then(({ data }) => {
    //                         return Promise.all(
    //                                 data.lineItems.map(({ key }) =>
    //                                     serializeLineItem(key)
    //                                 )
    //                             )
    //                             .then(lineItems => ({
    //                                 ...data,
    //                                 lineItems
    //                             }))
    //                     })
    //             )
    //         ))
    //         // .then(result => console.log(result))
    //         .then(result => saveAs(new File(
    //             [ JSON.stringify(result, null, '  ') ],
    //             'orders_backup.json',
    //             { type: 'application/json;charset=utf-8' }
    //         )))
    // }

    // if (action === 'restore_orders') {
    //     fileinput.click()
    // }

    if (action === 'restore_backup') {
        fileinput.click()
    }

    if (action === 'backup_current_order') {
        let key = location.search.slice(5)

        axios.get(`${API_URL}/orders/get?key=${key}`)
            .then(({ data }) => {
                return Promise.all(
                        data.lineItems.map(({ key }) =>
                            serializeLineItem(key)
                        )
                    )
                    .then(lineItems => ({
                        ...data,
                        lineItems
                    }))
            })
            // .then(result => console.log(result))
            .then(result => saveAs(new File(
                [ JSON.stringify(result, null, '  ') ],
                `backup.${key}.json`,
                { type: 'application/json;charset=utf-8' }
            )))
    }

    if (action === 'get_order_id') {
        if (location.toString().indexOf('order?key=') === -1) {
            sendResponse(false)
        } else {
            sendResponse(location.search.slice(5))
        }
    }
})

function serializeLineItem(id) {
    return axios.get(`https://app.mopub.com/advertise/line_items/${id}/edit/`)
        .then(({ data }) => {
            return {
                ...parseInputs(HTMLParser.parse(data).querySelectorAll('#order_and_line_item_form input')),
                ...parseTextareas(HTMLParser.parse(data).querySelectorAll('#order_and_line_item_form textarea')),
                ...parseSelects(HTMLParser.parse(data).querySelectorAll('#order_and_line_item_form select')),
                impression_caps: data.match(/impression_caps\:.+"(.+)".+,/)[1]
            }
        })
}

function parseSelects(selects) {
    let result = {}

    selects.forEach(select => {
        let value = select.childNodes
                .filter(({ tagName }) => tagName === 'option')
                .filter(({ rawAttrs }) => rawAttrs.indexOf('selected') !== -1)
                .map(({ rawAttrs }) => getAttr(rawAttrs, 'value')),
            name = getAttr(select.rawAttrs, 'name')

        if (name && value.length) {
            if (value.length === 1) {
                result[name] = value[0]
            } else {
                result[name] = value
            }
        }
    })

    return result
}

function parseTextareas(textareas) {
    let result = {}

    textareas.forEach(textarea => {
        let value = textarea.text,
            name = getAttr(textarea.rawAttrs, 'name')

        if (name) {
            result[name] = value
        }
    })

    return result
}

function parseInputs(inputs) {
    let result = {}

    inputs.forEach(({ rawAttrs }) => {
        let type = getAttr(rawAttrs, 'type'),
            name = getAttr(rawAttrs, 'name')

        if (type && name) {
            if (type === 'text' || type === 'hidden' || type === 'number') {
                result[name] = getAttr(rawAttrs, 'value')
            }

            if (type === 'checkbox') {
                let checked = rawAttrs.indexOf('checked') !== -1,
                    value = getAttr(rawAttrs, 'value')

                value = value || checked

                if (checked) {
                    if (result[name] == null) {
                        result[name] = value
                    } else {
                        if (Array.isArray(result[name])) {
                            result[name].push(value)
                        } else {
                            result[name] = [result[name], value]
                        }
                    }
                }
            }

            if (type === 'radio') {
                let checked = rawAttrs.indexOf('checked') !== -1,
                    value = getAttr(rawAttrs, 'value')

                if (checked) {
                    result[name] = value
                }
            }
        }
    })

    return result
}

function getAttr(rawAttrs, name) {
    if (getAttr.rx == null) {
        getAttr.rx = {}
    }

    if (getAttr.rx[name] == null) {
        getAttr.rx[name] = new RegExp(name + '="([^"]+)"')
    }

    let rx = getAttr.rx[name]

    if (rx.test(rawAttrs)) {
        return rawAttrs.match(rx)[1]
    } else {
        return ''
    }
}
