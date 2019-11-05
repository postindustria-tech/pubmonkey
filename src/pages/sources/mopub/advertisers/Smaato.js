import AbstractAdvertiser from '../../../sources/AbstractAdvertiser'

export class Smaato extends AbstractAdvertiser {

    static advertiser = "smaato";

    NETWORK_CLASS = {
        "": {
            "": "Please select OS"
        },
        iphone: {
            "": "All",
            "SMAMoPubSmaatoBannerAdapter": "Banner",
            "SMAMoPubSmaatoInterstitialAdapter": "Interstitial",
            "SMAMoPubSmaatoRewardedVideoAdapter": "Rewarded Video"
        },
        android: {
            "": "All",
            "SMAMoPubSmaatoBannerAdapter": "Banner",
            "SMAMoPubSmaatoInterstitialAdapter": "Interstitial",
            "SMAMoPubSmaatoRewardedVideoAdapter": "Rewarded Video"
        }
    };
}