# Welcome to PubMonkey!

## Releases

Current [Live](https://chrome.google.com/webstore/detail/cjbdhopmleoleednpeaknmmbepfkhaml/publish-accepted?authuser=0&hl=en) version is `2.9.0.4`

Betas are available [here](http://pi-pubmonkey-upload.s3-website-us-east-1.amazonaws.com/).  Please feel free to try and install a beta which might contain the functionality not yet available in a live release.  For instructions on how to install a Chrome extension from a .zip archive see this [doc](install.md)

Please read detailed [release notes](changelog.md)

## Features

* Account info: number of apps, orders and ad units [__GAM__, __MoPub__]
* Orders [__GAM__, __MoPub__]
* [Export and import orders](order-actions.md#export) [__GAM__, __MoPub__]
* [Archive orders](order-actions.md#archive) [__GAM__, __MoPub__]
* [Run / pause orders](order-actions.md#pause) [__MoPub__]
* [Generate](order-actions.md#generate-orders) orders for several header bidding services:
 	* [Prebid.org](order-actions.md#generate-a-prebid-order) [__GAM__, __MoPub__]
 	* OpenX Apollo [__GAM__, __MoPub__]
 	* OpenX Apollo SDK [__GAM__, __MoPub__]
 	* BidMachine [__GAM__, __MoPub__] (BidMachine documentation on [GAM integration](https://doc.bidmachine.io/eng/ssp-publisher-integration-documentation/bidmachine-sdk-admanager-appevent-integration), [MoPub integration](https://doc.bidmachine.io/eng/ssp-publisher-integration-documentation/bidmachine-custom-adapters/bidmachine-mopub-custom-network-integration-guide))
 	* [Amazon TAM](order-actions.md#generate-an-amazon-tam-order) [__GAM__, __MoPub__]
 	* Smaato [__MoPub__]
 	* PubMatic [__MoPub__] 
 	* PubNative HyBid[__MoPub__]

* Ad Units [__MoPub__]
* Export ad unit ad sources state [__MoPub__]
* To connect to your GAM (Google Ad Manager account) follow [this short instruction](connecting-to-google-ad-manager.md)

