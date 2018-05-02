import axios from 'axios'
import { saveAs } from 'file-saver'

chrome.runtime.onMessage.addListener(({ action }) => {
    if (action === 'backup_orders') {
        axios.get('https://app.mopub.com/web-client/api/orders/query')
            .then(({ data: orders }) => Promise.all(
                orders.map(order =>
                    axios.get('https://app.mopub.com/web-client/api/orders/get?key=' + order.key)
                        .then(({ data }) => data)
                )
            ))
            .then(result => saveAs(new File(
                [ JSON.stringify(result) ],
                "orders_backup.json",
                { type: "application/json;charset=utf-8" }
            )))
    }
})
