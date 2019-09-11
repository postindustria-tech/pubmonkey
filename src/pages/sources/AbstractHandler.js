
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

    getOrdersAfter(ordersOriginal) {
        return ordersOriginal;
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

    updateOrderStatus(status, id) {

    }

    getOrderUrl(key) {
        return "";
    }
}