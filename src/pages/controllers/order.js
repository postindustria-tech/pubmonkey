import Promise from 'bluebird'
import { HTTPService, StorageService } from '../services'
import { LineItemModel } from '../models'

const WEB_URL = 'https://app.mopub.com'

export const OrderController = new class Order {
    getAllOrders() {
        return HTTPService.GET(`${WEB_URL}/web-client/api/orders/query`)
    }

    getOrder(id) {
        return HTTPService.GET(`${WEB_URL}/web-client/api/orders/get?key=${id}`)
    }

    getLineItem(id) {
        let promise = HTTPService.GET(`${WEB_URL}/advertise/line_items/${id}/edit/`),
            { cancel } = promise

        promise = promise
            .then(data =>
                LineItemModel.createFromHTML(data, id).toJSON()
            ) //@TODO maybe it's not necessary to create instances for parsing only

        promise.cancel = cancel

        return promise
    }

    copyLineItem(data) { // { order:str, line_item:str, copy_creatives:bool }
        return HTTPService.POST(`${WEB_URL}/advertise/line_item_copy/`, data)
    }

    getLineItemInfo(id) {
        return HTTPService.GET(`${WEB_URL}/web-client/api/line-items/get?key=${id}`)
    }

    createOrder(data) {
        // console.log(data)
        return HTTPService.POST(`${WEB_URL}/advertise/orders/new/`, data)
    }

    createLineItem(data, id) {
        return HTTPService.POST(`${WEB_URL}/advertise/orders/${id}/new_line_item/`, data)
    }

    updateOrderStatus(status, id) {
        return HTTPService.POST(`${WEB_URL}/web-client/api/order/update-status?key=${id}`, { status })
    }

    updateOrder(data, id) {
        return HTTPService.POST(`${WEB_URL}/web-client/api/order/update-order?key=${id}`, data)
    }


    updateLineItem(data, id) {
        return HTTPService.POST(`${WEB_URL}/web-client/api/line-items/update?key=${id}`, data)
    }

    restoreOrder(data) {
        data['start_datetime_0'] = moment().format('MM/DD/YYYY')
        data['start_datetime_1'] = moment().add(1, 'h').format('hh:mm A')
        data['end_datetime_0'] = ''
        data['end_datetime_1'] = ''

        let formData = LineItemModel.createFromJSON(data).toFormData()
        return this.createOrder(formData)
    }

    restoreLineItem(data, orderId) {
        data['start_datetime_0'] = moment().format('MM/DD/YYYY')
        data['start_datetime_1'] = moment().add(1, 'h').format('hh:mm A')
        data['end_datetime_0'] = ''
        data['end_datetime_1'] = ''
// console.log(data, orderId)
        let formData = LineItemModel.createFromJSON(data).toFormData()
        return this.createLineItem(formData, orderId)
    }

    collectOrderDataFromSet(orders, progressCallback) {
        let cancel,
            promise = Promise.mapSeries(orders, ({ key },  idx, orderCount) => {
                    let promise = this.collectOrderData(key, progress => progressCallback({
                        ...progress,
                        ordersDone: idx + 1,
                        orderCount
                    }))

                    cancel = promise.cancel

                    return promise
               })

        promise.cancel = msg => cancel(msg)

        return promise
    }

    collectOrderData(id, progressCallback) {
        let promise = this.getOrder(id),
            { cancel } = promise

        promise = promise
            .then(order => {
                let { lineItems } = order

                return Promise.mapSeries(lineItems, ({ key }, idx, lineItemCount) => {
                            let timestamp = Date.now(),
                                promise = this.getLineItem(key)

                            cancel = promise.cancel

                            return promise.then(result => {
                                timestamp = Date.now() - timestamp

                                if (progressCallback) {
                                    progressCallback({
                                        lineItemCount,
                                        timestamp,
                                        lineItemsDone: idx + 1
                                    })
                                }

                                return result
                            })
                        }).then(lineItems => ({ ...order, lineItems }))
            })

        promise.cancel = msg => cancel(msg)

        return promise
    }
}
