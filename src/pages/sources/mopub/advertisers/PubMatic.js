import AbstractAdvertiser from '../../../sources/AbstractAdvertiser'

export class PubMatic extends AbstractAdvertiser {

    static advertiser = "pubmatic";

    NETWORK_CLASS = {
        "": [],
        iphone: [
            {value: 'POBBannerCustomEvent', label: 'Banner'},
            {value: 'POBInterstitialCustomEvent', label: 'Interstitial'},
        ],
        android: [
            {value: 'POBBannerCustomEvent', label: 'Banner'},
            {value: 'POBInterstitialCustomEvent', label: 'Interstitial'},
        ]
    };
}