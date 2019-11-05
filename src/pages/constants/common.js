export const ONLY_NUMBERS = /^[0-9\b\.]+$/;

export const KEYWORD_TEMPLATE_DEFAULT_VALUE = {
  pubnative: "pn_bid:{bid}",
  openx: "hb_pb:{bid}",
  amazon: "amznslots:m{format}p{position}",
  smaato: "smaato_cpm:{bid}",
};
export const KEYWORD_PLACEHOLDER = {
  pubnative: "PN HyBid {bid}",
  openx: "hb_pb {bid}",
  amazon: "m{width}x{height}p{position}",
  smaato: "Smaato UB {bid}",
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