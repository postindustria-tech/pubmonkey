import AbstractAdvertiser from '../../../sources/AbstractAdvertiser'
import {toDecimal, toInteger, toValidUI} from "../../../helpers";

export class BidMachine extends AbstractAdvertiser {

    static advertiser = "bidmachine";

    NETWORK_CLASS = {
        "": [
            {value: '', label: 'Please select OS'},
        ],
        iphone: [
            {value: 'BidMachineBannerCustomEvent', label: 'Banner'},
            {value: 'BidMachineInterstitialCustomEvent', label: 'Interstitial'},
            {value: 'BidMachineRewardedVideoCustomEvent', label: 'Rewarded Video'},
            {value: 'BidMachineNativeAdCustomEvent', label: 'Native'}
        ],
        android: [
            {value: 'com.mopub.mobileads.BidMachineBanner', label: 'Banner'},
            {value: 'com.mopub.mobileads.BidMachineInterstitial', label: 'Interstitial'},
            {value: 'com.mopub.mobileads.BidMachineRewardedVideo', label: 'Rewarded Video'},
            {value: 'com.mopub.nativeads.BidMachineNative', label: 'Native'}
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
            keywordTemplate,
            lineItemsNaming,
            customEventClassName,
            customEventData,
            BidMachinePriceGrid,
        } = params;

        let lineItemInfo = {...this.lineItemInfo},
            lineItems = []

        lineItemInfo.type = "network";
        lineItemInfo["networkType"] = "custom_native";
        lineItemInfo["enableOverrides"] = true;
        lineItemInfo["overrideFields"] = {
            custom_event_class_name: customEventClassName,
            custom_event_class_data: customEventData
        };

        let mask = "{bid}";

        let bids = []

        BidMachinePriceGrid.split(/\r?\n/).forEach(element => {
            var number = parseFloat(element.match(/[\d\.]+/))
            if (number) {
                bids.push(number)
                const bidDecimal = toDecimal(number);
            }

        })

        let adType = ''

        try {
            adType = this.NETWORK_CLASS.android.find(object => object.value === customEventClassName).label
        } catch (e) {
            try {
                adType = this.NETWORK_CLASS.iphone.find(object => object.value === customEventClassName).label
            } catch (er) {
                adType = ''
            }
        }

        lineItems = bids.map(bid => {
            return {
                adUnitKeys: adunits,
                bid: bid,
                name: lineItemsNaming.replace("{bid}", bid.toFixed(2)).replace('{ad_type}',adType),
                orderKey: orderKey,
                keywords: [keywordTemplate.replace(mask, bid.toFixed(2))],
                ...lineItemInfo
            }
        });

        return lineItems;
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

    getVastTagUrl() {
        return "https://js.bidmachine.io/gam_lightweight.xml"
    }
}