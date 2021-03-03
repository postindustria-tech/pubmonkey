import Factory from '../../sources/Factory'
import AbstractHandler from '../../sources/AbstractHandler'
import {AdvertiserFactory} from "./Factory";
import {FileService, HTTPService} from "../../services";
import Promise from "bluebird";
import {wrapSeries, delay} from "../helpers";
import {isEmpty, toDecimal, toInteger, toValidUI} from "../../helpers";
import {AD_SERVER_ADMOB} from "../../constants/source";
import axios from "axios";

const WEB_URL = "https://apps.admob.com/v2";

Promise.config({
    // Enable cancellation
    cancellation: true
});

class Handler extends AbstractHandler {

    static source = AD_SERVER_ADMOB;

    sessionChecked = false;

    ADVERTISER_DEFAULT_NAME = {
        bidmachine: "BidMachine"
    };

    defaultAdvertiser = 'bidmachine'

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
        console.log('admob isReady');

        return axios.get(`${WEB_URL}/home`)
            .then(resp => {

                this.sessionChecked = true;

                // Mediation Groups
                let amrpd = resp.data.match(/var amrpd = '(.*)onAmrpdAvailableCallbacks/m);
                // console.log(amrpd);
                //@TODO: Add validations
                amrpd = amrpd[0].match(/'(.*)';/m);
                amrpd = amrpd[1];

                return amrpd.hexDecode()
            })
            .then(json => {

                const obj = JSON.parse(json);
                if (typeof obj[32] !== "undefined") {
                    console.log(obj[32]);
                    return true;
                }

                return false;

            }).catch(error => {
                console.error(error);
                return false;
            });
    }

    logout() {
        // return HTTPService.POST(`${WEB_URL}/account/logout/`);
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
        return axios.get(`${WEB_URL}/apps/list`)
            .then(resp => {

                // Apps
                let apd = resp.data.match(/var apd = '(.*)onApdAvailableCallbacks/m);
                //@TODO: Add validations
                apd = apd[0].match(/'(.*)';/m);
                apd = apd[1];
                const apps = JSON.parse(apd.hexDecode());

                // Adunits
                let aupd = resp.data.match(/var aupd = '(.*)onAupdAvailableCallbacks/m);
                //@TODO: Add validations
                aupd = aupd[0].match(/'(.*)';/m);
                aupd = aupd[1];
                const adunits = JSON.parse(aupd.hexDecode());

                return {apps, adunits}
            })
            .then(({apps, adunits}) => {
                console.log("apps adunits")
                console.log(apps, adunits);

                return adunits[1].reduce((acc, adunit) => {
                    if (adunit[9] === true) {
                        return acc;
                    }
                    const app = apps[1].find(object => object[1] === adunit[2]);
                    console.log(app);
                    let platform = '';
                    let os = '';
                    switch (app[3]) {
                        case 1:
                            platform = 'iOS';
                            os = 'iphone';
                            break;
                        case 2:
                            os = platform = 'Android';
                            break;
                    }
                    let format = '';
                    switch (adunit[14]) {
                        case 0:
                            format = 'Banner';
                            break;
                        case 1:
                            if (adunit[18] && adunit[18][2] === "Reward") {
                                format = 'Rewarded Video';
                                break;
                            }
                            format = 'Interstitial';
                            break;
                        case 3:
                            format = 'Native';
                            break;
                        case 8:
                            format = 'Rewarded Inerstitial';
                            break;
                        default:
                            console.log("format index")
                            console.log(adunit[14])
                    }
                    acc.push({
                        key: adunit[1],
                        name: adunit[3],
                        appKey: adunit[2],
                        appName: `${app[2]} (${platform})`,
                        appType: os.toLowerCase(),
                        format: format,
                    });
                    return acc;
                }, []);

            }).catch(error => {
                console.error(error);
            });
    }

    getAdUnit(key) {
    }

    getAllOrders() {

        return axios.get(`${WEB_URL}/mediation/groups/list`)
            .then(resp => {

                // Mediation Groups
                let mglpd = resp.data.match(/var mglpd = '(.*)onMglpdAvailableCallbacks/m);
                //@TODO: Add validations
                mglpd = mglpd[0].match(/'(.*)';/m);
                mglpd = mglpd[1];

                return JSON.parse(mglpd.hexDecode());
            })
            .then(groups => {
                console.log("orders")
                console.log(groups);
                return groups['1']['1'].reduce((acc, group) => {
                    if (Number(group['1']) === 0) {
                        return acc;
                    }
                    let platform = '';
                    switch (group['4'][1]) {
                        case 1:
                            platform = 'iOS';
                            break;
                        case 2:
                            platform = 'Android';
                            break;
                    }
                    let format = '';
                    switch (group['4'][2]) {
                        case 0:
                            format = 'Banner';
                            break;
                        case 1:
                            format = 'Interstitial';
                            break;
                        case 3:
                            format = 'Native';
                            break;
                        case 5:
                            format = 'Rewarded Video';
                            break;
                        default:
                            console.log("format index")
                            console.log(group['4'][2])
                    }
                    acc.push({
                        key: group['1'],
                        name: group['2'],
                        status: Number(group['3']) === 1 ? 'Enabled' : 'Paused',
                        platform: platform,
                        format: format,
                        adSource: group['5']['0']['9'],
                        lineItemCount: 0
                    });
                    return acc;
                }, []);
            }).catch(error => {
                console.error(error);
            });
    }

    getOrder(id) {
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
        console.log("create creatives")
        return HTTPService.POST(`${WEB_URL}/web-client/api/creatives/create`, data);
    }

    copyLineItem(data) {
        // { order:str, line_item:str, copy_creatives:bool }
        return HTTPService.POST(`${WEB_URL}/advertise/line_item_copy/`, data);
    }

    getLineItemInfo(id) {
        return HTTPService.GET(`${WEB_URL}/web-client/api/line-items/get?key=${id}`);
    }

    createOrder(data, params) {
        console.log("create order")
        //console.log("params:"+ params)

        let adType = ''
        try {
            adType = this.advertiser.NETWORK_CLASS.android.find(object => object.value === params.customEventClassName).label
        } catch (e) {
            try {
                adType = this.advertiser.NETWORK_CLASS.iphone.find(object => object.value === params.customEventClassName).label
            } catch (er) {
                adType = ''
            }
        }
        params.adType = adType;

        console.log(data, params);

        const lineItems = this.advertiser.composerLineItems(data, params);
        console.log(lineItems);

        const os = ((os) => {
            switch (os) {
                case "iphone":
                    return 1;
                case "android":
                    return 2;
                default:
                    return 0;
            }
        })(params.os);

        const format = ((format) => {
            switch (format) {
                case "Banner":
                    return 0;
                case "Interstitial":
                    return 1;
                case "Rewarded Video":
                    return 5;
                case "Native":
                    return 3;
            }
        })(params.adType);

        const body = {
            "1": data.name,
            "2": 1,
            "3": {
                "1": os,
                "2": format,//0 banner 1 inter 2? 3 native 5-rewarded?
                "3": params.adunits
            },
            "4": lineItems
        };
        console.log(body);

        return axios.get(`https://apps.admob.com/v2/home`)
            .then(resp => {
                let xsrfToken = resp.data.match(/xsrfToken: '(.*)'/m);
                console.log(xsrfToken[1]);
                return xsrfToken[1];
            })
            .then(token => {
                console.log(token);

                return new Promise((resolve, reject) => {

                    //@TODO: Do we need fetch f.sid?
                    let isAdMob = true,
                        url = 'https://apps.admob.com/mediationGroup/_/rpc/MediationGroupService/Create?rpcTrackingId=MediationGroupService.Create%3A1&f.sid=8901338717484996000',
                        data = {
                            '__ar': JSON.stringify(body)
                        };

                    // return new Promise((resolve, reject) => {
                    let {tabId, frameId} = window.AdMobAutomation.admobRequest,
                        payload = {
                            isAdMob,
                            url,
                            data,
                            method: "post",
                            headers: {
                                'x-framework-xsrf-token': token,
                                'x-same-domain': 1,
                                'content-type': 'application/x-www-form-urlencoded'
                            }
                        };
                    console.log(payload);

                    chrome.tabs.sendMessage(tabId, {action: "request", payload}, {frameId}, (result = {}) => {
                        console.log('payload: ', payload);
                        console.log('result: ', result);
                        let {ok, data, error} = result;
                        if (ok) {
                            resolve(data);
                        } else {
                            error = error || {errors: ["Fatal error"]};
                            error.errors = error.errors.map(error => {
                                return typeof error === 'object' && error.hasOwnProperty('message') ?
                                    error.message :
                                    error
                            });
                            // console.log(error);
                            let err = new Error(error.errors);
                            err.data = error;
                            reject(err);
                        }
                    })
                });
            })
            .catch(error => {
                console.error(error);
            });


        // return HTTPService.POST(`${WEB_URL}/web-client/api/orders/create`, data);
    }

    createLineItems(data, callback) {
        console.log("create lineitems")
        return Promise.mapSeries(data.map(this.createLineItem), callback);
    }

    createLineItem(data) {
        //console.log("create lineitems")
        //console.log(data)
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

    async createOrderDataFromSet(order, params, stepCallback) {
        console.log(params)
        return this.createOrder(order, params).then(result => {
            // return result;

            console.log(result);

            stepCallback({
                ordersDone: 1,
                orderCount: 1,
                lineItemsDone: 1,
                lineItemCount: 1
            });

        });

    }

    downloadOrderDataFromSet(order, params, stepCallback) {
        return new Promise((resolve, reject) => {

            let data = {
                name: order.name,
                orderCount: 1
            };

            let lineItems = this.advertiser.composerLineItems(null, params);

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
        return `${WEB_URL}/mediation/groups/${key}/edit`;
    }

    getAdUnitUrl(key) {
        return `https://apps.admob.com/v2/apps/${key}/adunits/list`;
    }
}

Factory.registerHandler(Handler);