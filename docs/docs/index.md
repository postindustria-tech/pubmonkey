# Welcome to PubMonkey!

## Releases

Current [Live](https://chrome.google.com/webstore/detail/cjbdhopmleoleednpeaknmmbepfkhaml/publish-accepted?authuser=0&hl=en) version is `2.6.1`

Betas are available [here](http://pi-pubmonkey-upload.s3-website-us-east-1.amazonaws.com/).  Please feel free to try and install a beta which might contain the functionality not yet available in a live release.  For instructions on how to install a Chrome extension from a .zip archive see this [doc](install.md)

Please read detailed [release notes](changelog.md)

## Features

* Account info: number of apps, orders and ad units [__MoPub__, __GAM__]
* Orders [__MoPub__, __GAM__]
* [Export and import orders](order-actions.md#export) [__MoPub__, __GAM__]
* [Archive orders](order-actions.md#archive) [__MoPub__, __GAM__]
* [Run / pause orders](order-actions.md#pause) [__MoPub__]
* Generate orders for several header bidding services (Prebid.org [__MoPub__, __GAM__], Amazon TAM [__MoPub__, __GAM__], Smaato [__MoPub__], PubMatic [__MoPub__], PubNative HyBid[__MoPub__])
* Ad Units [__MoPub__]
* Export ad unit ad sources state [__MoPub__]

## Use Cases

To connect to your GAM (Google Ad Manager account) follow [this short instruction](connecting-to-google-ad-manager.md)

### How to generate

To generate an Order click **CREATE** button.  In general the fields on the Order generation form are self explanatory, but we've added an instruction for the most popular solutions:

* [a Prebid.org order](generate-prebid.md)
* [an Amazon TAM order](generate-amazon.md)
* a Smaato order
* a PubMatic OpenWrap order
* a PubNative HyBid order

### Other

* export MoPub ad unit ad sources