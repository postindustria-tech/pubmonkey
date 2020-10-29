import {CreativePlaceholder, Size, Targeting} from "./dfp/DataTypes";
import {CREATIVE_GENERATION_POLICY, NETWORK_CLASS_TO_DIMENSION, PREBID_GROUP_ADVERTISERS} from "../constants/common";
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
        userAppsTargetingList: [],
        childContentEligibility: "DISALLOWED"
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
        lineItemInfo.childContentEligibility = params.childContentEligibility
        lineItemInfo.lineItemType = "PRICE_PRIORITY";
        lineItemInfo.costType = "CPM";
        lineItemInfo.creativeRotationType = "EVEN";

        if (PREBID_GROUP_ADVERTISERS.includes(params.advertiser)) {
            if(params.snippetType === "VAST") {
                lineItemInfo.environmentType = "VIDEO_PLAYER"
                lineItemInfo.targeting.requestPlatformTargeting = {targetedRequestPlatforms: ["ANY"]}
            }
            let expectedCreativesSize = []
            params.adunits.map(adunit => {
                const creative = params.adUnitsParams.find(adUnitsParam => adUnitsParam.key == adunit)
                if(params.creativeGenerationPolicy === CREATIVE_GENERATION_POLICY[0]) {
                    expectedCreativesSize.push({width: 1, height: 1})
                } else if(creative.format.indexOf(',') > -1) {
                    let formats = creative.format.replace('v', '').split(', ')
                    formats.forEach(format => {
                        let [width, height] = format.split("x")
                        expectedCreativesSize.push({width: width, height: height})
                    })
                } else {
                    let [width, height] = creative.format.replace('v', '').split("x")
                    expectedCreativesSize.push({width: width, height: height})
                }
            })
            let creativePlaceholders = []
            for (let i = 0; i < expectedCreativesSize.length; i++) {
                creativePlaceholders.push(
                    CreativePlaceholder(
                        Size(expectedCreativesSize[i].width, expectedCreativesSize[i].height, false),
                        1,
                        'PIXEL'
                    )
                )
            }
            lineItemInfo.creativePlaceholders = creativePlaceholders
        } else {
        lineItemInfo.creativePlaceholders = [
            CreativePlaceholder(
                Size(width, height, false),
                1,
                'PIXEL'
            )
        ];
        }

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