import {
    BidMachine
} from './advertisers';

export class AdvertiserFactory {

    getHandler(advertiser) {
        switch (advertiser) {
            case BidMachine.ADVERTISER:
                return new BidMachine();
            default:
                throw `Wrong advertiser ${advertiser}`;
        }
    }
}
