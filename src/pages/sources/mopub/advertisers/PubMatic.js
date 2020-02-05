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
            keywordTemplate,
            lineItemsNaming,
            customEventClassName,
            customEventData,
        } = params;

        let lineItemInfo = {...this.lineItemInfo},
            lineItems = [],
            step,
            rangeFrom,
            rangeTo,
            bid,
            bids = [];

        const mask = "{bid}";

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
        });

        return lineItems;
    }
}