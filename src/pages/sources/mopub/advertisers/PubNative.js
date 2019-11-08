import AbstractAdvertiser from '../../../sources/AbstractAdvertiser'

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
}