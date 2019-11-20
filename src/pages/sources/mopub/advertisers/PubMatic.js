import AbstractAdvertiser from '../../../sources/AbstractAdvertiser'

export class PubMatic extends AbstractAdvertiser {

    static advertiser = "pubmatic";

    NETWORK_CLASS = {
        "": [],
        iphone: [
            {value: '<YourAppName>.POBBannerCustomEvent', label: 'Banner'},
            {value: '<YourAppName>.POBInterstitialCustomEvent', label: 'Interstitial'},
        ],
        android: [
            {value: '<ClassPackageName>.POBBannerCustomEvent', label: 'Banner'},
            {value: '<ClassPackageName>.POBInterstitialCustomEvent', label: 'Interstitial'},
        ]
    };
}