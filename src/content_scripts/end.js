import axios from 'axios'
import { saveAs } from 'file-saver'

const API_URL = 'https://app.mopub.com/web-client/api',
      fileinput = document.createElement('input')

let DATA = {
   "order-name":"TestOrder44",
   "order-advertiser":"Test44",
   "order-description":"",
   "adgroup_type":"gtee",
   "priority":"6",
   "network_app_id":"",
   "network_adunit_id":"",
   "network_account_id":"",
   "chartboost-app_signature":"",
   "chartboost-location":"",
   "custom-html_data":"",
   "custom_native-custom_event_class_name":"",
   "custom_native-custom_event_class_data":"",
   "custom_native-html_data":"",
   "name":"Line Item Name",
   "start_datetime_0":"",
   "start_datetime_1":"",
   "end_datetime_0":"",
   "end_datetime_1":"",
   "form-TOTAL_FORMS":2,
   "form-INITIAL_FORMS":0,
   "form-MIN_NUM_FORMS":0,
   "form-MAX_NUM_FORMS":1000,
   "form-0-model_id":"sentinel",
   "form-0-weekdays":"Sat",
   // "form-0-start_time":"12:00 AM",
   // "form-0-end_time":"11:59 PM",
   "form-0-start_time":'2018-04-27T05:04:35.645-07:00',
   "form-0-end_time":null,
   "form-1-model_id":"sentinel",
   "form-1-start_time":"",
   "form-1-end_time":"",
   "pmp-dsp":"d52411K0ec",
   "pmp-net_price":"",
   "pmp-notes":"",
   "mktplace_price_floor":0.05,
   "budget":"",
   "budget_type":"daily",
   "bid":0.05,
   "bid_strategy":"cpm",
   "budget_strategy":"allatonce",
   "blind": 'False',
   "send_keywords":"on",
   "adunits":772087,
   "accept_targeted_locations":1,
   "region_targeting_type":"all",
   "connectivity_targeting_type":"all",
   "device_targeting":0,
   "target_iphone":"on",
   "target_ipod":"on",
   "target_ipad":"on",
   "ios_version_min":'2.0',
   "ios_version_max":'999',
   "target_android":"on",
   "android_version_min":1.5,
   "android_version_max":999,
   "target_other":"on",
   "keywords":"",
   "allocation_percentage":100.0,
   "refresh_interval":0,
   "impression_caps":[]
}

fileinput.setAttribute('type', 'file')
fileinput.setAttribute('accept', 'application/json')

fileinput.addEventListener('change', () => {
    if (fileinput.files && fileinput.files[0]) {
        let file = fileinput.files[0],
            reader = new FileReader

        reader.onload = e => {
            // let orders = JSON.parse(e.target.result)

            let formData = new FormData

            Object.keys(DATA).forEach(key => {
                formData.append(key, DATA[key])
            })

            // axios.post(`${API_URL}/orders/new/`, formData).then(result => console.log(result))
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

            // orders.forEach(order => {
                // axios.post(`${API_URL}/orders/new/`, {
                //     'order-name': order.name,
                //     'order-advertiser': order.advertiser,
                //     'order-description': order.description
                // }).then(result => console.log(result))
            // })
            fileinput.value = ''
        }

        reader.readAsText(file)
    }

})

axios.get(`${API_URL}/line-items/get?key=87f12adfdc2246b18ee9792783042d90`).then(({ data }) => console.log(data))


chrome.runtime.onMessage.addListener(({ action }) => {
    if (action === 'backup_orders') {
        axios.get(`${API_URL}/orders/query`)
            .then(({ data: orders }) => Promise.all(
                orders.map(({ key }) =>
                    axios.get(`${API_URL}/orders/get?key=${key}`)
                        .then(({ data }) => data)
                )
            ))
            .then(result => saveAs(new File(
                [ JSON.stringify(result) ],
                'orders_backup.json',
                { type: 'application/json;charset=utf-8' }
            )))
    }

    if (action === 'restore_orders') {
        fileinput.click()
    }
})

// function createOrder(data) {
//     return axios.post(`${API_URL}/orders/new/`, data)
// }
