# Overview

[PubMonkey](https://pubmonkey.postindustria.com/) is a Chrome Extension to automate Header / In-App Bidding Order setup for GAM, MoPub, AdMob ad servers.

PubMonkey allows to generate orders for: 
- Prebid Server
- OpenX Apollo (Hosted Prebid Server)
- BidMachine
- Amazon TAM (legacy)
- PubMatic OpenWrap
- PubNative HyBid
- UberMedia ClearBid
- Smaato Unified Bidding


# Build Infra

## Distribution
You can download the latest version of the extension from Chrome Web Store [here](https://chrome.google.com/webstore/detail/pubmonkey/cjbdhopmleoleednpeaknmmbepfkhaml).

Beta versions are available for download from this [S3 bucket](http://pi-pubmonkey-upload.s3-website-us-east-1.amazonaws.com/).

## Dev Build

This command builds a .crx and .zip extension packages and puts them into the `build/` directory:
```sh
export PRIVATE_KEY= #your private key
npm run crx
```
then you can find the build.crx file in the /build folder

## Installation
To install the unpacked extension see detailed instructions [here](https://developer.chrome.com/docs/extensions/mv2/getstarted/).  Long story short: open [chrome://extensions/](chrome://extensions/) enable developer mode, unpack the zip and load your extension.  Dragging .zip into that tab sometimes works too. 


# User Documentation

https://doc.pubmonkey.postindustria.com/

# Contribution

We are happy to receive any contributions in the form of Pull Requests, Issues or just drop us a line here: pubmonkey@postindustria.com.
