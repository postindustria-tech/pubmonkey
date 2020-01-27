import AbstractAdvertiser from '../../../sources/AbstractAdvertiser'
import {toDecimal, toInteger, toValidUI} from "../../../helpers";
import {PRICE_GRID} from "../../../constants/common";

export class ClearBid extends AbstractAdvertiser {

    static advertiser = "clearbid";

    NETWORK_CLASS = {
        "": [
            {value: '', label: 'Please select OS'},
        ],
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
            customEventClassName,
            customEventData,
            priceGrid,
            priceBand,
        } = params;

        let lineItemInfo = {...this.lineItemInfo},
            lineItems = [],
            bid;

        lineItemInfo.type = "network";
        lineItemInfo["networkType"] = "custom_native";
        lineItemInfo["enableOverrides"] = true;
        lineItemInfo["overrideFields"] = {
            custom_event_class_name: customEventClassName,
            custom_event_class_data: customEventData
        };

        if (PRICE_GRID.non_uniform === priceGrid) {
            priceBand.split(',').map(price => {
                const bidDecimal = parseFloat(price);
                lineItems.push({
                    adUnitKeys: adunits,
                    bid: bidDecimal,
                    name: lineItemsNaming.replace("{bid}", price),
                    orderKey: orderKey,
                    keywords: [keywordTemplate.replace("{bid}", price)],
                    ...lineItemInfo
                });
            });
        } else {
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

                lineItems.push({
                    adUnitKeys: adunits,
                    bid: bidDecimal,
                    name: name,
                    orderKey: orderKey,
                    keywords: keywords,
                    ...lineItemInfo
                });
            }
        }

        return lineItems;
    }
}