export const ONLY_NUMBERS = /^[0-9\b\.]+$/;
export const AMAZON_KVP_FORMAT = /(^[^:]+):{1}([^:]+)$/;

export const KEYWORD_TEMPLATE_DEFAULT_VALUE = {
  pubnative: "pn_bid:{bid}",
  openx: "hb_pb:{bid}",
  apollo: "hb_pb:{bid}",
  apolloSDK: "hb_pb:{bid}",
  amazon: "amznslots:m{format}p{position}",
  smaato: "smaato_cpm:{bid}",
  clearbid: "um_price:{bid}",
  pubmatic: "pwtbst:1 AND pwtplt:inapp AND pwtpb:{bid}",
  bidmachine: "bm_pf:{bid}",
};
export const PRICE_GRID = {
  uniform: 'uniform',
  non_uniform: 'non-uniform'
};
export const KEYWORD_PLACEHOLDER = {
  pubnative: "PN HyBid {bid}",
  openx: "hb_pb {bid}",
  apollo: "openx-apollo-prebid_{bid}",
  apolloSDK: "openx-apollo-prebid_{bid}",
  amazon: "m{width}x{height}p{position}",
  smaato: "Smaato UB {bid}",
  clearbid: "um_price {bid}",
  pubmatic: "pwtpb {bid}",
  bidmachine: "bidmachine_{ad_type}_{bid}"
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

export const PREBID_GROUP_ADVERTISERS = [
  "openx",
  "apollo",
  "apolloSDK",
  "bidmachine",
];

export const CREATIVE_GENERATION_POLICY = [
    "1x1 creative per ad unit (suitable for web setup)",
    "generate a single creative of ad unit size per targeted ad unit",
    "single creative 1x1"
]

export const MOPUB_CREATIVE_FORMAT = {
  "native" : {type: "Native", dimensions: []},
  "full": {type: "full", dimensions: ["320x480","320x568","300x600","360x640","768x1024","300x1050"]},
  "rewarded_video": {type: "Rewarded Video", dimensions: []},
  "medium_rectangle": {type: "Medium Rectangle", dimensions: ["336x280", "300x250"]},
  "banner": {type: "Banner", dimensions: [ "300x50","320x50", "468x60","728x90","970x90","970x250"]},
}