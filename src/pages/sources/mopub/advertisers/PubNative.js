import AbstractAdvertiser from '../../../sources/AbstractAdvertiser'
import {toDecimal, toInteger, toValidUI} from "../../../helpers";

export class PubNative extends AbstractAdvertiser {

    static advertiser = "pubnative";

    NETWORK_CLASS = {
        "": [],
        iphone: [
            {value: '', label: 'All'},
            {value: 'HyBidMoPubLeaderboardCustomEvent', label: '728x90 Leaderboard'},
            {value: 'HyBidMoPubBannerCustomEvent', label: '320x50 Banner'},
            {value: 'HyBidMoPubMRectCustomEvent', label: '300x250 MRect'},
            {value: 'HyBidMoPubInterstitialCustomEvent', label: 'Interstitial'},
        ],
        android: [
            {value: '', label: 'All'},
            {value: 'net.pubnative.lite.adapters.mopub.PNLiteMoPubBannerCustomEvent', label: '320x50 Banner'},
            {value: 'net.pubnative.lite.adapters.mopub.PNLiteMoPubMRectCustomEvent', label: '300x250 Banner'},
            {value: 'net.pubnative.lite.adapters.mopub.PNLiteMoPubInterstitialCustomEvent', label: 'Interstitial'},
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
            Ad_ZONE_ID,
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
                s = toDecimal(step),
                bidValue = bidDecimal.toFixed(stepDecimalPartLength);

            let name = lineItemsNaming.replace("{bid}", bidValue),
                keywords = [];

            const to = +toValidUI(bidDecimal + s).toFixed(2);

            for (let i = toInteger(bidDecimal); i < toInteger(to); i += toInteger(keywordStep)) {
                const key = toDecimal(i);
                const value = key.toFixed(keywordStepDecimalPartLength),
                    keyword = keywordTemplate.replace("{bid}", value);
                keywords.push(keyword);
            }

            lineItemInfo.type = "network";
            lineItemInfo["networkType"] = "custom_native";
            lineItemInfo["enableOverrides"] = true;
            lineItemInfo["overrideFields"] = {
                custom_event_class_name: networkClass.value,
                custom_event_class_data: '{"pn_zone_id": "' + Ad_ZONE_ID + '"}'
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