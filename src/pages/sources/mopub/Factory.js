
import {
    OpenX,
    Amazon,
    PubNative,
    Smaato, ClearBid
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
            case Smaato.ADVERTISER:
                return new Smaato();
            case ClearBid.ADVERTISER:
                return new ClearBid();
            default:
                throw `Wrong advertiser ${advertiser}`;
        }
    }
}
