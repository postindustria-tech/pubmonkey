
export default class AbstractHandler {

    static source = null;

    advertiserFactory = null;
    advertiser = null;

    ADVERTISER_DEFAULT_NAME = {};
    FILTER_FN = [];
    STATUS_OPTIONS = [];

    setAdvertiserFactory(advertiserFactory) {
        this.advertiserFactory = advertiserFactory;
    }

    getAdvertiserFactory() {
        return this.advertiserFactory;
    }

    setAdvertiser(advertiser) {
        this.advertiser = this.advertiserFactory.getHandler(advertiser);
    }

    getAdvertiser() {
        return this.advertiser;
    }

    /**
     * Check if handler configured properly and ready to make requests
     * @returns {boolean}
     */
    isReady() {
        return true;
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