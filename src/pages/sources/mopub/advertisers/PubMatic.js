import AbstractAdvertiser from '../../../sources/AbstractAdvertiser'
import {toDecimal, toInteger, toValidUI} from "../../../helpers";

export class PubMatic extends AbstractAdvertiser {

    static advertiser = "pubmatic";

    NETWORK_CLASS = {
        "": [
            {value: '', label: 'Please select OS'},
        ],
        iphone: [
            {value: 'POBBannerCustomEvent', label: 'Banner'},
            {value: 'POBInterstitialCustomEvent', label: 'Interstitial'},
        ],
        android: [
            {value: 'POBBannerCustomEvent', label: 'Banner'},
            {value: 'POBInterstitialCustomEvent', label: 'Interstitial'},
        ]
    };

    composerLineItems(orderKey, params) {
        let {
            adunits,
            step,
            keywordStep,
            keywordTemplate,
            rangeFrom,
            rangeTo,
            lineItemsNaming,
            customEventClassName,
            granularity,
            customEventData,
        } = params;

        let lineItemInfo = {...this.lineItemInfo},
            lineItems = [],
            bid;

        rangeFrom = toInteger(rangeFrom);
        rangeTo = toInteger(rangeTo);
        step = toInteger(step);

        const mask = "{bid}";

        const keywordStepDecimalPartLength = (keywordStep + "").replace(/^[-\d]+\./, "").length;
        let stepDecimalPartLength = (step + "").replace(/^[-\d]+\./, "").length;
        if (step >= 100) {
            stepDecimalPartLength--;
        }

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

            lineItemInfo.type = "network";
            lineItemInfo["networkType"] = "custom_native";
            lineItemInfo["enableOverrides"] = true;
            lineItemInfo["overrideFields"] = {
                custom_event_class_name: customEventClassName,
                custom_event_class_data: customEventData
            };

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

            lineItems.unshift({
                adUnitKeys: adunits,
                bid: 0.01,
                name: lineItemsNaming.replace("{bid}", '0.01'),
                orderKey: orderKey,
                keywords: [keywordTemplate.replace(mask, '0.00')],
                ...lineItemInfo
            })
        }

        return lineItems;
    }
}