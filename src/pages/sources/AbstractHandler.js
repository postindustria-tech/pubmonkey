export default class AbstractHandler {

    static source = null;

    advertiserFactory = null;
    advertiser = null;

    ADVERTISER_DEFAULT_NAME = {};

    setAdvertiserFactory(advertiserFactory) {
        this.advertiserFactory = advertiserFactory;
    }

    getAdvertiserFactory() {
        return this.advertiserFactory;
    }

    setAdvertiser(advertiser) {
        this.advertiser = this.advertiserFactory.getHandler(advertiser);
        console.log(`set advertiser ${advertiser}`);
    }

    getAdvertiser() {
        return this.advertiser;
    }

    getAdUnits() {

    }

    composeOrderRequest(advertiser, name) {
        return {
            advertiser: advertiser,
            description: "",
            name: name
        }
    }

    collectOrderDataFromSet() {

    }
}