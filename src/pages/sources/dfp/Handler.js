import Factory from '../../sources/Factory';
import AbstractHandler from '../../sources/AbstractHandler';
import {AdvertiserFactory} from "./Factory";
import {AD_SERVER_DFP, DFP_API_VERSION} from "../../constants/source";
import {AMAZON_KVP_FORMAT, PRICE_GRID} from '../../constants/common';
import {DFP, FileService, HTTPService} from "../../services";
import Promise from "bluebird";
import {isEmpty, toDecimal, toInteger, toValidUI, deepClone} from "../../helpers";
import {
    Goal,
    Size,
    Money,
    ThirdPartyCreative,
    VastPartyCreative,
    CustomCriteriaSet,
    CustomCriteria,
    LineItemCreativeAssociation
} from "./DataTypes";
import {DOMParser} from "xmldom";
import {delay} from "../helpers";

Promise.config({
    // Enable cancellation
    cancellation: true
});

function OrderError(message, close, trace) {
    this.name = "OrderError";
    this.message = (message || "");
    if (typeof close == "undefined") {
        close = true;
    }
    this.close = close;
    if (typeof trace == "undefined") {
        trace = true;
    }
    this.trace = trace;
}

OrderError.prototype = Error.prototype;

class Handler extends AbstractHandler {

    static source = AD_SERVER_DFP;

    ADVERTISER_DEFAULT_NAME = {
        amazon: "Amazon Publisher Services (TAM)",
        openx: "Prebid.org",
        apolloSDK: "OpenX Apollo SDK",
        apollo: "OpenX Apollo",
        bidmachine: "BidMachine"

    };

    FILTER_FN = [
        ({status}) => status !== "ARCHIVED",
        ({status}) => status === "DRAFT",
        ({status}) => status === "APPROVED",
        ({status}) => status === "DISAPPROVED",
        ({status}) => status === "PENDING_APPROVAL",
        ({status}) => status === "PAUSED",
        ({status}) => status === "ARCHIVED",
        ({status}) => status === "CANCELED",
        ({status}) => status === "DELETED",
    ];

    STATUS_OPTIONS = [
        {value: 0, label: "all except archived"},
        {value: 1, label: "DRAFT"},
        {value: 2, label: "APPROVED"},
        {value: 3, label: "DISAPPROVED"},
        {value: 4, label: "PENDING_APPROVAL"},
        {value: 5, label: "PAUSED"},
        {value: 6, label: "ARCHIVED"},
        {value: 7, label: "CANCELED"},
        {value: 8, label: "DELETED"},
    ];

    dfp = null;
    networkCode = null;
    token = null;
    loggedIn = false;

    customTargetingKeyId = null;
    customTargetingValues = [];

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
        environmentType: "BROWSER",
        budget: Money(0, 'USD'),
        status: "PAUSED",
        isArchived: "false",
        primaryGoal: Goal('NONE', 'IMPRESSIONS', 100),
        childContentEligibility: "DISALLOWED",
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
        this.setToken();
    }

    isReady() {
        return this.getNetworkCode() !== null && this.getToken() !== null;
    }

    clear() {
        this.token = null;
        this.networkCode = null;
        this.dfp = null;
    }

    setNetworkCode() {
        this.networkCode = localStorage.getItem("dfpNetworkCode") || null;
    }

    getNetworkCode() {
        if (this.networkCode) {
            return this.networkCode;
        }
        this.networkCode = localStorage.getItem('dfpNetworkCode') || null;
        return this.networkCode;
    }

    setToken() {

        const dfpTokenExpire = localStorage.getItem("dfpTokenExpire") || null;
        if (!dfpTokenExpire || Number(dfpTokenExpire) < Date.now()) {
            localStorage.removeItem("dfpToken");
        }

        this.token = localStorage.getItem("dfpToken") || null;
    }

    getToken() {
        if (this.token) {
            return this.token;
        }
        this.token = localStorage.getItem("dfpToken") || null;
        return this.token;
    }

    composeOrderRequest(advertiser, name) {
        return {
            name: name,
            notes: "",
            advertiserId: advertiser,
        }
    }

    removeCachedAuthToken() {
        if (this.token) {
            var url = 'https://accounts.google.com/o/oauth2/revoke?token=' + this.token;
            window.fetch(url);
            chrome.identity.removeCachedAuthToken({token: this.token}, function () {
                //token was removed from cache
                // window.location.reload();
            });
        }
    }

    async getDfp() {
        if (!this.token) {
            this.token = await this.getToken();
        }
        if (!this.dfp) {
            this.dfp = new DFP({networkCode: this.networkCode, apiVersion: DFP_API_VERSION, token: this.token});
        }

        return this.dfp;
    }

    async _getByStatement(serviceName, filterStatement) {

        const Service = await this.getDfp().then(dfp => dfp.getService(serviceName));
        Service.setToken(this.token);

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

                resolve(adunits);
            } catch (err) {
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

    async getAllOrders() {
        return new Promise(async (resolve, reject) => {
            try {
                let orders = await this._getByStatement('OrderService', {});

                if (orders.totalResultSetSize > 0) {
                    orders = orders.results;
                } else {
                    orders = [];
                }

                resolve(orders);
            } catch (err) {
            }
        }).then(orders => {
            return orders.map(order => {
                return {
                    key: order.id,
                    name: order.name,
                    status: order.isArchived ? 'ARCHIVED' : order.status,
                    advertiser: "Calculating...",
                    advertiserId: order.advertiserId,
                    lineItemCount: "Calculating..."
                }
            });
        });
    }

    async getOrdersAfter(ordersOriginal) {

        const advertisers = await this.getAllAdvertisers();
        const ids = ordersOriginal
            .filter(({ status }) => status !== 'ARCHIVED')
            .map(({key}) => {
                return key;
            });
        const lineItems = await this.getAllLineItems(ids);

        return ordersOriginal.map(order => {

            let statuses = {};
            lineItems
                .filter(({orderId}) => orderId === order.key)
                .forEach(lineItem => {
                    statuses[lineItem.status] ? statuses[lineItem.status]++ : statuses[lineItem.status] = 1;
                });

            return {
                ...order,
                advertiser: advertisers.find(advertiser => advertiser.id === order.advertiserId).name,
                lineItemCount: Object.entries(statuses).map(x => `${x[0]} (${x[1]})`) //lineItems.filter(({orderId}) => orderId === order.key).length
            }
        });
    }

    async getAllLineItems(ids) {

        return new Promise(async (resolve, reject) => {

            let lineItems = await this._getByStatement('LineItemService', {
                query: 'WHERE OrderId IN (' + ids.join(',') + ')'
            });

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

                companies = companies.results;

                resolve(companies);
            } catch (err) {
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

    async getCurrentUser() {
        return new Promise(async (resolve, reject) => {

            const Service = await this.getDfp().then(dfp => dfp.getService('UserService'));
            Service.setToken(this.token);

            Handler.user = await Service.getCurrentUser({});

            resolve(Handler.user);
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

                resolve(keys);
            } catch (err) {
            }
        });
    }

    async getCustomTargetingValues(customTargetingKeyId) {
        return new Promise(async (resolve, reject) => {
            try {
                const Service = await this.getDfp().then(dfp => dfp.getService('CustomTargetingService'));
                Service.setToken(this.token);

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

                resolve(values);
            } catch (err) {
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

    async performOrderAction(status, mappedStatus, orderId) {
        return new Promise(async (resolve, reject) => {

            let resultStatus = status;

            const Service = await this.getDfp().then(dfp => dfp.getService("OrderService"));
            Service.setToken(this.token);

            let result = await Service.performOrderAction({
                orderAction: {
                    attributes: {'xsi:type': mappedStatus}
                },
                filterStatement: {query: 'WHERE id = ' + orderId}
            });
            if (mappedStatus === "UnarchiveOrders") { // Hot fix, to do unarchive we need to send two request
                try {
                    result = await Service.performOrderAction({
                        orderAction: {
                            attributes: {'xsi:type': "ApproveOrders"}
                        },
                        filterStatement: {query: 'WHERE id = ' + orderId}
                    });
                    resultStatus = 'APPROVED';
                } catch (e) {
                    resultStatus = 'DRAFT';
                }
            }

            if (result.hasOwnProperty('numChanges') && result.numChanges === 1) {
                return resolve({status: resultStatus.toUpperCase()});
            }

            reject(result);
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
            customTargetingValues,
            granularity,
            amazonStartPrice,
            amazonStep,
            priceGrid,
            amazonCSVItems,
            childContentEligibility,
            BidMachinePriceGrid,
            snippetType
        } = params;

        this.customTargetingValues = customTargetingValues;

        let lineItems = [],
            bid;

        rangeFrom = toInteger(rangeFrom);
        rangeTo = toInteger(rangeTo);
        step = toInteger(step);

        let lineItemInfo = this.lineItemInfo;
        lineItemInfo = this.advertiser.setupDefaultValues(lineItemInfo, params);

        const mask = String(advertiser) === 'amazon' ? '{position}' : "{bid}";

        if (!isEmpty(customTargetingKeys)) {
            this.customTargetingKeyId = customTargetingKeys[0];
        } else {
            let newKeys = await this.createCustomTargetingKeys([{
                name: this.advertiser.customTargetingKey,
                displayName: this.advertiser.customTargetingKey,
                type: "FREEFORM"
            }]);
            this.customTargetingKeyId = newKeys[0].id;
        }

        const keywordStepDecimalPartLength = (keywordStep + "").replace(/^[-\d]+\./, "").length,
            stepDecimalPartLength = (step + "").replace(/^[-\d]+\./, "").length;

        let bids = [],
            keywords = [],
            skip = false;
        if (advertiser === "openx" || advertiser === "apollo" || advertiser === "apolloSDK") {
            keywordTemplate = keywordTemplate.replace((this.advertiser.customTargetingKey+':'), '')
            switch (granularity) {
                case 'low':
                    step = rangeFrom = toInteger(0.5);
                    rangeTo = toInteger(5);
                    for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                        bids.push(bid);
                        const bidDecimal = toDecimal(bid);
                        // keywords.push(bidDecimal.toFixed(2));
                        keywords.push(
                            keywordTemplate.replace(mask, bidDecimal.toFixed(2))
                        );
                    }
                    break;
                case 'med':
                    step = rangeFrom = toInteger(0.1);
                    rangeTo = toInteger(20);
                    for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                        bids.push(bid);
                        const bidDecimal = toDecimal(bid);
                        keywords.push(bidDecimal.toFixed(2));
                    }
                    break;
                case 'high':
                    // step = rangeFrom = toInteger(0.01);
                    // rangeTo = toInteger(20);
                    // for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                    //     bids.push(bid);
                    //     const bidDecimal = toDecimal(bid);
                    //     keywords.push(bidDecimal.toFixed(2));
                    // }

                    skip = true;
                    step = rangeFrom = toInteger(0.1);
                    rangeTo = toInteger(20);
                    keywordStep = 0.01;
                    for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                        bids.push(bid);
                        const bidDecimal = toDecimal(bid).toFixed(2);

                        const to = +toValidUI(toDecimal(bid) + toDecimal(step)).toFixed(2);

                        for (let i = toInteger(bidDecimal); i < toInteger(to); i += toInteger(keywordStep)) {
                            const key = toDecimal(i);
                            const value = key.toFixed(keywordStepDecimalPartLength),
                                keyword = keywordTemplate.replace(mask, value);
                            keywords.push(keyword);
                        }
                    }
                    break;
                case 'auto':
                    // 0.05 ... 5 (0.05)
                    step = rangeFrom = toInteger(0.05);
                    rangeTo = toInteger(5);
                    for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                        bids.push(bid);
                        const bidDecimal = toDecimal(bid);
                        keywords.push(bidDecimal.toFixed(2));
                    }
                    // 5.1 ... 10 (0.1)
                    step = toInteger(0.1);
                    rangeFrom = toInteger(5.1);
                    rangeTo = toInteger(10);
                    for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                        bids.push(bid);
                        const bidDecimal = toDecimal(bid);
                        keywords.push(bidDecimal.toFixed(2));
                    }
                    // 10.5 ... 20 (0.5)
                    step = toInteger(0.5);
                    rangeFrom = toInteger(10.5);
                    rangeTo = toInteger(20);
                    for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                        bids.push(bid);
                        const bidDecimal = toDecimal(bid);
                        keywords.push(bidDecimal.toFixed(2));
                    }
                    break;
                case 'dense':
                    // 0.01 ... 3 (0.01)
                    step = rangeFrom = toInteger(0.01);
                    rangeTo = toInteger(3);
                    for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                        bids.push(bid);
                        const bidDecimal = toDecimal(bid);
                        keywords.push(bidDecimal.toFixed(2));
                    }
                    // 3.05 ... 8 (0.05)
                    step = toInteger(0.05);
                    rangeFrom = toInteger(3.05);
                    rangeTo = toInteger(8);
                    for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                        bids.push(bid);
                        const bidDecimal = toDecimal(bid);
                        keywords.push(bidDecimal.toFixed(2));
                    }
                    // 8.5 ... 20 (0.5)
                    step = toInteger(0.5);
                    rangeFrom = toInteger(8.5);
                    rangeTo = toInteger(20);
                    for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                        bids.push(bid);
                        const bidDecimal = toDecimal(bid);
                        keywords.push(bidDecimal.toFixed(2));
                    }
                    break;
            }
        } else if (advertiser === "amazon") {
            let startPriceIndex = 0
            for (let index = rangeFrom; index <= rangeTo; index += step) {
                bid = (amazonStartPrice + startPriceIndex*amazonStep)*100
                bids.push(bid);

                for (let i = 0; i < keywordStep; i += 1) {
                    i = toValidUI(i);
                    const keyword = keywordTemplate.replace(mask, i + bid/100).replace("amznslots:", "");
                    keywords.push(keyword);
                }
                startPriceIndex++
            }
        } else if (advertiser === "bidmachine") {
            keywordTemplate = keywordTemplate.replace((this.advertiser.customTargetingKey+':'), '')
            BidMachinePriceGrid.split(/\r?\n/).forEach(element => {
                var number = parseFloat(element.match(/[\d\.]+/))
                if (number) {
                    number *= 100
                    bids.push(number)
                    const bidDecimal = toDecimal(number);
                    keywords.push(keywordTemplate.replace(mask, bidDecimal.toFixed(2)))
                }

            })
        } else {
            let startPriceIndex = 0
            for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                bids.push(bid);

                const bidDecimal = toDecimal(bid),
                    s = toDecimal(step);

                if (advertiser === "openx" || advertiser === "apollo" || advertiser === "apolloSDK") {
                    const to = +toValidUI(bidDecimal + s).toFixed(2);
                    for (let i = bidDecimal; i < to; i += keywordStep) {
                        i = toValidUI(i);
                        if (i < to) {
                            keywords.push(i.toFixed(2));
                        }
                    }
                } else {
                    const to = +toValidUI(bidDecimal + s).toFixed(2);
                    for (let i = bidDecimal; i < to; i += keywordStep) {
                        i = toValidUI(i);
                        if (i < to) {
                            const value = i.toFixed(keywordStepDecimalPartLength),
                                keyword = keywordTemplate.replace(mask, value);
                            keywords.push(keyword);
                        }
                    }
                }
            }
        }
        let newKeywords = keywords.filter(
            function (e) {
                return !this.find(keyword => keyword.name === e);
            },
            this.customTargetingValues
        );
        newKeywords = newKeywords.filter(function (value, index, self) {
            return self.indexOf(value) === index;
        });

        if (!isEmpty(newKeywords)) {
            newKeywords = newKeywords.map(keyword => {
                return {
                    customTargetingKeyId: this.customTargetingKeyId,
                    name: keyword,
                    matchType: "EXACT"
                }
            });

            let newValues = await this.createCustomTargetingValues(newKeywords);
            this.customTargetingValues = [...this.customTargetingValues, ...newValues];
        }

        if (advertiser === "amazon" && PRICE_GRID.non_uniform == priceGrid) {

            await Promise.all(amazonCSVItems.map(async line => {
                const match = line.match(AMAZON_KVP_FORMAT);
                const bidDecimal = parseFloat(match[2]);

                let _lineItemInfo = deepClone(lineItemInfo);

                const values = await this.findOrCreateKeywords([line.substring(0, line.indexOf(':'))]);

                _lineItemInfo.targeting.customTargeting = CustomCriteriaSet(
                    [CustomCriteria(this.customTargetingKeyId, values)]
                );

                _lineItemInfo.costPerUnit = Money(bidDecimal, 'USD');

                lineItems = [...lineItems, {
                    orderId: orderKey,
                    name: line.substring(0, line.indexOf(':')),
                    // keywords: keywords,
                    ..._lineItemInfo
                }];
            }));
        } else {

            let line = rangeFrom/100;
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
                } else if (advertiser === "bidmachine") {
                    name = name.replace("{ad_type}", snippetType)
                    keywords.push(keywordTemplate.replace(mask, bidValue));

                }else if (advertiser === "openx" || advertiser === "apollo" || advertiser === "apolloSDK") {
                    // const to = +toValidUI(bidDecimal + s).toFixed(2);
                    // for (let i = bidDecimal; i < to; i += keywordStep) {
                    //     i = toValidUI(i);
                    //     if (i < to) {
                    //         keywords.push(i.toFixed(2));
                    //     }
                    // }
                    switch (granularity) {
                        case 'high':
                            const to = +toValidUI(toDecimal(bid) + toDecimal(step)).toFixed(2);
                            for (let i = toInteger(bidDecimal); i < toInteger(to); i += toInteger(keywordStep)) {
                                const key = toDecimal(i);
                                const value = key.toFixed(keywordStepDecimalPartLength),
                                    keyword = keywordTemplate.replace(mask, value);
                                keywords.push(keyword);
                            }
                            break;
                        case 'low':
                        case 'med':
                        case 'auto':
                        case 'dense':
                            keywords.push(keywordTemplate.replace(mask, bidValue));
                            break;
                    }
                } else {
                    const to = +toValidUI(bidDecimal + s).toFixed(2);
                    for (let i = bidDecimal; i < to; i += keywordStep) {
                        i = toValidUI(i);
                        if (i < to) {
                            const value = i.toFixed(keywordStepDecimalPartLength),
                                keyword = keywordTemplate.replace(mask, value);
                            keywords.push(keyword);
                        }
                    }
                }

                const values = await this.findOrCreateKeywords(keywords);

                _lineItemInfo.targeting.customTargeting = CustomCriteriaSet(
                    [CustomCriteria(this.customTargetingKeyId, values)]
                );

                _lineItemInfo.costPerUnit = Money(bidDecimal, 'USD');

                lineItems = [...lineItems, {
                    orderId: orderKey,
                    name: name,
                    // keywords: keywords,
                    ..._lineItemInfo
                }];
            }));
        }

        return lineItems;
    }

    async findOrCreateKeywords(keywords) {
        let newKeywords = keywords.filter(
            function (e) {
                return !this.find(keyword => keyword.name === e);
            },
            this.customTargetingValues
        );
        let values = this.customTargetingValues.filter(
            function (e) {
                return this.indexOf(e.name) >= 0;
            },
            keywords
        );

        if (!isEmpty(newKeywords)) {

            newKeywords = newKeywords.map(keyword => {
                return {
                    customTargetingKeyId: this.customTargetingKeyId,
                    name: keyword,
                    matchType: "EXACT"
                }
            });

            let newValues = await this.createCustomTargetingValues(newKeywords);

            this.customTargetingValues = [...this.customTargetingValues, ...newValues];

            values = [...values, ...newValues]
        }

        values = values.map(({id}) => {
            return id;
        });

        return values;
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

            const creatives = (await Promise.all(params.adunits.map(async adunit => {
                const {advertiser} = params
                const creative = params.adUnitsParams.find(adUnitsParam => adUnitsParam.key == adunit)
                let [width, height] = creative.format.split("x")
                let adUnitSizes = []
                if(advertiser == "openx" || advertiser == "apollo" ||
                    advertiser == "apolloSDK") {
                    width = 1
                    height = 1
                } else if (advertiser == "bidmachine"){
                    if(params.snippetType == "interstitial") {
                        width = 1
                        height = 1
                    } else {
                        if(creative.format.indexOf(',') > -1) {
                            let formats = creative.format.split(', ')
                            formats.forEach(format => {
                                let [width, height] = format.split("x")
                                adUnitSizes.push({width: width, height: height})
                            })
                        } else {
                            let [width, height] = creative.format.split("x")
                        }

                    }
                }else if(!creative.format){
                    [width, height] = params.creativeFormat.split("x")
                }
                let data = []
                if(adUnitSizes.length > 0) {
                    if(params.snippetType === "VAST") {
                        adUnitSizes.forEach(element => {
                            data.push(
                                VastPartyCreative(
                                    order.advertiserId,
                                    creative.name + ". For " + order.name,
                                    Size(element.width, element.height, false),
                                    params.vastTagUrl
                                )
                            )
                        })
                    } else {
                        adUnitSizes.forEach(element => {
                            data.push(
                                ThirdPartyCreative(
                                    order.advertiserId,
                                    creative.name + ". For " + order.name,
                                    Size(element.width, element.height, false),
                                    advertiser === 'openx' || advertiser === 'apollo' || advertiser === 'apolloSDK' ? params.creativeSnippet : this.advertiser.getCreativeHtmlData(params)
                                )
                            )
                        })
                    }
                } else {
                    if(params.snippetType === "VAST") {
                        data.push(
                            VastPartyCreative(
                                order.advertiserId,
                                creative.name + ". For " + order.name,
                                Size(width, height, false),
                                params.vastTagUrl
                            )
                        )
                    } else {
                        data.push(
                            ThirdPartyCreative(
                                order.advertiserId,
                                creative.name + ". For " + order.name,
                                Size(width, height, false),
                                advertiser === 'openx' || advertiser === 'apollo' || advertiser === 'apolloSDK' ? params.creativeSnippet : this.advertiser.getCreativeHtmlData(params)
                            )
                        )
                    }
                }
                return await this.createCreatives(data);
            }))).flat()

            await this.performOrderAction('running', 'ApproveOrders', order.id);

            const pagination = []
            let start = 0
            const length = 50
            while(start < lineItems.length){
                pagination.push(lineItems.slice(start, start + length))
                start += length
            }

            return Promise.mapSeries(pagination, async (part, idx, lineItemCount) => {
                if(window.canceledExport){
                    return
                }

                await delay(Math.floor(idx/length)*1000);
                return this.createLineItems(part)
                .then(async part => {
                    for (let index = 0; index < creatives.length; index++) {
                        const creative = creatives[index]

                        let associations = [];
                        part.map(({id}) => {
                            associations.push(LineItemCreativeAssociation(
                                id,
                                creative.id,
                                [creative.size]
                            ));
                        });
                        await this.createLineItemCreativeAssociations(associations);
                    }
                    return part;
                })
                .then(part => {
                    if (stepCallback) {
                        stepCallback({
                            ordersDone: 1,
                                orderCount: 1,
                                lineItemCount: lineItems.length,
                                lineItemsDone: (idx + 1)*length
                        });
                    }

                    return lineItems;
                });
            })


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

    parseSOAPError(e){
        let message = e;

        const parser = new DOMParser();
        let docError = parser.parseFromString(e.body);
        const ApiExceptions = docError.getElementsByTagName("ApiExceptionFault");
        if (ApiExceptions.length > 0) {
            const errors = ApiExceptions[0].getElementsByTagName('errors');
            if (errors.length > 0) {
                const errorString = errors[0].getElementsByTagName('errorString');
                if (errorString.length > 0) {
                    const nodeValue = errorString[0].childNodes[0].nodeValue
                    if (nodeValue === "UniqueError.NOT_UNIQUE") {
                        message = new OrderError("Order with specified name already exists", false, false);
                    } else {
                        message = new Error(nodeValue);
                    }
                }
            }
        }

        return message
    }

    async createOrder(data) {
        return new Promise(async (resolve, reject) => {

            const Service = await this.getDfp().then(dfp => dfp.getService("OrderService"));
            Service.setToken(this.token);

            const user = await this.getCurrentUser();
            data.traffickerId = user.id;

            let orders = [];
            try {
                orders = await Service.createOrders({
                    orders: [
                        data
                    ]
                });
                resolve(orders[0]);
            } catch (e) {
                reject(this.parseSOAPError(e));
            }
        });
    }

    async createLineItems(data) {
        return new Promise(async (resolve, reject) => {

            const Service = await this.getDfp().then(dfp => dfp.getService("LineItemService"));
            Service.setToken(this.token);

            try{
                console.log("lineitem data")
                console.log(data)
                let lineItems = await Service.createLineItems({
                    lineItems: data
                });
                console.log("lineitem response")
                console.log(lineItems)
                resolve(lineItems);
            } catch (e) {
                reject(this.parseSOAPError(e));
            }
        }).catch((error) => {
            console.error(error);
        });
    }

    async createCreatives(data) {
        return new Promise(async (resolve, reject) => {

            const Service = await this.getDfp().then(dfp => dfp.getService("CreativeService"));
            Service.setToken(this.token);

            try{
                console.log("creative data")
                console.log(data)
                let creatives = await Service.createCreatives({
                    creatives: data
                });
                console.log("creative response")
                console.log(creatives)
                resolve(creatives);
            } catch (e) {
                reject(this.parseSOAPError(e));
            }
        }).catch((error) => {
            console.error(error);
        });
    }

    async createLineItemCreativeAssociations(data) {
        return new Promise(async (resolve, reject) => {

            const Service = await this.getDfp().then(dfp => dfp.getService("LineItemCreativeAssociationService"));
            Service.setToken(this.token);

            try{
                let associations = await Service.createLineItemCreativeAssociations({
                    lineItemCreativeAssociations: data
                });
                resolve(associations);
            } catch (e) {
                reject(this.parseSOAPError(e));
            }
        }).catch((error) => {
            console.error(error);
        });
    }

    async createCustomTargetingKeys(data) {

        const Service = await this.getDfp().then(dfp => dfp.getService("CustomTargetingService"));
        Service.setToken(this.token);

        return new Promise(async (resolve, reject) => {

            try{
                let keys = await Service.createCustomTargetingKeys({
                    keys: data
                });

                resolve(keys);
            } catch (e) {
                reject(this.parseSOAPError(e));
            }
        }).then(keys => {
            const ids = keys.map(({id}) => {
                return id;
            });
            Service.performCustomTargetingKeyAction({
                customTargetingKeyAction: {
                    attributes: {'xsi:type': 'ActivateCustomTargetingKeys'}
                },
                filterStatement: {
                    query: 'WHERE id IN (' + ids.join(',') + ')'
                }
            });
            return keys;
        }).catch((error) => {
            console.error(error);
        });
    }

    async createCustomTargetingValues(data) {
        return new Promise(async (resolve, reject) => {

            const Service = await this.getDfp().then(dfp => dfp.getService("CustomTargetingService"));
            Service.setToken(this.token);

            try{
                let values = await Service.createCustomTargetingValues({
                    values: data
                });

                resolve(values);
            } catch (e) {
                reject(this.parseSOAPError(e));
            }
        }).catch((error) => {
            console.error(error);
        });
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
        }).catch((error) => {
            console.error(error);
        });
    }

    collectOrderData(id, step, canceled) {
        if (window.canceledExport) return;
        return this.getOrder(id).then(async order => {
            const lineItems = await this.getAllLineItems([order.id]);

            delete order.creatorId;
            delete order.traffickerId;
            delete order.isArchived;
            delete order.totalBudget;

            return {
                ...order,
                lineItems
            }
        }).then(async order => {
            let {lineItems} = order;

            const ids = lineItems.map(({id}) => {
                return id;
            });

            let creativeAssociations = [],
                creativeIDs = [],
                creatives = [];
            if (ids.length > 0) {
                let creativeAssociationsResult = await this._getByStatement('LineItemCreativeAssociationService', {
                    query: 'WHERE lineItemId IN (' + ids.join(',') + ')'
                });

                if (creativeAssociationsResult.totalResultSetSize > 0) {
                    creativeAssociations = creativeAssociationsResult.results;
                    creativeIDs = creativeAssociations.map(({creativeId}) => {
                        return creativeId;
                    });
                    creativeIDs = [...new Set(creativeIDs)];
                }

                if (creativeIDs.length > 0) {
                    let creativesResult = await this._getByStatement('CreativeService', {
                        query: 'WHERE creativeId IN (' + creativeIDs.join(',') + ')'
                    });

                    if (creativesResult.totalResultSetSize > 0) {
                        creatives = creativesResult.results;
                    }
                }
            }

            return Promise.mapSeries(lineItems, async (lineItem, idx, lineItemCount) => {
                if (window.canceledExport) return;
                let timestamp = Date.now();

                await delay(50);

                const creativeIDs = creativeAssociations
                    .filter(({lineItemId}) => lineItemId === lineItem.id)
                    .map(({creativeId}) => creativeId);

                lineItem.creatives = creatives.filter(({id}) => creativeIDs.indexOf(id) !== -1);
                delete lineItem['isArchived'];
                delete lineItem['lastModifiedDateTime'];
                delete lineItem['creationDateTime'];

                timestamp = Date.now() - timestamp;

                if (step) {
                    step({
                        lineItemCount,
                        timestamp,
                        lineItemsDone: idx + 1,
                        lineItemsTotal: ids.length
                    });
                }

                return lineItem;
            }).then(lineItems => ({...order, lineItems}));
        });
    }

    updateOrderStatus(status, id) {
        let mappedStatus = null;
        switch (status) {
            case 'Resume':
                mappedStatus = 'ResumeOrders';
                break;
            case 'running':
                mappedStatus = 'ApproveOrders';
                break;
            case 'Pause':
            case 'paused':
                mappedStatus = 'PauseOrders';
                break;
            case 'Archive':
            case 'archived':
                mappedStatus = 'ArchiveOrders';
                break;
            case 'unarchived':
                mappedStatus = 'UnarchiveOrders';
                break;
            default:
                throw `Wrong order status ${status}`;
        }

        return this.performOrderAction(status, mappedStatus, id);
    }

    getOrderUrl(key) {
        return `https://admanager.google.com/${this.networkCode}#delivery/OrderDetail/orderId=${key}`;
    }

    getAdUnitUrl(key) {
        return `https://admanager.google.com/${this.networkCode}#inventory/inventory/adSlotId=${key}`;
    }
}

Factory.registerHandler(Handler);