import AbstractAdvertiser from '../../../sources/AbstractAdvertiser'

export class PubNative extends AbstractAdvertiser {

    static advertiser = "pubnative";

    NETWORK_CLASS = {
        "": {
            "": "Please select OS"
        },
        iphone: {
            "": "All",
            HyBidMoPubLeaderboardCustomEvent: "728x90 Leaderboard",
            HyBidMoPubBannerCustomEvent: "320x50 Banner",
            HyBidMoPubMRectCustomEvent: "300x250 MRect",
            HyBidMoPubInterstitialCustomEvent: "Interstitial"
        },
        android: {
            "": "All",
            "net.pubnative.lite.adapters.mopub.PNLiteMoPubBannerCustomEvent": "320x50 Banner",
            "net.pubnative.lite.adapters.mopub.PNLiteMoPubMRectCustomEvent": "300x250 Banner",
            "net.pubnative.lite.adapters.mopub.PNLiteMoPubInterstitialCustomEvent": "Interstitial"
        }
    };
}