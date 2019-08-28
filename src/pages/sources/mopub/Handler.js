import Factory from '../../sources/Factory'
import AbstractHandler from '../../sources/AbstractHandler'
import {AdvertiserFactory} from "./Factory";
import {FileService, HTTPService} from "../../services";
import Promise from "bluebird";
import {wrapSeries} from "../helpers";
import {isEmpty, toDecimal, toInteger, toValidUI} from "../../helpers";
import {AD_SERVER_MOPUB} from "../../constants/source";

const WEB_URL = "https://app.mopub.com";

Promise.config({
    // Enable cancellation
    cancellation: true
});

class Handler extends AbstractHandler {

    static source = AD_SERVER_MOPUB;
    ADVERTISER_DEFAULT_NAME = {
        pubnative: "PubNative",
        openx: "Prebid.org",
        amazon: "Amazon HB"
    };

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
        return HTTPService.GET(
            `${WEB_URL}/web-client/api/creatives/query?lineItemKey=${lineItemId}`
        );
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

        if (advertiser.toLocaleLowerCase() === "pubnative") {
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
            return this.collectOrderData(
                key,
                progress =>
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
        return this.getOrder(id).then(order => {
            let {lineItems} = order;

            return Promise.mapSeries(lineItems, ({key}, idx, lineItemCount) => {
                if (window.canceledExport) return;
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
            Ad_ZONE_ID
        } = params;

        let lineItemInfo = this.lineItemInfo,
            lineItems = [],
            bid;

        rangeFrom = toInteger(rangeFrom);
        rangeTo = toInteger(rangeTo);
        step = toInteger(step);

        let keywordAdvertiser = null,
            mask = "{bid}";
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
                break;
        }

        let line = 1;
        const keywordStepDecimalPartLength = (keywordStep + "").replace(
            /^[-\d]+\./,
            ""
            ).length,
            stepDecimalPartLength = (step + "").replace(/^[-\d]+\./, "").length;

        for (bid = rangeFrom; bid <= rangeTo; bid += step) {
            const bidDecimal = toDecimal(bid),
                s = toDecimal(step),
                bidValue = bidDecimal.toFixed(stepDecimalPartLength);

            let name = lineItemsNaming.replace("{bid}", bidValue),
                keywords = [];

            if (advertiser == "amazon") {
                for (let i = 0; i < keywordStep; i += 1) {
                    i = toValidUI(i);
                    const keyword = keywordTemplate.replace(mask, i + line);
                    keywords.push(keyword);
                }
                name = name.replace("{position}", line);
                line++;
            } else {
                const to = +toValidUI(bidDecimal + s).toFixed(2);
                for (let i = bidDecimal; i < to; i += keywordStep) {
                    i = toValidUI(i);
                    const value = i.toFixed(keywordStepDecimalPartLength),
                        keyword = keywordTemplate.replace(mask, value);
                    keywords.push(keyword);
                }
            }

            if (advertiser == "pubnative") {
                lineItemInfo.type = "network";
                lineItemInfo["networkType"] = "custom_native";
                lineItemInfo["enableOverrides"] = true;
                lineItemInfo["overrideFields"] = {
                    custom_event_class_name: networkClass,
                    custom_event_class_data: '{"pn_zone_id": "' + Ad_ZONE_ID + '"}'
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
        }

        return lineItems;
    }

    createOrderDataFromSet(order, params, stepCallback) {
        return this.createOrder(order).then(order => {
            const lineItems = this.composerLineItems(order.key, params);

            stepCallback({
                ordersDone: 1,
                orderCount: 1,
                lineItemsDone: 1,
                lineItemCount: lineItems.length
            });

            const {creativeFormat, advertiser, adServerDomain} = params,
                [width, height] = creativeFormat.split("x");
            let creativeHtmlData = null;
            if (advertiser === "amazon") {
                creativeHtmlData =
                    '<div style="display:inline-block">\n' +
                    '    <div id="__dtbAd__" style="width:{width}px; height:{height}px; overflow:hidden;">\n' +
                    "        <!--Placeholder for the Ad --> \n" +
                    "    </div>\n" +
                    '    <script type="text/javascript" src="mraid.js"></script>\n' +
                    '    <script type="text/javascript" src="https://c.amazon-adsystem.com/dtb-m.js"> </script>\n' +
                    '    <script type="text/javascript">\n' +
                    '          amzn.dtb.loadAd("%%KEYWORD:amznslots%%", "%%KEYWORD:amzn_b%%", "%%KEYWORD:amzn_h%%");\n' +
                    "    </script>\n" +
                    "</div>";
                creativeHtmlData = creativeHtmlData
                    .replace("{width}", width)
                    .replace("{height}", height);
            }
            if (advertiser === "openx") {
                creativeHtmlData =
                    '<script src = "https://cdn.jsdelivr.net/npm/prebid-universal-creative@latest/dist/creative.js"></script>\n' +
                    "<script>\n" +
                    "   var ucTagData = {};\n" +
                    '   ucTagData.adServerDomain = "' +
                    adServerDomain +
                    '";\n' +
                    '   ucTagData.pubUrl = "%%KEYWORD:url%%";\n' +
                    '   ucTagData.targetingKeywords = "%%KEYWORDS%%";\n' +
                    '   ucTagData.hbPb = "%%KEYWORD:hb_pb%%";\n' +
                    "   try {\n" +
                    "       ucTag.renderAd(document, ucTagData);\n" +
                    "   } catch (e) {\n" +
                    "       console.log(e);\n" +
                    "   }\n" +
                    "</script>";
            }

            return Promise.mapSeries(lineItems, (item, idx, lineItemCount) => {
                return this.createLineItem(item)
                    .then(lineItem => {
                        if (advertiser === "amazon" || advertiser === "openx") {
                            this.createCreatives({
                                adType: "html",
                                extended: {
                                    htmlData: creativeHtmlData,
                                    isMraid: advertiser === "amazon"
                                },
                                format: creativeFormat,
                                imageKeys: [],
                                lineItemKey: lineItem.key,
                                name: "Creative"
                            });
                        }
                    })
                    .then(result => {
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

            FileService.saveFile(data, order.name);

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
}

Factory.registerHandler(Handler);