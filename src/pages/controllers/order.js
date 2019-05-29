import Promise from 'bluebird'
import moment from 'moment'
import {HTTPService, StorageService} from '../services'
import {LineItemModel} from '../models'

const WEB_URL = 'https://app.mopub.com'

export const OrderController = new class Order {
    getAllOrders() {
        return HTTPService.GET(`${WEB_URL}/web-client/api/orders/query`)
    }

    getOrder(id) {
        return HTTPService.GET(`${WEB_URL}/web-client/api/orders/get?key=${id}`)
    }

    getLineItem(id) {

        return this.getLineItemInfo(id)
            .then(data => {
                return this.getCreatives(data.key)
                    .then(creatives => ({
                        creatives,
                        ...data
                    }))
            });

        // return HTTPService.GET(`${WEB_URL}/advertise/line_items/${id}/edit/`, { responseType: 'text' })
        //     .then(data =>
        //         LineItemModel.createFromHTML(data, id).toJSON()
        //     ) //@TODO maybe it's not necessary to create instances for parsing only
        //     .then(data => {
        //         return this.getCreatives(data.key)
        //             .then(creatives => ({
        //                 creatives,
        //                 ...data
        //             }))
        //     })
    }

    getCreatives(lineItemId) {
        return HTTPService.GET(`${WEB_URL}/web-client/api/creatives/query?lineItemKey=${lineItemId}`)
    }

    createCreatives(data) {
        return HTTPService.POST(`${WEB_URL}/web-client/api/creatives/create`, data)
    }

    copyLineItem(data) { // { order:str, line_item:str, copy_creatives:bool }
        return HTTPService.POST(`${WEB_URL}/advertise/line_item_copy/`, data)
    }

    getLineItemInfo(id) {
        return HTTPService.GET(`${WEB_URL}/web-client/api/line-items/get?key=${id}`)
    }

    createOrder(data) {
        return HTTPService.POST(`${WEB_URL}/advertise/orders/new/`, data, {}, true)
    }

    createLineItem(data, id) {
        return HTTPService.POST(`${WEB_URL}/advertise/orders/${id}/new_line_item/`, data, {}, true)
    }

    createOrderNew(data) {
        return HTTPService.POST(`${WEB_URL}/web-client/api/orders/create`, data)
    }

    createLineItemsNew(data, callback) {
        return Promise.mapSeries(data.map(this.createLineItemNew), callback)
    }

    createLineItemNew(data) {
        return HTTPService.POST(`${WEB_URL}/web-client/api/line-items/create`, data)
    }

    updateOrderStatus(status, id) {
        return HTTPService.POST(`${WEB_URL}/web-client/api/order/update-status?key=${id}`, {status})
    }

    updateOrderStatusInSet(orders, status, step) {
        return wrapSeries(orders, ({key}) => this.updateOrderStatus(status, key), step)
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
        return wrapSeries(lineItems, ({key}) => this.updateLineItemStatus(status, key), step)
    }

    updateLineItems(lineItems, data, step) {
        return wrapSeries(lineItems, ({key}) => this.updateLineItem(data, key), step)
    }

    restoreOrder(data) {
        let {creatives, ...rest} = data

        rest['start_datetime_0'] = ''//moment().format('MM/DD/YYYY')
        rest['start_datetime_1'] = ''//moment().add(1, 'm').format('hh:mm A')
        rest['end_datetime_0'] = ''
        rest['end_datetime_1'] = ''

        // let formData = LineItemModel.createFromJSON(data).toFormData()
        return this.createOrder(rest)
            .then(result => {
                if (creatives) {
                    let lineItemKey = result.redirect.replace(/.*key=(.+)$/g, '$1')

                    return Promise.mapSeries(creatives,
                        ({extended, name, adType, format, trackingUrl, images: imageKeys}) =>
                            this.createCreatives({
                                extended, name, adType, format, trackingUrl, lineItemKey, imageKeys
                            }))
                        .then(() => result)
                }

                return result
            })
    }

    restoreLineItem(data, orderId) {
        let {creatives, ...rest} = data

        rest['start_datetime_0'] = ''//moment().format('MM/DD/YYYY')
        rest['start_datetime_1'] = ''//moment().add(1, 'm').format('hh:mm A')
        rest['end_datetime_0'] = ''
        rest['end_datetime_1'] = ''
// console.log(data, orderId)
        // let formData = LineItemModel.createFromJSON(data).toFormData()
        return this.createLineItem(rest, orderId)
            .then(result => {
                if (creatives) {
                    let lineItemKey = result.redirect.replace(/.*key=(.+)$/g, '$1')

                    return Promise.mapSeries(creatives,
                        ({extended, name, adType, format, trackingUrl, images: imageKeys}) =>
                            this.createCreatives({
                                extended, name, adType, format, trackingUrl, lineItemKey, imageKeys
                            }))
                        .then(() => result)
                }

                return result
            })
    }

    cloneLineItems(lineItems, times, step) {
        return wrapSeries(lineItems, ({key, orderKey}) =>
                this.getLineItem(key)
                    .then(lineItem =>
                        this.restoreLineItem(lineItem, orderKey)
                    )
            , step, times)
    }

    collectOrderDataFromSet(orders, step) {
        return Promise.mapSeries(orders, ({key}, idx, orderCount) =>
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
                let {lineItems} = order

                return Promise.mapSeries(lineItems, ({key}, idx, lineItemCount) => {
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
                }).then(lineItems => ({...order, lineItems}))
            })
    }

    restoreOrdersWithLineItems(orders, step) {
        return Promise.mapSeries(orders, (order, orderIdx, orderCount) => {
            let timestamp = Date.now()

            return OrderController.restoreOrder(order.lineItems[0])
                .then(result => {
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
                .then(({redirect}) => redirect.replace(/.*key=(.+)$/g, '$1'))
                .then(lineItemId => OrderController.getLineItemInfo(lineItemId))
                .then(({orderKey}) => {
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

    toInteger = num => Number((Number(num) * 100).toFixed(0));
    toDecimal = num => this.toValidUI(num / 100);
    toValidUI = num => Math.round(num * 100) / 100;

    createOrderDataFromSet(order, params, stepCallback) {

        return this.createOrderNew(order)
            .then(order => {

                let {
                    adunits,
                    step,
                    keywordStep,
                    keywordTemplate,
                    rangeFrom,
                    rangeTo,
                    lineItemInfo,
                    lineItemsNaming,
                    advertiser
                } = params;

                let lineItems = [],
                    bid;

                rangeFrom = this.toInteger(rangeFrom);
                rangeTo = this.toInteger(rangeTo);
                step = this.toInteger(step);

                let keywordAdvertiser = null,
                    mask = '{bid}';
                switch (advertiser) {
                    // case 'pubnative':
                        // keywordAdvertiser = 'pn_bid';
                        // break;
                    // case 'openx':
                        // keywordAdvertiser = 'hb_pb';
                        // break;
                    case 'amazon':
                        // keywordAdvertiser = 'amznslots:m320x50p';
                        mask = '{position}';
                        break;
                }

                let line = 1;
                for (bid = rangeFrom; bid <= rangeTo; bid += step) {

                    const bidDecimal = this.toDecimal(bid);
                    const s = this.toDecimal(step);

                    let name = lineItemsNaming.replace("{bid}", bidDecimal);

                    let keywords = [];
                    if (advertiser == 'amazon') {
                        for (let i = 0; i < keywordStep; i += 1) {
                            i = this.toValidUI(i);
                            // const keyword = `${keywordAdvertiser}${delimiter}${i}`;
                            const keyword = keywordTemplate.replace(mask, i + line);
                            keywords.push(keyword);
                        }
                        name = name.replace("{position}", line);
                        line++;
                    } else {
                        for (let i = bidDecimal; i < bidDecimal + s; i += keywordStep) {
                            i = this.toValidUI(i);
                            // const keyword = `${keywordAdvertiser}${delimiter}${i}`;
                            const keyword = keywordTemplate.replace(mask, i);
                            keywords.push(keyword);
                        }
                    }
                    lineItems.push({
                        adUnitKeys: adunits,
                        bid: bidDecimal,
                        name: name,
                        orderKey: order.key,
                        keywords: keywords,
                        ...lineItemInfo
                    });
                }

                stepCallback({
                    ordersDone: 1,
                    orderCount: 1,
                    lineItemsDone: 1,
                    lineItemCount: lineItems.length
                });

                return Promise.mapSeries(lineItems, (item, idx, lineItemCount) => {

                    return this.createLineItemNew(item)
                        .then(result => {

                            if (stepCallback) {
                                stepCallback({
                                    ordersDone: 1,
                                    orderCount: 1,
                                    lineItemCount,
                                    lineItemsDone: idx + 1
                                })
                            }

                            return result
                        })

                }).then(lineItems => ({...order, lineItems}))

            })
    }

    createOrderData(id, step) {
        return this.getOrder(id)
            .then(order => {
                let {lineItems} = order

                return Promise.mapSeries(lineItems, ({key}, idx, lineItemCount) => {
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
                }).then(lineItems => ({...order, lineItems}))
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
