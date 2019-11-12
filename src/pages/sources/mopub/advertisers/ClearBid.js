import AbstractAdvertiser from '../../../sources/AbstractAdvertiser'

export class ClearBid extends AbstractAdvertiser {

    static advertiser = "clearbid";

    NETWORK_CLASS = {
        "": [],
        iphone: [
            {value: 'MPUberMediaBannerCustomEvent', label: 'Banner'},
            {value: 'ClearBidMPInterstitialCustomEvent', label: 'Interstitial'},
        ],
        android: [
            {value: 'com.ubermedia.MoPubAdapter', label: 'Banner'},
            {value: 'com.ubermedia.MoPubInterstitialAdapter', label: 'Interstitial'},
        ]
    };
}