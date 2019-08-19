
import {
    OpenX,
    Amazon,
    PubNative
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
            default:
                throw `Wrong advertiser ${advertiser}`;
        }
    }
}
