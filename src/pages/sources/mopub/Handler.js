import Factory from '../../sources/Factory'
import AbstractHandler from '../../sources/AbstractHandler'
import {AdvertiserFactory} from "./Factory";
import {FileService, HTTPService} from "../../services";
import Promise from "bluebird";
import {wrapSeries, delay} from "../helpers";
import {isEmpty, toDecimal, toInteger, toValidUI} from "../../helpers";
import {AD_SERVER_MOPUB, } from "../../constants/source";
import {
    AMAZON_KVP_FORMAT,
    AMAZON_PRICE_GRID,
    CREATIVE_GENERATION_POLICY,
    MOPUB_CREATIVE_FORMAT, PREBID_GROUP_ADVERTISERS
} from '../../constants/common';
import axios from "ex-axios";

const WEB_URL = "https://app.mopub.com";

Promise.config({
    // Enable cancellation
    cancellation: true
});

class Handler extends AbstractHandler {

    static source = AD_SERVER_MOPUB;

    sessionChecked = false;

    ADVERTISER_DEFAULT_NAME = {
        amazon: "Amazon Publisher Services (TAM)",
        clearbid: "ClearBid",
        openx: "Prebid.org",
        pubmatic: "PubMatic OpenWrap",
        pubnative: "PubNative HyBid",
        smaato: "Smaato Unified Bidding",
        apolloSDK: "OpenX Apollo SDK",
        apollo: "OpenX Apollo",
        bidmachine: "BidMachine"
    };

    defaultAdvertiser = 'amazon'

    FILTER_FN = [
        ({status}) => status !== "archived",
        ({status}) => status === "running",
        ({status}) => status === "paused",
        ({status}) => status === "archived"
    ];

    STATUS_OPTIONS = [
        {value: 0, label: "all except archived"},
        {value: 1, label: "running"},
        {value: 2, label: "paused"},
        {value: 3, label: "archived"}
    ];

    constructor() {
        super();
        this.setAdvertiserFactory(new AdvertiserFactory());
    }

    async isReady() {
        if (this.sessionChecked) {
            return window.MopubAutomation.loggedIn
                .then(loggedIn => {
                    return loggedIn;
                });
        } else {
            this.sessionChecked = true;
            return axios.get(`${WEB_URL}/account/`, {responseType: 'text'})
                .then(result => {
                    return window.MopubAutomation.loggedIn
                        .then(loggedIn => {
                            return loggedIn;
                        });
                });
        }
    }

    logout() {
        return HTTPService.POST(`${WEB_URL}/account/logout/`);
    }

    getAdvertiserByName(advertiserName) {
        let advertiser = null;
        Object.keys(this.ADVERTISER_DEFAULT_NAME).map((key, i) => {
            if (this.ADVERTISER_DEFAULT_NAME[key] === advertiserName) {
                advertiser = key;
            }
        });
        return advertiser;
    }

    getAccount() {
        return HTTPService.GET(`${WEB_URL}/account/`);
    }

    getAdUnits() {
        // return window.MopubAutomation.adunits;
        return HTTPService.GET(`${WEB_URL}/web-client/api/ad-units/query`);
    }

    getAdUnit(key) {
        return HTTPService.GET(`${WEB_URL}/web-client/api/ad-units/get?key=${key}&includeAdSources=true`);
    }

    getAllOrders() {
        return HTTPService.GET(`${WEB_URL}/web-client/api/orders/query`);
    }

    getOrder(id) {
        return HTTPService.GET(`${WEB_URL}/web-client/api/orders/get?key=${id}`);
    }

    getOrderWithLineItems(id) {
        return this.getOrder(id);
    }

    getLineItem(id) {
        return this.getLineItemInfo(id).then(data => {
            return this.getCreatives(data.key)
                .then(creatives => {
                    data.creatives = creatives;
                    return data;
                })
                // .then(creatives => ({
                //     creatives,
                //     ...data
                // }))
                ;
        });
    }

    getCreatives(lineItemId) {
        return HTTPService.GET(`${WEB_URL}/web-client/api/creatives/query?lineItemKey=${lineItemId}`);
    }

    createCreatives(data) {
        return HTTPService.POST(`${WEB_URL}/web-client/api/creatives/create`, data);
    }

    copyLineItem(data) {
        // { order:str, line_item:str, copy_creatives:bool }
        return HTTPService.POST(`${WEB_URL}/advertise/line_item_copy/`, data);
    }

    getLineItemInfo(id) {
        return HTTPService.GET(`${WEB_URL}/web-client/api/line-items/get?key=${id}`);
    }

    createOrder(data) {
        return HTTPService.POST(`${WEB_URL}/web-client/api/orders/create`, data);
    }

    createLineItems(data, callback) {
        return Promise.mapSeries(data.map(this.createLineItem), callback);
    }

    createLineItem(data) {
        return HTTPService.POST(`${WEB_URL}/web-client/api/line-items/create`, data).catch(async error => {
            //reload mopub page & try again
            let mopubSessionUpdatedAt = Date.now();
            localStorage.setItem("mopubSessionUpdatedAt", mopubSessionUpdatedAt.toString());
            let {tabId, frameId} = window.MopubAutomation.request;
            chrome.tabs.reload(tabId, {}, function () {
                console.log('reloading mopub page');
            });
            await delay(8000);
            return HTTPService.POST(`${WEB_URL}/web-client/api/line-items/create`, data)
        }).then(result => result);
    }

    updateOrderStatus(status, id) {
        return HTTPService.POST(`${WEB_URL}/web-client/api/order/update-status?key=${id}`, {status});
    }

    updateOrderStatusInSet(orders, status, step) {
        return wrapSeries(
            orders,
            ({key}) => this.updateOrderStatus(status, key),
            step
        );
    }

    updateOrder(data, id) {
        return HTTPService.POST(
            `${WEB_URL}/web-client/api/order/update-order?key=${id}`,
            data
        );
    }

    updateLineItem(data, id) {
        return HTTPService.POST(
            `${WEB_URL}/web-client/api/line-items/update?key=${id}`,
            data
        );
    }

    updateLineItemStatus(status, id) {
        let formData = new FormData();

        formData.append("ad_sources[]", id);
        formData.append("status", status);

        return HTTPService.POST(`${WEB_URL}/advertise/ad_source/status/`, formData);
    }

    updateLineItemStatusInSet(lineItems, status, step) {
        return wrapSeries(
            lineItems,
            ({key}) => this.updateLineItemStatus(status, key),
            step
        );
    }

    updateLineItems(lineItems, data, step) {
        return wrapSeries(
            lineItems,
            ({key}) => this.updateLineItem(data, key),
            step
        );
    }

    restoreOrder(data) {

        let orderRequest = {
            advertiser: data.advertiser,
            description: data.description,
            name: data.name
        };

        return this.createOrder(orderRequest).then(result => {
            return result;
        });
    }

    restoreLineItem(data, orderId, advertiser) {
        let {creatives} = data;

        if (["pubnative hybid", "smaato unified bidding", "clearbid", "pubmatic openbid"].indexOf(advertiser.toLocaleLowerCase()) !== -1) {
            creatives = [];
        }

        let lineItemInfo = {
            allocationPercentage: 100,
            bidStrategy: "cpm",
            budget: null,
            budgetStrategy: "allatonce",
            budgetType: "unlimited",
            dayPartTargeting: "alltime",
            deviceTargeting: false,
            end: null,
            frequencyCapsEnabled: false,
            includeConnectivityTargeting: "all",
            includeGeoTargeting: "all",
            maxAndroidVersion: "999",
            maxIosVersion: "999",
            minAndroidVersion: "1.5",
            minIosVersion: "2.0",
            priority: 12,
            refreshInterval: 0,
            start: "2019-05-01T00:00:00.000Z",
            startImmediately: true,
            targetAndroid: false,
            targetIOS: "unchecked",
            targetIpad: false,
            targetIphone: false,
            targetIpod: false,
            type: "non_gtee",
            userAppsTargeting: "include",
            userAppsTargetingList: []
        };
        let lineItem = {};
        for (let key in lineItemInfo) {
            if (!data.hasOwnProperty(key)) {
                lineItem[key] = lineItemInfo[key]
            } else {
                lineItem[key] = data[key]
            }
        }

        if (!isEmpty(data.networkType)) {
            lineItem.networkType = data.networkType;
            lineItem.type = data.type;
            lineItem.networkType = data.networkType;
            lineItem.enableOverrides = data.enableOverrides;
            lineItem.overrideFields = {
                custom_event_class_name: data.overrideFields.custom_event_class_name,
                custom_event_class_data: data.overrideFields.custom_event_class_data
            };
        }

        lineItem = {
            adUnitKeys: data.adUnitKeys,
            bid: data.bid,
            name: data.name,
            orderKey: orderId,
            keywords: data.keywords,
            ...lineItem
        };

        // let formData = LineItemModel.createFromJSON(data).toFormData()
        return this.createLineItem(lineItem, orderId).then(result => {
            if (creatives && (advertiser === "Amazon Publisher Services (TAM)"
                              || advertiser === "OpenX Apollo"
                              || advertiser === "Prebid.org")) {
                let lineItemKey = result.key;
                return Promise.mapSeries(
                    creatives,
                    (creative, index) => {
                        if (creative) {
                            creative.forEach((item) => {
                                if (item["adType"]) {
                                    let data = item
                                    data['lineItemKey'] = lineItemKey
                                    this.createCreatives(data)
                                }
                            })
                        }
                    }
                ).then(() => result);
            }
            return result;
        });
    }

    cloneLineItems(lineItems, times, step) {
        return wrapSeries(
            lineItems,
            ({key, orderKey}) =>
                this.getLineItem(key).then(lineItem =>
                    this.restoreLineItem(lineItem, orderKey)
                ),
            step,
            times
        );
    }

    collectOrderDataFromSet(orders, step, canceled) {
        return Promise.mapSeries(orders, ({key}, idx, orderCount) => {
            if (window.canceledExport) return;
            return this.collectOrderData(key, progress =>
                    step({
                        ...progress,
                        ordersDone: idx + 1,
                        orderCount
                    }),
                canceled
            );
        });
    }

    collectOrderData(id, step, canceled) {
        if (window.canceledExport) return;
        return this.getOrder(id).then(async order => {
            let {lineItems} = order;

            await delay(1000);

            return Promise.mapSeries(lineItems, ({key}, idx, lineItemCount) => {
                if (window.canceledExport) return;
                let timestamp = Date.now();

                return this.getLineItem(key)
                    .then(async result => {

                        await delay(500);

                        timestamp = Date.now() - timestamp;

                        if (step) {
                            step({
                                lineItemCount,
                                timestamp,
                                lineItemsDone: idx + 1
                            });
                        }

                        return result;
                    });
            }).then(lineItems => ({...order, lineItems}));
        });
    }

    restoreOrdersWithLineItems(orders, step) {
        return Promise.mapSeries(orders, (order, orderIdx, orderCount) => {
            let timestamp = Date.now();

            return this.restoreOrder(order)
                .then(result => {
                    console.log(result);
                    timestamp = Date.now() - timestamp;

                    step({
                        ordersDone: orderIdx + 1,
                        orderCount,
                        lineItemsDone: 1,
                        lineItemCount: order.lineItems.length,
                        timestamp
                    });

                    return result;
                })
                .then(({key}) => {
                    if (order.lineItems.length > 0) {
                        return Promise.mapSeries(order.lineItems, (lineItem, lineItemIdx, lineItemCount) => {
                            timestamp = Date.now();

                            return this.restoreLineItem(lineItem, key, order.advertiser).then(
                                async result => {

                                    await delay(Math.floor(lineItemIdx/50)*1000);
                                    if (lineItemIdx > 0 && lineItemIdx % 50 === 0) {
                                        let mopubSessionUpdatedAt = Date.now();
                                        localStorage.setItem("mopubSessionUpdatedAt", mopubSessionUpdatedAt.toString());
                                        let {tabId, frameId} = window.MopubAutomation.request;
                                        chrome.tabs.reload(tabId, {}, function () {
                                            console.log('reloading mopub page');
                                        });
                                        await delay(10000);
                                    }
                                    //console.log("restore line item")
                                    //console.log(result)
                                    timestamp = Date.now() - timestamp;

                                    step({
                                        ordersDone: orderIdx + 1,
                                        orderCount,
                                        lineItemCount: lineItemCount,
                                        lineItemsDone: lineItemIdx + 2,
                                        timestamp
                                    });

                                    return result;
                                }
                            );
                        });
                    }
                });
        });
    }

    promiseQuery(options) {
        return new Promise(function (resolve, reject) {
            chrome.tabs.query(options, resolve);
        });
    }

    promiseCreate(options) {
        return new Promise(function (resolve, reject) {
            chrome.tabs.create(options, resolve);
        });
    }

    async prepareMoPubTabForRequests() {
        let mopubSessionUpdatedAt = Date.now();
        localStorage.setItem("mopubSessionUpdatedAt", mopubSessionUpdatedAt.toString());
        let {tabId, frameId} = window.MopubAutomation.request;

        tabId = await this.promiseQuery({index: tabId})
            .then(tabs => {
                if (!tabs.length) {
                    return this.promiseQuery({active: false})
                        .then(tabs => {
                            const mopub = tabs.filter(tab => {
                                const url = new URL(tab.url);
                                const domain = url.hostname;
                                return domain === "app.mopub.com";
                            });
                            if (mopub.length === 0) {
                                // open new tab
                                return this.promiseCreate({url: "https://app.mopub.com/dashboard", active: false})
                                    .then(tab => {
                                        return tab.id;
                                    });
                            } else {
                                return mopub[0].id;
                            }
                        });
                } else {
                    return tabId;
                }
            });

        window.MopubAutomation.request = {
            frameId: 0,
            tabId: tabId
        };

        chrome.tabs.reload(tabId, {}, function () {
            console.log('reloading mopub page');
        });
        await delay(5000);
    }

    filterAdUnitParams(params){
        return [... new Set(params.adunits.map(key => {
            const adunit = params.adUnitsParams.find(adunit => adunit.key == key)
            return adunit.format =='custom' ? '320x50' : adunit.format
        }))]
        .map(format => params.adUnitsParams.find(adunit => adunit.format == format).key)
    }

    async createOrderDataFromSet(order, params, stepCallback) {

        await this.prepareMoPubTabForRequests();
        return this.createOrder(order).then(order => {
            const lineItems = this.advertiser.composerLineItems(order.key, params);
            stepCallback({
                ordersDone: 1,
                orderCount: 1,
                lineItemsDone: 1,
                lineItemCount: lineItems.length
            });
            return Promise.mapSeries(lineItems, (item, idx, lineItemCount) => {
                if(window.canceledExport){
                    return
                }
                delete item.childContentEligibility
                return this.createLineItem(item)
                    .then(lineItem => {
                        this.filterAdUnitParams(params).forEach(currentAdUnit => {
                            this.advertiser.createCreatives(
                                lineItem.key,
                                params,
                                this.createCreatives,
                                currentAdUnit
                            );
                        })
                        return lineItem;
                    })
                    .then(async result => {
                        // wait for last request
                        await delay(Math.floor(idx/50)*1000);
                        if (idx > 0 && idx % 50 === 0) {
                            let mopubSessionUpdatedAt = Date.now();
                            localStorage.setItem("mopubSessionUpdatedAt", mopubSessionUpdatedAt.toString());
                            let {tabId, frameId} = window.MopubAutomation.request;
                            chrome.tabs.reload(tabId, {}, function () {
                                console.log('reloading mopub page');
                            });
                            await delay(10000);
                        }

                        if (stepCallback) {
                            stepCallback({
                                ordersDone: 1,
                                orderCount: 1,
                                lineItemCount,
                                lineItemsDone: idx + 1
                            });
                        }

                        return result;
                    });
            }).then(lineItems => ({...order, lineItems}));
        });
    }

    downloadOrderDataFromSet(order, params, stepCallback) {
        return new Promise((resolve, reject) => {

            let data = {
                name: order.name,
                orderCount: 1
            };

            let lineItems = this.advertiser.composerLineItems(null, params);

            if (["amazon", "openx", "pubmatic"].indexOf(params.advertiser) !== -1) {
                lineItems = lineItems.map(lineItem => {
                    lineItem.creatives = this.filterAdUnitParams(params).map(currentAdUnit => this.advertiser.createCreatives(
                        lineItem.key,
                        params,
                        null,
                        currentAdUnit
                    ))
                    return lineItem;
                });
            }

            data.lineItemCount = lineItems.length;
            order.lineItems = lineItems;

            data.orders = [order];

            data = JSON.stringify(data, null, "  ");

            FileService.saveFile(data, `${order.name}.json`);

            resolve();
        });
    }

    createOrderData(id, step) {
        return this.getOrder(id).then(order => {
            let {lineItems} = order;

            return Promise.mapSeries(lineItems, ({key}, idx, lineItemCount) => {
                let timestamp = Date.now();

                return this.getLineItem(key).then(result => {
                    timestamp = Date.now() - timestamp;

                    if (step) {
                        step({
                            lineItemCount,
                            timestamp,
                            lineItemsDone: idx + 1
                        });
                    }

                    return result;
                });
            }).then(lineItems => ({...order, lineItems}));
        });
    }

    getOrderUrl(key) {
        return `https://app.mopub.com/order?key=${key}`;
    }

    getAdUnitUrl(key) {
        return `https://app.mopub.com/ad-unit?key=${key}`;
    }

    getAdUnitsCreativesCount(params) {
        let creatives = []
        this.filterAdUnitParams(params).forEach(currentAdUnit => {
            creatives = this.advertiser.createCreatives(
                null,
                params,
                null,
                currentAdUnit
            );
        })
        return { adUnits: params.adunits.length, creatives: creatives.length}
    }
}

Factory.registerHandler(Handler);