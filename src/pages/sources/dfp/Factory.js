
import {
    OpenX,
    Amazon,
    PubNative,
    ApolloSDK
} from './advertisers';

export class AdvertiserFactory {

    getHandler(advertiser) {
        switch (advertiser) {
            case OpenX.ADVERTISER:
                return new OpenX();
            case Amazon.ADVERTISER:
                return new Amazon();
            case PubNative.ADVERTISER:
                return new PubNative();
            case ApolloSDK.ADVERTISER:
                return new ApolloSDK();
            default:
                throw `Wrong advertiser ${advertiser}`;
        }
    }
}
