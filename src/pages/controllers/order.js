import Promise from 'bluebird'
import moment from 'moment'
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
        return HTTPService.GET(`${WEB_URL}/advertise/line_items/${id}/edit/`, { responseType: 'text' })
            .then(data =>
                LineItemModel.createFromHTML(data, id).toJSON()
            ) //@TODO maybe it's not necessary to create instances for parsing only
    }

    copyLineItem(data) { // { order:str, line_item:str, copy_creatives:bool }
        return HTTPService.POST(`${WEB_URL}/advertise/line_item_copy/`, data)
    }

    getLineItemInfo(id) {
        return HTTPService.GET(`${WEB_URL}/web-client/api/line-items/get?key=${id}`)
    }

    createOrder(data) {
        return HTTPService.POST(`${WEB_URL}/advertise/orders/new/`, data)
    }

    createLineItem(data, id) {
        return HTTPService.POST(`${WEB_URL}/advertise/orders/${id}/new_line_item/`, data)
    }

    updateOrderStatus(status, id) {
        return HTTPService.POST(`${WEB_URL}/web-client/api/order/update-status?key=${id}`, { status })
    }

    updateOrderStatusInSet(orders, status, step) {
        return wrapSeries(orders, ({ key }) => this.updateOrderStatus(status, key), step)
    }

    updateOrder(data, id) {
        return HTTPService.POST(`${WEB_URL}/web-client/api/order/update-order?key=${id}`, data)
    }

    updateLineItem(data, id) {
        return HTTPService.POST(`${WEB_URL}/web-client/api/line-items/update?key=${id}`, data)
    }

    updateLineItemStatus(status, id) {
        let formData = new FormData

        formData.append('ad_sources[]', id)
        formData.append('status', status)

        return HTTPService.POST(`${WEB_URL}/advertise/ad_source/status/`, formData)
    }

    updateLineItemStatusInSet(lineItems, status, step) {
        return wrapSeries(lineItems, ({ key }) => this.updateLineItemStatus(status, key), step)
    }

    updateLineItems(lineItems, data, step) {
        return wrapSeries(lineItems, ({ key }) => this.updateLineItem(data, key), step)
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

    cloneLineItems(lineItems, times, step) {
        return wrapSeries(lineItems, ({ key, orderKey }) =>
            this.getLineItem(key)
                .then(lineItem =>
                    this.restoreLineItem(lineItem, orderKey)
                )
        , step, times)
    }

    collectOrderDataFromSet(orders, step) {
        return Promise.mapSeries(orders, ({ key },  idx, orderCount) =>
                    this.collectOrderData(key, progress => step({
                        ...progress,
                        ordersDone: idx + 1,
                        orderCount
                    }))
               )
    }

    collectOrderData(id, step) {
        return this.getOrder(id)
            .then(order => {
                let { lineItems } = order

                return Promise.mapSeries(lineItems, ({ key }, idx, lineItemCount) => {
                            let timestamp = Date.now()

                            return this.getLineItem(key).then(result => {
                                timestamp = Date.now() - timestamp

                                if (step) {
                                    step({
                                        lineItemCount,
                                        timestamp,
                                        lineItemsDone: idx + 1
                                    })
                                }

                                return result
                            })
                        }).then(lineItems => ({ ...order, lineItems }))
            })
    }

    restoreOrdersWithLineItems(orders, step) {
        return Promise.mapSeries(orders, (order, orderIdx, orderCount) => {
                let timestamp = Date.now()

                return OrderController.restoreOrder(order.lineItems[0]).then(result => {
                        timestamp = Date.now() - timestamp

                        step({
                            ordersDone: orderIdx + 1,
                            orderCount,
                            lineItemsDone: 1,
                            lineItemCount: order.lineItems.length,
                            timestamp
                        })

                        return result
                    })
                    .then(({ redirect }) => redirect.replace(/.+\/(.+)\//,'$1'))
                    .then(lineItemId => OrderController.getLineItemInfo(lineItemId))
                    .then(({ orderKey }) => {
                        if (order.lineItems.length > 1) {
                            return Promise.mapSeries(order.lineItems.slice(1), (lineItem, lineItemIdx, lineItemCount) => {
                                timestamp = Date.now()

                                return OrderController.restoreLineItem(lineItem, orderKey)
                                    .then(result => {
                                        timestamp = Date.now() - timestamp

                                        step({
                                            ordersDone: orderIdx + 1,
                                            orderCount,
                                            lineItemCount: lineItemCount + 1,
                                            lineItemsDone: lineItemIdx + 2,
                                            timestamp
                                        })

                                        return result
                                    })
                            })
                        }
                    })
            })
    }
}

function wrapSeries(collection, method, step, times = 1) {
    return Promise.mapSeries(collection, (item, idx, count) =>
        Promise.mapSeries(Array(times), (_, i) =>
            method(item).then(result => {
                step({
                    done: idx * times + i + 1,
                    count: count * times
                })

                return result
            })
        )
    )
}
