import AbstractAdvertiser from '../../../sources/AbstractAdvertiser'
import {toDecimal, toInteger, toValidUI} from "../../../helpers";

export class ClearBid extends AbstractAdvertiser {

    static advertiser = "clearbid";

    NETWORK_CLASS = {
        "": [],
        iphone: [
            {value: 'MPUberMediaBannerCustomEvent', label: 'Banner'},
            {value: 'ClearBidMPInterstitialCustomEvent', label: 'Interstitial'},
        ],
        android: [
            {value: 'com.ubermedia.MoPubAdapter', label: 'Banner'},
            {value: 'com.ubermedia.MoPubInterstitialAdapter', label: 'Interstitial'},
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
            networkClass,
            customEventData,
        } = params;

        let lineItemInfo = {...this.lineItemInfo},
            lineItems = [],
            bid;

        rangeFrom = toInteger(rangeFrom);
        rangeTo = toInteger(rangeTo);
        step = toInteger(step);

        const keywordStepDecimalPartLength = (keywordStep + "").replace(/^[-\d]+\./, "").length;
        let stepDecimalPartLength = (step + "").replace(/^[-\d]+\./, "").length;
        if (step >= 100) {
            stepDecimalPartLength--;
        }

        for (bid = rangeFrom; bid <= rangeTo; bid += step) {
            const bidDecimal = toDecimal(bid),
                bidValue = bidDecimal.toFixed(stepDecimalPartLength),
                name = lineItemsNaming.replace("{bid}", bidValue);
            let keywords = [];

            keywords.push(keywordTemplate.replace("{bid}", bidDecimal.toFixed(keywordStepDecimalPartLength)));

            lineItemInfo.type = "network";
            lineItemInfo["networkType"] = "custom_native";
            lineItemInfo["enableOverrides"] = true;
            lineItemInfo["overrideFields"] = {
                custom_event_class_name: networkClass.value,
                custom_event_class_data: customEventData
            };

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
}