import Factory from '../../sources/Factory';
import AbstractHandler from '../../sources/AbstractHandler';
import {AdvertiserFactory} from "./Factory";
import {AD_SERVER_DFP, DFP_API_VERSION} from "../../constants/source";
import {DFP, FileService, HTTPService} from "../../services";
import Promise from "bluebird";
import {isEmpty, toDecimal, toInteger, toValidUI, deepClone} from "../../helpers";
import {
    Goal,
    Size,
    Money,
    ThirdPartyCreative,
    CustomCriteriaSet,
    CustomCriteria,
    LineItemCreativeAssociation
} from "./DataTypes";

// const networkCode = '21808260008';

class Handler extends AbstractHandler {

    static source = AD_SERVER_DFP;

    ADVERTISER_DEFAULT_NAME = {
        openx: "Prebid.org",
        amazon: "Amazon HB"
    };

    dfp = null;
    networkCode = null;

    static token = null;
    static user = null;

    lineItemInfo = {
        // startDateTime: null,
        startDateTimeType: "ONE_HOUR_FROM_NOW",
        // endDateTime: DateTime.from(new Date(), 'UTC'),
        unlimitedEndDateTime: true,
        creativeRotationType: "OPTIMIZED",
        lineItemType: "STANDARD",
        costPerUnit: null,
        valueCostPerUnit: Money(0, 'USD'),
        costType: "CPM",
        discountType: "PERCENTAGE",
        discount: "0.0",
        creativePlaceholders: [],
        budget: Money(0, 'USD'),
        status: "PAUSED",
        isArchived: "false",
        primaryGoal: Goal('NONE', 'IMPRESSIONS', 100),
        targeting: {
            geoTargeting: {
                targetedLocations: []
            },
            inventoryTargeting: {
                // targetedAdUnits: targetedAdUnits
            }
        }
    };

    constructor() {
        super();
        this.setAdvertiserFactory(new AdvertiserFactory());
        this.setNetworkCode();
    }

    setNetworkCode() {
        this.networkCode = localStorage.getItem("dfpNetworkCode") || null;
    }

    composeOrderRequest(advertiser, name) {
        return {
            name: name,
            notes: "",
            advertiserId: advertiser,
        }
    }

    getToken() {
        return new Promise((resolve, reject) => {
            chrome.identity.getAuthToken({interactive: true}, resolve);
        });
    }

    removeCachedAuthToken() {
        console.log(Handler.token);
        var url = 'https://accounts.google.com/o/oauth2/revoke?token=' + Handler.token;
        window.fetch(url);
        chrome.identity.removeCachedAuthToken({token: Handler.token}, function () {
            //token was removed from cache
            // window.location.reload();
        });
    }

    async getDfp() {
        if (!Handler.token) {
            Handler.token = await this.getToken();
        }
        // console.log(Handler.token);
        if (!this.dfp) {
            this.dfp = new DFP({networkCode: this.networkCode, apiVersion: DFP_API_VERSION, token: Handler.token});
        }
        // const Service = await this.dfp.getService('UserService');
        // Service.setToken(Handler.token);
        //
        // Handler.user = await Service.getCurrentUser({});
        // console.log(user);

        return this.dfp;
    }

    async _getByStatement(serviceName, filterStatement) {

        const Service = await this.getDfp().then(dfp => dfp.getService(serviceName));
        Service.setToken(Handler.token);

        switch (serviceName) {
            case "OrderService":
                return await Service.getOrdersByStatement({
                    filterStatement: filterStatement
                });
            case "LineItemService":
                return await Service.getLineItemsByStatement({
                    filterStatement: filterStatement
                });
            case "CompanyService":
                return await Service.getCompaniesByStatement({
                    filterStatement: filterStatement
                });
            case "InventoryService":
                return await Service.getAdUnitsByStatement({
                    filterStatement: filterStatement
                });
            case "CustomTargetingService":
                return await Service.getCustomTargetingKeysByStatement({
                    filterStatement: filterStatement
                });
            case "CreativeService":
                return await Service.getCreativesByStatement({
                    filterStatement: filterStatement
                });
            case "LineItemCreativeAssociationService":
                return await Service.getLineItemCreativeAssociationsByStatement({
                    filterStatement: filterStatement
                });
        }
    }

    async getOrder(id) {
        return new Promise(async (resolve, reject) => {
            const orders = await this._getByStatement('OrderService', {
                query: "WHERE OrderId = " + id
            });
            resolve(orders);
        }).then(orders => {
            let order = {};
            if (orders.totalResultSetSize > 0) {
                order = orders.results[0];
            }
            return order;
        });
    }

    getOrderWithLineItems(id) {
        return this.getOrder(id).then(async order => {
            let lineItems = await this.getAllLineItems([order.id]);
            lineItems.map(lineItem => {

                lineItem.adUnitKeys = lineItem.targeting.inventoryTargeting.targetedAdUnits.map(({adUnitId}) => {
                    return adUnitId;
                });
                lineItem.bid = Number(lineItem.costPerUnit.microAmount) / 1000000;

                return lineItem;
            });
            return {
                ...order,
                lineItems
            }
        })
    }

    async getAdUnits() {
        return this.getAllAdUnits();
    }

    async getAllOrders() {
        return new Promise(async (resolve, reject) => {
            try {
                let orders = await this._getByStatement('OrderService', {});

                if (orders.totalResultSetSize > 0) {
                    orders = orders.results.map(order => {
                        return {
                            ...order,
                            status: order.isArchived ? 'archived' : order.status
                        }
                    });
                    // console.log(orders);
                } else {
                    orders = [];
                }

                resolve(orders);
            } catch (err) {
                // console.log(err);
            }
        }).then(async orders => {

            // Use some cache?
            const advertisers = await this.getAllAdvertisers();

            const ids = orders.map(({id}) => {
                return id;
            });
            const lineItems = await this.getAllLineItems(ids);

            orders = orders.map(order => {
                return {
                    key: order.id,
                    name: order.name,
                    status: order.status,
                    advertiser: advertisers.find(advertiser => advertiser.id === order.advertiserId).name,
                    lineItemCount: lineItems.filter(({orderId}) => orderId === order.id).length
                }
            });

            // console.log(orders);

            return orders;
        });
    }

    async getAllLineItems(ids) {

        return new Promise(async (resolve, reject) => {

            let lineItems = await this._getByStatement('LineItemService', {
                query: 'WHERE OrderId IN (' + ids.join(',') + ')'
            });

            // console.log(lineItems);

            if (lineItems.totalResultSetSize > 0) {
                lineItems = lineItems.results;
            } else {
                lineItems = [];
            }

            resolve(lineItems);

        });
    }

    async getAllAdvertisers() {
        return new Promise(async (resolve, reject) => {
            try {
                let companies = await this._getByStatement('CompanyService', {});

                // console.log(companies.results);
                companies = companies.results;

                resolve(companies);
            } catch (err) {
                // console.log(err);
            }
        }).then(companies => {
            companies = companies.map(company => ({
                id: company.id,
                name: company.name,
                type: company.type
            }));

            return companies;
        });
    }

    /*async getAdvertiser(advertiserId) {
        return new Promise(async (resolve, reject) => {

            let companies = await this._getByStatement('CompanyService', {
                query: "WHERE id = " + advertiserId
            });

            // console.log(companies.results);
            companies = companies.results;

            resolve(companies[0]);
        });
    }*/

    async getCurrentUser() {
        return new Promise(async (resolve, reject) => {

            const Service = await this.getDfp().then(dfp => dfp.getService('UserService'));
            Service.setToken(Handler.token);

            Handler.user = await Service.getCurrentUser({});

            resolve(Handler.user);
        });
    }

    async getAllAdUnits() {
        return new Promise(async (resolve, reject) => {
            try {
                let adunits = await this._getByStatement('InventoryService', {
                    query: "WHERE status = 'ACTIVE'"
                });

                if (adunits.totalResultSetSize > 0) {
                    adunits = adunits.results;
                } else {
                    adunits = [];
                }
                adunits = adunits.filter(({hasChildren}) => !hasChildren);
                console.log(adunits);

                resolve(adunits);
            } catch (err) {
                // console.log(err);
            }
        }).then(adunits => {
            adunits = adunits.map(adunit => ({
                name: adunit.name,
                format: this.extractAdUnitSizes(adunit.adUnitSizes).join(', '),
                key: adunit.id,
                appName: "",
                appType: ""
            }));
            return adunits;
        });
    }

    extractAdUnitSizes(sizes) {
        if (isEmpty(sizes)) {
            return [];
        }
        return sizes.map(size => {
            return size.fullDisplayString
        });
    }

    async getCustomTargetingKeys(name) {
        return new Promise(async (resolve, reject) => {
            try {
                let keys = await this._getByStatement('CustomTargetingService', {
                    query: "WHERE name = '" + name + "'"
                });

                if (keys.totalResultSetSize > 0) {
                    keys = keys.results;
                } else {
                    keys = [];
                }
                keys = keys.filter(({status}) => status === 'ACTIVE');
                // console.log(keys);

                resolve(keys);
            } catch (err) {
                // console.log(err);
            }
        });
    }

    async getCustomTargetingValues(customTargetingKeyId) {
        return new Promise(async (resolve, reject) => {
            try {
                const Service = await this.getDfp().then(dfp => dfp.getService('CustomTargetingService'));
                Service.setToken(Handler.token);

                let values = await Service.getCustomTargetingValuesByStatement({
                    filterStatement: {
                        query: "WHERE customTargetingKeyId = " + customTargetingKeyId
                    }
                });

                if (values.totalResultSetSize > 0) {
                    values = values.results;
                } else {
                    values = [];
                }
                // console.log(values);

                resolve(values);
            } catch (err) {
                // console.log(err);
            }
        });
    }

    async getCreatives(advertiserId) {

        return new Promise(async (resolve, reject) => {

            let creatives = await this._getByStatement('CreativeService', {
                query: `WHERE advertiserId = '${advertiserId}'`
            });

            if (creatives.totalResultSetSize > 0) {
                creatives = creatives.results;
            } else {
                creatives = [];
            }

            resolve(creatives);
        });
    }

    async performOrderAction(status, orderId) {
        return new Promise(async (resolve, reject) => {

            const Service = await this.getDfp().then(dfp => dfp.getService("OrderService"));
            Service.setToken(Handler.token);

            let result = await Service.performOrderAction({
                orderAction: {
                    attributes: {'xsi:type': status},
                    // skipInventoryCheck: true
                },
                filterStatement: {query: 'WHERE id = ' + orderId}
            });

            console.log(result);

            resolve(result);
        });
    }

    async composerLineItems(orderKey, params) {
        let {
            step,
            keywordStep,
            keywordTemplate,
            rangeFrom,
            rangeTo,
            lineItemsNaming,
            advertiser,
            customTargetingKeys,
            customTargetingValues
        } = params;

        let lineItems = [],
            bid;

        rangeFrom = toInteger(rangeFrom);
        rangeTo = toInteger(rangeTo);
        step = toInteger(step);

        let lineItemInfo = this.lineItemInfo;
        lineItemInfo = this.advertiser.setupDefaultValues(lineItemInfo, params);

        let mask = "{bid}";
        switch (advertiser) {
            // case 'pubnative':
            // keywordAdvertiser = 'pn_bid';
            // break;
            // case 'openx':
            //
            //     break;
            case "amazon":
                // keywordAdvertiser = 'amznslots:m320x50p';
                mask = "{position}";
                break;
        }


        let keyId = null;
        if (!isEmpty(customTargetingKeys)) {
            keyId = customTargetingKeys[0];
        } else {
            let newKeys = await this.createCustomTargetingKeys([{
                name: this.advertiser.customTargetingKey,
                displayName: this.advertiser.customTargetingKey,
                type: "FREEFORM"
            }]);
            console.log(newKeys);
            keyId = newKeys[0].id;
        }

        let line = 1;
        const keywordStepDecimalPartLength = (keywordStep + "").replace(/^[-\d]+\./, "").length,
            stepDecimalPartLength = (step + "").replace(/^[-\d]+\./, "").length;


        let bids = [],
            keywords = [];
        for (bid = rangeFrom; bid <= rangeTo; bid += step) {
            bids.push(bid);

            const bidDecimal = toDecimal(bid),
                s = toDecimal(step);

            if (advertiser === "amazon") {
                for (let i = 0; i < keywordStep; i += 1) {
                    i = toValidUI(i);
                    const keyword = keywordTemplate.replace(mask, i + line).replace("amznslots:", "");
                    keywords.push(keyword);
                }
                line++;
            } else if (advertiser === "openx") {
                const to = +toValidUI(bidDecimal + s).toFixed(2);
                for (let i = bidDecimal; i < to; i += keywordStep) {
                    i = toValidUI(i);
                    keywords.push(i.toFixed(2));
                }
            } else {
                const to = +toValidUI(bidDecimal + s).toFixed(2);
                for (let i = bidDecimal; i < to; i += keywordStep) {
                    i = toValidUI(i);
                    const value = i.toFixed(keywordStepDecimalPartLength),
                        keyword = keywordTemplate.replace(mask, value);
                    keywords.push(keyword);
                }
            }
        }
        let newKeywords = keywords.filter(
            function (e) {
                return !this.find(keyword => keyword.name === e);
            },
            customTargetingValues
        );
        newKeywords = newKeywords.filter(function (value, index, self) {
            return self.indexOf(value) === index;
        });

        // console.log(customTargetingValues, keywords, newKeywords);

        if (!isEmpty(newKeywords)) {
            newKeywords = newKeywords.map(keyword => {
                return {
                    customTargetingKeyId: keyId,
                    name: keyword,
                    matchType: "EXACT"
                }
            });

            let newValues = await this.createCustomTargetingValues(newKeywords);
            customTargetingValues = [...customTargetingValues, ...newValues];
        }

        line = 1;
        await Promise.all(Array(bids.length).fill().map(async (item, index) => {

            const bid = bids[index];

            let _lineItemInfo = deepClone(lineItemInfo);

            const bidDecimal = toDecimal(bid),
                s = toDecimal(step),
                bidValue = bidDecimal.toFixed(stepDecimalPartLength);

            let name = lineItemsNaming.replace("{bid}", bidValue),
                keywords = [];

            if (advertiser === "amazon") {
                for (let i = 0; i < keywordStep; i += 1) {
                    i = toValidUI(i);
                    const keyword = keywordTemplate.replace(mask, i + line).replace("amznslots:", "");
                    keywords.push(keyword);
                }
                name = name.replace("{position}", line);
                line++;
            } else if (advertiser === "openx") {
                const to = +toValidUI(bidDecimal + s).toFixed(2);
                for (let i = bidDecimal; i < to; i += keywordStep) {
                    i = toValidUI(i);
                    keywords.push(i.toFixed(2));
                }
            } else {
                const to = +toValidUI(bidDecimal + s).toFixed(2);
                for (let i = bidDecimal; i < to; i += keywordStep) {
                    i = toValidUI(i);
                    const value = i.toFixed(keywordStepDecimalPartLength),
                        keyword = keywordTemplate.replace(mask, value);
                    keywords.push(keyword);
                }
            }


            let newKeywords = keywords.filter(
                function (e) {
                    return !this.find(keyword => keyword.name === e);
                },
                customTargetingValues
            );
            let values = customTargetingValues.filter(
                function (e) {
                    return this.indexOf(e.name) >= 0;
                },
                keywords
            );

            if (!isEmpty(newKeywords)) {

                newKeywords = newKeywords.map(keyword => {
                    return {
                        customTargetingKeyId: keyId,
                        name: keyword,
                        matchType: "EXACT"
                    }
                });

                let newValues = await this.createCustomTargetingValues(newKeywords);

                customTargetingValues = [...customTargetingValues, ...newValues];

                values = [...values, ...newValues]
            }

            values = values.map(({id}) => {
                return id;
            });

            console.log(values);

            _lineItemInfo.targeting.customTargeting = CustomCriteriaSet(
                [CustomCriteria(keyId, values)]
            );

            // console.log(_lineItemInfo);


            console.log({..._lineItemInfo});

            _lineItemInfo.costPerUnit = Money(bidDecimal, 'USD');

            lineItems = [...lineItems, {
                orderId: orderKey,
                name: name,
                // keywords: keywords,
                ..._lineItemInfo
            }];
        }));

        console.log(lineItems);

        return lineItems;
    }

    createOrderDataFromSet(order, params, stepCallback) {
        return this.createOrder(order).then(async order => {
            const lineItems = await this.composerLineItems(order.id, params);

            stepCallback({
                ordersDone: 1,
                orderCount: 1,
                lineItemsDone: 1,
                lineItemCount: lineItems.length
            });

            const {creativeFormat, advertiser} = params,
                [width, height] = creativeFormat.split("x");

            let size = null;
            switch (advertiser) {
                case "openx":
                    size = Size(1, 1, false);
                    break;
                case "amazon":
                    size = Size(width, height, false);
                    break;
            }

            let creative = null;
            if (advertiser === "openx" || advertiser === "amazon") {
                let creatives = await this.createCreatives([
                    ThirdPartyCreative(
                        order.advertiserId,
                        "Creative for " + order.name,
                        size,
                        this.advertiser.getCreativeHtmlData(params)
                    )
                ]);
                if (creatives.length === 1) {
                    creative = creatives[0];
                }
            }

            await this.performOrderAction('ApproveOrders', order.id);

            return this.createLineItems(lineItems)
                .then(lineItems => {
                    let associations = [];
                    lineItems.map(({id}) => {
                        associations.push(LineItemCreativeAssociation(
                            id,
                            creative.id,
                            [Size(width, height, false)]
                        ));
                    });
                    this.createLineItemCreativeAssociations(associations);

                    return lineItems;
                })
                .then(lineItems => {
                    if (stepCallback) {
                        stepCallback({
                            ordersDone: 1,
                            orderCount: 1,
                            lineItemCount: lineItems.length,//lineItemCount,
                            lineItemsDone: lineItems.length//idx + 1
                        });
                    }

                    return lineItems;
                });
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

    async createOrder(data) {
        return new Promise(async (resolve, reject) => {

            const Service = await this.getDfp().then(dfp => dfp.getService("OrderService"));
            Service.setToken(Handler.token);

            const user = await this.getCurrentUser();
            data.traffickerId = user.id;

            let orders = await Service.createOrders({
                orders: [
                    data
                ]
            });

            console.log(orders[0]);

            resolve(orders[0]);
        });
    }

    async createLineItems(data) {
        return new Promise(async (resolve, reject) => {

            const Service = await this.getDfp().then(dfp => dfp.getService("LineItemService"));
            Service.setToken(Handler.token);

            let lineItems = await Service.createLineItems({
                lineItems: data
            });

            console.log(lineItems);

            resolve(lineItems);
        });
    }

    async createCreatives(data) {
        return new Promise(async (resolve, reject) => {

            const Service = await this.getDfp().then(dfp => dfp.getService("CreativeService"));
            Service.setToken(Handler.token);

            let creatives = await Service.createCreatives({
                creatives: data
            });

            console.log(creatives);

            resolve(creatives);
        });
    }

    async createLineItemCreativeAssociations(data) {
        return new Promise(async (resolve, reject) => {

            const Service = await this.getDfp().then(dfp => dfp.getService("LineItemCreativeAssociationService"));
            Service.setToken(Handler.token);

            let associations = await Service.createLineItemCreativeAssociations({
                lineItemCreativeAssociations: data
            });

            console.log(associations);

            resolve(associations);
        });
    }

    async createCustomTargetingKeys(data) {

        const Service = await this.getDfp().then(dfp => dfp.getService("CustomTargetingService"));
        Service.setToken(Handler.token);

        return new Promise(async (resolve, reject) => {

            let keys = await Service.createCustomTargetingKeys({
                keys: data
            });

            console.log(keys);

            resolve(keys);
        }).then(keys => {
            const ids = keys.map(({id}) => {
                return id;
            });
            console.log(ids);
            Service.performCustomTargetingKeyAction({
                customTargetingKeyAction: {
                    attributes: {'xsi:type': 'ActivateCustomTargetingKeys'}
                },
                filterStatement: {
                    query: 'WHERE id IN (' + ids.join(',') + ')'
                }
            });
            return keys;
        });
    }

    async createCustomTargetingValues(data) {
        return new Promise(async (resolve, reject) => {

            const Service = await this.getDfp().then(dfp => dfp.getService("CustomTargetingService"));
            Service.setToken(Handler.token);

            let values = await Service.createCustomTargetingValues({
                values: data
            });

            console.log(values);

            resolve(values);
        });
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
        return this.getOrder(id).then(async order => {
            const lineItems = await this.getAllLineItems([order.id]);
            return {
                ...order,
                lineItems
            }
        }).then(async order => {
            let {lineItems} = order;

            const ids = lineItems.map(({id}) => {
                return id;
            });

            let creativeAssociations = await this._getByStatement('LineItemCreativeAssociationService', {
                query: 'WHERE lineItemId IN (' + ids.join(',') + ')'
            });

            if (creativeAssociations.totalResultSetSize > 0) {
                creativeAssociations = creativeAssociations.results;
            } else {
                creativeAssociations = [];
            }

            return Promise.mapSeries(lineItems, (lineItem, idx, lineItemCount) => {
                if (window.canceledExport) return;
                let timestamp = Date.now();

                lineItem.creativeAssociations = creativeAssociations.filter(({lineItemId}) => lineItemId === lineItem.id);

                timestamp = Date.now() - timestamp;

                if (step) {
                    step({
                        lineItemCount,
                        timestamp,
                        lineItemsDone: idx + 1
                    });
                }

                return lineItem;
            }).then(lineItems => ({...order, lineItems}));
        });
    }

    updateOrderStatus(status, id) {
        let mappedStatus = null;
        switch (status) {
            case 'running':
                mappedStatus = 'ApproveOrders';
                break;
            case 'paused':
                mappedStatus = 'PauseOrders';
                break;
            case 'archived':
                mappedStatus = 'ArchiveOrders';
                break;
            default:
                throw `Wrong order status ${status}`;
        }

        return this.performOrderAction(mappedStatus, id);
    }

    getOrderUrl(key) {
        return `https://admanager.google.com/${this.networkCode}#delivery/OrderDetail/orderId=${key}`;
    }

    getAdUnitUrl(key) {
        return `https://admanager.google.com/${this.networkCode}#inventory/inventory/adSlotId=${key}`;
    }
}

Factory.registerHandler(Handler);