import Factory from '../../sources/Factory'
import AbstractHandler from '../../sources/AbstractHandler'
import {AdvertiserFactory} from "./Factory";
import {FileService, HTTPService} from "../../services";
import Promise from "bluebird";
import {wrapSeries, delay} from "../helpers";
import {isEmpty, toDecimal, toInteger, toValidUI} from "../../helpers";
import {AD_SERVER_MOPUB} from "../../constants/source";
import {AMAZON_KVP_FORMAT, AMAZON_PRICE_GRID} from '../../constants/common';
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
        pubmatic: "PubMatic OpenBid",
        pubnative: "PubNative HyBid",
        smaato: "Smaato Unified Bidding",
    };

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

    lineItemInfo = {
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

    constructor() {
        super();
        this.setAdvertiserFactory(new AdvertiserFactory());
    }

    async isReady() {
        // console.log('isReady');
        if (this.sessionChecked) {
            return window.MopubAutomation.loggedIn
                .then(loggedIn => {
                    return loggedIn;
                });
        } else {
            this.sessionChecked = true;
            return axios.get(`${WEB_URL}/account/`, {responseType: 'text'})
                .then(result => {
                    // console.log(result);
                    // console.log(window.MopubAutomation.loggedIn);
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
        return HTTPService.POST(`${WEB_URL}/web-client/api/line-items/create`, data);
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

            if (creatives) {
                let lineItemKey = result.key;

                return Promise.mapSeries(
                    creatives,
                    ({
                         extended,
                         name,
                         adType,
                         format,
                         trackingUrl,
                         images: imageKeys
                     }) =>
                        this.createCreatives({
                            extended,
                            name,
                            adType,
                            format,
                            trackingUrl,
                            lineItemKey,
                            imageKeys
                        })
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
                                result => {
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

    composerLineItems(orderKey, params) {
        let {
            adunits,
            step,
            keywordStep,
            keywordTemplate,
            rangeFrom,
            rangeTo,
            lineItemsNaming,
            advertiser,
            networkClass,
            Ad_ZONE_ID,
            granularity,
            customEventData,
            amazonStartPrice,
            amazonStep,
            amazonPriceGrid,
            amazonCSVItems,
        } = params;

        let lineItemInfo = {...this.lineItemInfo},
            lineItems = [],
            bid;

        rangeFrom = toInteger(rangeFrom);
        rangeTo = toInteger(rangeTo);
        step = toInteger(step);

        let keywordAdvertiser = null,
            mask = "{bid}",
            maskPrice = "{price}";
        switch (advertiser) {
            // case 'pubnative':
            // keywordAdvertiser = 'pn_bid';
            // break;
            // case 'openx':
            // keywordAdvertiser = 'hb_pb';
            // break;
            case "amazon":
                // keywordAdvertiser = 'amznslots:m320x50p';
                mask = "{position}";
                maskPrice = "{price}";
                break;
        }

        const keywordStepDecimalPartLength = (keywordStep + "").replace(/^[-\d]+\./, "").length;
        let stepDecimalPartLength = (step + "").replace(/^[-\d]+\./, "").length;
        if (step >= 100) {
            stepDecimalPartLength--;
        }

        if (advertiser === "openx") {
            let bids = [], skip = false;
            switch (granularity) {
                case 'low':
                    step = rangeFrom = toInteger(0.5);
                    rangeTo = toInteger(5);
                    for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                        bids.push(toDecimal(bid).toFixed(2));
                    }
                    break;
                case 'med':
                    step = rangeFrom = toInteger(0.1);
                    rangeTo = toInteger(20);
                    for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                        bids.push(toDecimal(bid).toFixed(2));
                    }
                    break;
                case 'high':
                    skip = true;
                    step = rangeFrom = toInteger(0.1);
                    rangeTo = toInteger(20);
                    keywordStep = 0.01;
                    for (bid = rangeFrom; bid <= rangeTo; bid += step) {

                        const bidDecimal = toDecimal(bid).toFixed(2);

                        let keywords = [];
                        const to = +toValidUI(toDecimal(bid) + toDecimal(step)).toFixed(2);

                        for (let i = toInteger(bidDecimal); i < toInteger(to); i += toInteger(keywordStep)) {
                            const key = toDecimal(i);
                            const value = key.toFixed(keywordStepDecimalPartLength),
                                keyword = keywordTemplate.replace(mask, value);
                            keywords.push(keyword);
                        }

                        lineItems.push({
                            adUnitKeys: adunits,
                            bid: bidDecimal,
                            name: lineItemsNaming.replace("{bid}", bidDecimal),
                            orderKey: orderKey,
                            keywords: keywords,
                            ...lineItemInfo
                        });
                    }
                    break;
                case 'auto':
                    // 0.05 ... 5 (0.05)
                    step = rangeFrom = toInteger(0.05);
                    rangeTo = toInteger(5);
                    for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                        bids.push(toDecimal(bid).toFixed(2));
                    }
                    // 5.1 ... 10 (0.1)
                    step = toInteger(0.1);
                    rangeFrom = toInteger(5.1);
                    rangeTo = toInteger(10);
                    for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                        bids.push(toDecimal(bid).toFixed(2));
                    }
                    // 10.5 ... 20 (0.5)
                    step = toInteger(0.5);
                    rangeFrom = toInteger(10.5);
                    rangeTo = toInteger(20);
                    for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                        bids.push(toDecimal(bid).toFixed(2));
                    }
                    break;
                case 'dense':
                    // 0.01 ... 3 (0.01)
                    step = rangeFrom = toInteger(0.01);
                    rangeTo = toInteger(3);
                    for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                        bids.push(toDecimal(bid).toFixed(2));
                    }
                    // 3.05 ... 8 (0.05)
                    step = toInteger(0.1);
                    rangeFrom = toInteger(3.05);
                    rangeTo = toInteger(8);
                    for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                        bids.push(toDecimal(bid).toFixed(2));
                    }
                    // 8.5 ... 20 (0.5)
                    step = toInteger(0.5);
                    rangeFrom = toInteger(8.5);
                    rangeTo = toInteger(20);
                    for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                        bids.push(toDecimal(bid).toFixed(2));
                    }
                    break;
            }

            if (!skip) {
                lineItems = bids.map(bid => {
                    return {
                        adUnitKeys: adunits,
                        bid: bid,
                        name: lineItemsNaming.replace("{bid}", bid),
                        orderKey: orderKey,
                        keywords: [keywordTemplate.replace(mask, bid)],
                        ...lineItemInfo
                    }
                });
            }
        } else if (
            advertiser === "amazon"
            && AMAZON_PRICE_GRID.non_uniform == amazonPriceGrid
        ) {
            amazonCSVItems.map(line => {
                const match = line.match(AMAZON_KVP_FORMAT);
                const bidDecimal = parseFloat(match[2]);
                lineItems.push({
                    adUnitKeys: adunits,
                    bid: bidDecimal,
                    name: match[1],
                    orderKey: orderKey,
                    keywords: [line],
                    ...lineItemInfo
                });
            });
        } else {
            let startPriceIndex = 0;
            for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                const bidDecimal = toDecimal(bid),
                    s = toDecimal(step),
                    bidValue = bidDecimal.toFixed(stepDecimalPartLength);

                let name = lineItemsNaming.replace("{bid}", bidValue),
                    keywords = [];

                if (advertiser === "amazon") {
                    for (let i = 0; i < keywordStep; i += 1) {
                        i = toValidUI(i);
                        const keyword = keywordTemplate.replace(mask, i + bid/100).replace(maskPrice, (parseFloat(amazonStartPrice) + (i + startPriceIndex) * parseFloat(amazonStep)).toFixed(2));
                        keywords.push(keyword);
                    }
                    name = name.replace("{position}", bid/100).replace(maskPrice, (parseFloat(amazonStartPrice) + startPriceIndex * parseFloat(amazonStep)).toFixed(2));
                } else if (["smaato", "clearbid"].indexOf(advertiser) !== -1) {
                    keywords.push(keywordTemplate.replace(mask, bidDecimal.toFixed(keywordStepDecimalPartLength)));
                } else {
                    // openx, remove?
                    const to = +toValidUI(bidDecimal + s).toFixed(2);

                    for (let i = toInteger(bidDecimal); i < toInteger(to); i += toInteger(keywordStep)) {
                        const key = toDecimal(i);
                        const value = key.toFixed(keywordStepDecimalPartLength),
                            keyword = keywordTemplate.replace(mask, value);
                        keywords.push(keyword);
                    }
                }

                if (advertiser === "pubnative") {
                    lineItemInfo.type = "network";
                    lineItemInfo["networkType"] = "custom_native";
                    lineItemInfo["enableOverrides"] = true;
                    lineItemInfo["overrideFields"] = {
                        custom_event_class_name: networkClass.value,
                        custom_event_class_data: '{"pn_zone_id": "' + Ad_ZONE_ID + '"}'
                    };
                } else if (["smaato", "clearbid", "pubmatic"].indexOf(advertiser) !== -1) {
                    lineItemInfo.type = "network";
                    lineItemInfo["networkType"] = "custom_native";
                    lineItemInfo["enableOverrides"] = true;
                    lineItemInfo["overrideFields"] = {
                        custom_event_class_name: networkClass.value,
                        custom_event_class_data: customEventData
                    };
                }

                lineItems.push({
                    adUnitKeys: adunits,
                    bid: bidDecimal,
                    name: name,
                    orderKey: orderKey,
                    keywords: keywords,
                    ...lineItemInfo
                });
                startPriceIndex++
            }
        }

        return lineItems;
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

    async createOrderDataFromSet(order, params, stepCallback) {

        await this.prepareMoPubTabForRequests();

        return this.createOrder(order).then(order => {
            const lineItems = this.composerLineItems(order.key, params);

            stepCallback({
                ordersDone: 1,
                orderCount: 1,
                lineItemsDone: 1,
                lineItemCount: lineItems.length
            });

            const {creativeFormat, advertiser} = params;

            return Promise.mapSeries(lineItems, (item, idx, lineItemCount) => {
                return this.createLineItem(item)
                    .then(lineItem => {
                        if (["amazon", "openx", "pubmatic"].indexOf(advertiser) !== -1) {
                            this.createCreatives({
                                adType: "html",
                                extended: {
                                    htmlData: this.advertiser.getCreativeHtmlData(params),
                                    isMraid: advertiser === "amazon"
                                },
                                format: creativeFormat,
                                imageKeys: [],
                                lineItemKey: lineItem.key,
                                name: "Creative"
                            });
                        }
                        return lineItem;
                    })
                    .then(async result => {

                        // console.log(idx);
                        if (idx > 0 && idx % 50 === 0) {

                            // wait for last request
                            await delay(1000);
                            let mopubSessionUpdatedAt = Date.now();
                            localStorage.setItem("mopubSessionUpdatedAt", mopubSessionUpdatedAt.toString());
                            let {tabId, frameId} = window.MopubAutomation.request;
                            chrome.tabs.reload(tabId, {}, function () {
                                console.log('reloading mopub page');
                            });
                            // console.log('10000');
                            await delay(10000);
                        } else {
                            // console.log('50');
                            await delay(50);
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

            const lineItems = this.composerLineItems(null, params);

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
}

Factory.registerHandler(Handler);