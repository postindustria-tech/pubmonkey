export const KEYWORD_TEMPLATE_DEFAULT_VALUE = {
  pubnative: "pn_bid:{bid}",
  openx: "hb_pb:{bid}",
  amazon: "amznslots:m{format}p{position}"
};
export const KEYWORD_PLACEHOLDER = {
  pubnative: "PN HyBid {bid}",
  openx: "hb_pb {bid}",
  amazon: "m320x50p{position}"
};
export const NETWORK_CLASS = {
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
export const NETWORK_CLASS_TO_DIMENSION = {
  "HyBidMoPubLeaderboardCustomEvent": "728x90",
  "HyBidMoPubBannerCustomEvent": "320x50",
  "HyBidMoPubMRectCustomEvent": "300x250",
  "HyBidMoPubInterstitialCustomEvent": "",
  "net.pubnative.lite.adapters.mopub.PNLiteMoPubBannerCustomEvent": "320x50",
  "net.pubnative.lite.adapters.mopub.PNLiteMoPubMRectCustomEvent": "300x250",
  "net.pubnative.lite.adapters.mopub.PNLiteMoPubInterstitialCustomEvent": ""
};