import axios from 'axios'
import HTMLParser from 'fast-html-parser'
import { saveAs } from 'file-saver'

const API_URL = 'https://app.mopub.com/web-client/api',
      fileinput = document.createElement('input')

// let DATA = {
//    "order-name":"TestOrder546",
//    "order-advertiser":"Test546",
//    "order-description":"desc",
//   /* // "adgroup_type":"gtee",*/
//    "priority":"6",
//    /*// "network_app_id":"",
//    // "network_adunit_id":"",
//    // "network_account_id":"",
//    // "chartboost-app_signature":"",
//    // "chartboost-location":"",
//    // "custom-html_data":"",
//    // "custom_native-custom_event_class_name":"",
//    // "custom_native-custom_event_class_data":"",
//    // "custom_native-html_data":"",*/
//    "name":"Line Item Name546",
//    "start_datetime_0":"",
//    "start_datetime_1":"",
//    "end_datetime_0":"",
//    "end_datetime_1":"",
//    "form-TOTAL_FORMS":2,
//    "form-INITIAL_FORMS":0,
//    "form-MIN_NUM_FORMS":0,
//    "form-MAX_NUM_FORMS":1000,
//    "form-0-model_id":"sentinel",
//    "form-0-weekdays":"Sat",
//    "form-0-start_time":"12:00 AM",
//    "form-0-end_time":"11:59 PM",
//    "form-1-model_id":"sentinel",
//    "form-1-start_time":"",
//    "form-1-end_time":"",
//    /*// "pmp-dsp":"d52411K0ec",
//    // "pmp-net_price":"",
//    // "pmp-notes":"",*/
//    // "mktplace_price_floor":0.05,
//    "budget":"",
//    "budget_type":"daily",
//    "bid":0.05,
//    "bid_strategy":"cpm",
//    "budget_strategy":"allatonce",
//    /*// "blind": 'False',
//    // "send_keywords":"on",*/
//    "adunits":772088,
//    "accept_targeted_locations":1,
//    "region_targeting_type":"all",
//    "connectivity_targeting_type":"all",
//    "device_targeting":0,
//    "target_iphone":"on",
//    "target_ipod":"on",
//    // "target_ipad":"on",
//    "ios_version_min":'2.0',
//    "ios_version_max":'999',
//    "target_android":"on",
//    "android_version_min":1.5,
//    "android_version_max":999,
//    "target_other":"on",
//    "keywords":"",
//    "allocation_percentage":100.0,
//    "refresh_interval":0,
//    "impression_caps": []
// }

fileinput.setAttribute('type', 'file')
fileinput.setAttribute('accept', 'application/json')

fileinput.addEventListener('change', () => {
    if (fileinput.files && fileinput.files[0]) {
        let file = fileinput.files[0],
            reader = new FileReader

        reader.onload = e => {
            let orders = JSON.parse(e.target.result),
                formData = collectCreationData(orders[0].lineItems[0])

            axios({
                url: 'https://app.mopub.com/advertise/orders/new/',
                method: 'post',
                xsrfCookieName: 'csrftoken',
                xsrfHeaderName: 'x-csrftoken',
                headers: {
                    'x-requested-with': 'XMLHttpRequest'
                },
                data: formData
            }).then(result => console.log(result))

            fileinput.value = ''
        }

        reader.readAsText(file)
    }
})

function collectCreationData(data) {
    let formData = new FormData

    Object.keys(data).forEach(key => {
        if (['form-0-weekdays', 'adunits', 'targeted_countries'].includes(key)) {
            if (Array.isArray(data[key])) {
                data[key].forEach(value => formData.append(key, value))
            }
        } else {
            formData.append(key, data[key])
        }
    })

    return formData
}

chrome.runtime.onMessage.addListener(({ action }) => {
    if (action === 'backup_orders') {
        axios.get(`${API_URL}/orders/query`)
            .then(({ data: orders }) => Promise.all(
                orders.map(({ key }) =>
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
                )
            ))
            // .then(result => console.log(result))
            .then(result => saveAs(new File(
                [ JSON.stringify(result, null, '  ') ],
                'orders_backup.json',
                { type: 'application/json;charset=utf-8' }
            )))
    }

    if (action === 'restore_orders') {
        fileinput.click()
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
