import AbstractAdvertiser from '../../../sources/AbstractAdvertiser'
import {toDecimal, toInteger, toValidUI} from "../../../helpers";

export class ApolloSDK extends AbstractAdvertiser {

    static advertiser = "apolloSDK";

    NETWORK_CLASS = {
        "": [
            {value: '', label: 'Please select OS'},
        ],
        iphone: [
            {value: 'OXAMoPubBannerAdapter', label: 'Banner'},
            {value: 'OXAMoPubInterstitialAdapter', label: 'Interstitial'},
            {value: 'OXAMoPubRewardedVideoAdapter', label: 'Rewarded Video'},
            {value: 'OXAMoPubVideoInterstitialAdapter', label: 'video intersitial'}
        ],
        android: [
            {value: 'com.mopub.mobileads.OpenXApolloBannerAdapter', label: 'Banner'},
            {value: 'com.mopub.mobileads.OpenXApolloInterstitialAdapter', label: 'Interstitial'},
            {value: 'com.mopub.mobileads.OpenXApolloRewardedVideoAdapter', label: 'Rewarded Video'},
        ]
    };

    CREATIVE_FORMATS = {
        "": "All",
        "320x50": "320 x 50 (Banner)",
        "300x250": "300 x 250 (MRect)",
        "728x90": "728 x 90 (Tablet Leaderboard)",
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
            granularity,
            customEventClassName,
            customEventData,
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

        rangeFrom = toInteger(rangeFrom);
        rangeTo = toInteger(rangeTo);
        step = toInteger(step);

        let mask = "{bid}";

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
                step = toInteger(0.05);
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

        return lineItems;
    }

    createCreatives(lineItemKey, params, cb, currentAdUnit = null) {
        const creativeParams = Object.assign({}, params)

        if(currentAdUnit){
            creativeParams.creativeFormat = creativeParams.creativeFormat && creativeParams.creativeFormat.length
                ? creativeParams.creativeFormat
                : (params.adUnitsParams.find(adunit => adunit.key == currentAdUnit) || {}).format
        }

        const creative = {
            adType: "html",
            dimensions: creativeParams.creativeFormat,
            extended: {
                htmlData: creativeParams.creativeSnippet,//this.getCreativeHtmlData(params),
                isMraid: false
            },
            format: creativeParams.creativeFormat,
            imageKeys: [],
            lineItemKey: lineItemKey,
            name: "Creative ".concat(creativeParams.creativeFormat)
        };
        if (cb) {
            const result = cb(creative)
                .then(result => {})
                .catch(error => {
                    console.log('Create creative error', creative, error)
                });
        }
        return creative;
    }

    getCreativeHtmlData(params) {
        return '<script src = "https://cdn.jsdelivr.net/npm/prebid-universal-creative@latest/dist/creative.js"></script>\n' +
            "<script>\n" +
            "   var ucTagData = {};\n" +
            '   ucTagData.adServerDomain = "";\n' +//' + params.adServerDomain + '
            '   ucTagData.cacheHost = "";\n' +
            '   ucTagData.cachePath = "";\n' +
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
}