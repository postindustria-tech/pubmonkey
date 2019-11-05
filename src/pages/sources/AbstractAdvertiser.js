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

    setupDefaultValues(lineItemInfo, params) {
        const targetedAdUnits = params.adunits.map(id => ({
            adUnitId: id,
            includeDescendants: true
        }));
        let size = null;
        if (params.advertiser === "pubnative") {
            if (typeof NETWORK_CLASS_TO_DIMENSION[params.networkClass] !== "undefined" &&
                !isEmpty(NETWORK_CLASS_TO_DIMENSION[params.networkClass])) {
                size = NETWORK_CLASS_TO_DIMENSION[params.networkClass];
            }
        } else {
            size = params.creativeFormat;
        }

        const [width, height] = size ? size.split("x") : [0, 0];

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

    getCreativeHtmlData(params) {
        return "";
    }
}