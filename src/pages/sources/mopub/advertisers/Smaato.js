import AbstractAdvertiser from '../../../sources/AbstractAdvertiser'

export class Smaato extends AbstractAdvertiser {

    static advertiser = "smaato";

    NETWORK_CLASS = {
        "": [],
        iphone: [
            {value: 'SMAMoPubSmaatoBannerAdapter', label: 'Banner'},
            {value: 'SMAMoPubSmaatoInterstitialAdapter', label: 'Interstitial'},
            {value: 'SMAMoPubSmaatoRewardedVideoAdapter', label: 'Rewarded Video'},
        ],
        android: [
            {value: 'SMAMoPubSmaatoBannerAdapter', label: 'Banner'},
            {value: 'SMAMoPubSmaatoInterstitialAdapter', label: 'Interstitial'},
            {value: 'SMAMoPubSmaatoRewardedVideoAdapter', label: 'Rewarded Video'},
        ]
    };
}