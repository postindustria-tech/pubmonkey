import {CreativePlaceholder, Size, Targeting} from "./dfp/DataTypes";
import {NETWORK_CLASS_TO_DIMENSION} from "../constants/common";
import {isEmpty} from "../helpers";

export default class AbstractAdvertiser {

    static advertiser = null;

    static get ADVERTISER() {
        return this.advertiser;
    }

    CREATIVE_FORMATS = {};
    NETWORK_CLASS = {};

    customTargetingKey = null;

    lineItemInfo = {
        allocationPercentage: 100,
        bidStrategy: "cpm",
        budget: null,
        budgetStrategy: "allatonce",
        budgetType: "unlimited",
        dayPartTargeting: "alltime",
        deviceTargeting: false,
        end: null,
        frequencyCapsEnabled: false,
        includeConnectivityTargeting: "all",
        includeGeoTargeting: "all",
        maxAndroidVersion: "999",
        maxIosVersion: "999",
        minAndroidVersion: "1.5",
        minIosVersion: "2.0",
        priority: 12,
        refreshInterval: 0,
        start: "2019-05-01T00:00:00.000Z",
        startImmediately: true,
        targetAndroid: false,
        targetIOS: "unchecked",
        targetIpad: false,
        targetIphone: false,
        targetIpod: false,
        type: "non_gtee",
        userAppsTargeting: "include",
        userAppsTargetingList: []
    };

    getDefaultSize(params){
        let size = null;
        if (params.advertiser === "pubnative") {
            if (typeof NETWORK_CLASS_TO_DIMENSION[params.customEventClassName] !== "undefined" &&
                !isEmpty(NETWORK_CLASS_TO_DIMENSION[params.customEventClassName])) {
                size = NETWORK_CLASS_TO_DIMENSION[params.customEventClassName];
            }
        } else {
            size = params.creativeFormat;
        }

        return size ? size.split("x") : [0, 0];
    }

    setupDefaultValues(lineItemInfo, params) {
        const targetedAdUnits = params.adunits.map(id => ({
            adUnitId: id,
            includeDescendants: true
        }));

        const [width, height] = this.getDefaultSize(params);

        lineItemInfo.targeting = Targeting(
            {
                targetedLocations: []
            },
            {
                targetedAdUnits: targetedAdUnits
            },
            {}
        );

        lineItemInfo.lineItemType = "PRICE_PRIORITY";
        lineItemInfo.costType = "CPM";
        lineItemInfo.creativeRotationType = "EVEN";
        lineItemInfo.creativePlaceholders = [
            CreativePlaceholder(
                Size(width, height, false),
                1,
                'PIXEL'
            )
        ];

        return lineItemInfo;
    }

    createCreatives(lineItemKey, params, cb) {
        return {};
    }

    getCreativeHtmlData(params) {
        return "";
    }

    composerLineItems(orderKey, params) {
        return [];
    }
}