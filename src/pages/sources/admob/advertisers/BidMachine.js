import AbstractAdvertiser from '../../../sources/AbstractAdvertiser'
import {toDecimal, toInteger} from "../../../helpers";

export class BidMachine extends AbstractAdvertiser {

    static advertiser = "bidmachine";

    NETWORK_CLASS = {
        "": [
            {value: '', label: 'Please select OS'},
        ],
        iphone: [
            {value: 'BidMachineCustomEventBanner', label: 'Banner'},
            {value: 'BidMachineCustomEventInterstitial', label: 'Interstitial'},
            {value: 'BidMachineCustomEventRewarded', label: 'Rewarded Video'},
            {value: 'BidMachineCustomEventNativeAd', label: 'Native'}
        ],
        android: [
            {value: 'com.google.ads.mediation.bidmachine.BidMachineCustomEventBanner', label: 'Banner'},
            {value: 'com.google.ads.mediation.bidmachine.BidMachineCustomEventInterstitial', label: 'Interstitial'},
            {value: 'com.google.ads.mediation.bidmachine.BidMachineMediationRewardedAdAdapter', label: 'Rewarded Video'},
            {value: 'com.google.ads.mediation.bidmachine.BidMachineCustomEventNative', label: 'Native'}
        ]
    };

    CREATIVE_FORMATS = {
        "": "All",
        "320x50": "320 x 50 (Banner)",
        "300x250": "300 x 250 (MRect)",
        "728x90": "728 x 90 (Tablet Leaderboard)",
    };

    lineItemInfo = {
        "2": "7",
        "3": 1,
        "4": 2,
        "11": 1
    };

    composerLineItems(params) {
        let {
            adunits,
            keywordTemplate,
            lineItemsNaming,
            customEventClassName,
            BidMachinePriceGrid,
            adType
        } = params;

        let lineItemInfo = {...this.lineItemInfo},
            lineItems = []

        let mask = "{bid}";

        let bids = [];

        BidMachinePriceGrid.split(/\r?\n/).forEach(element => {
            var number = parseFloat(element.match(/[\d\.]+/))
            if (number) {
                bids.push(number)
            }
        })

        lineItems = bids.map(bid => {

            const keywords = [];
            adunits.forEach(adunit => {
                keywords.push({
                    "1": adunit,
                    "2": {
                        "1": [
                            {
                                "1": "label",
                                "2": keywordTemplate.replace(mask, bid)
                            },
                            {
                                "1": "class_name",
                                "2": customEventClassName
                            },
                            {
                                "1": "parameter",
                                "2": JSON.stringify({"bm_pf":bid.toString()})
                            }
                        ]
                    }
                })
            })

            return {
                "5": {
                    "1": (toInteger(bid) * 10000),
                    "2": "USD"
                },
                "7": keywords,
                "9": lineItemsNaming.replace("{bid}", bid).replace('{ad_type}',adType),
                ...lineItemInfo
            }
        });

        lineItems = lineItems.slice(0, 49);

        lineItems.push({
            "2": "1",
            "3": 1,
            "4": 1,
            "5": {
                "1": "10000",
                "2": "USD"
            },
            "6": false,
            "9": "AdMob Network",
            "11": 1
        });

        return lineItems;
    }

    getVastTagUrl() {
        return ""
    }
}