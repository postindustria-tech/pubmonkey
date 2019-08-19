import {CreativePlaceholder, Size, Targeting} from "./dfp/DataTypes";

export default class AbstractAdvertiser {

    static advertiser = null;

    static get ADVERTISER() {
        return this.advertiser;
    }

    CREATIVE_FORMATS = {};

    customTargetingKey = null;

    setupDefaultValues(lineItemInfo, params) {
        const targetedAdUnits = params.adunits.map(id => ({
            adUnitId: id,
            includeDescendants: true
        }));
        const [width, height] = params.creativeFormat.split("x");

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

    getCreativeHtmlData(creativeFormat) {
        return "";
    }
}