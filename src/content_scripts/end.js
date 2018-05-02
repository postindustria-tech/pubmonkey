import axios from 'axios'
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
            console.log(JSON.parse(e.target.result))
        }

        reader.readAsText(file)
    }

})


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
