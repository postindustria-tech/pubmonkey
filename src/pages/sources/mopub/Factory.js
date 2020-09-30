
import {
    OpenX,
    Amazon,
    PubNative,
    Smaato, ClearBid, PubMatic,
    ApolloSDK,
    Apollo,
    BidMachine,
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
            case PubMatic.ADVERTISER:
                return new PubMatic();
            case ApolloSDK.ADVERTISER:
                return new ApolloSDK();
            case Apollo.ADVERTISER:
                return new Apollo();
            case BidMachine.ADVERTISER:
                return new BidMachine();
            default:
                throw `Wrong advertiser ${advertiser}`;
        }
    }
}
