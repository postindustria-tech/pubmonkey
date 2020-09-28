export class DateTime {

    static to(dfpDate) {
        return new Date(dfpDate.date.year, dfpDate.date.month, dfpDate.date.day, dfpDate.hour, dfpDate.minute, dfpDate.second);
    }

    static from(today, timeZoneId, days, months) {
        return {
            date: {
                year: today.getFullYear(),
                month: today.getMonth() + 1 + (months === undefined ? 0 : months),
                day: today.getDate() + (days === undefined ? 0 : days)
            },
            hour: today.getHours(),
            minute: today.getMinutes(),
            second: today.getSeconds(),
            timeZoneId: timeZoneId
        };
    }
}

export function Money(value, currency) {
    return {
        currencyCode: currency,
        microAmount: (parseFloat(value) * 1000000).toFixed(0)
    };
}

export function Goal(goalType, unitType, units) {
    return {
        goalType: goalType,
        unitType: unitType,
        units: units
    };
}

export function Targeting(geoTargeting, inventoryTargeting, customTargeting) {
    return {
        geoTargeting: geoTargeting,
        inventoryTargeting: inventoryTargeting,
        customTargeting: customTargeting,
        // customTargeting: {
        //     logicalOperator: "OR",
        //     children: [{
        //         attributes: {
        //             "xsi:type": "CustomCriteriaSet"
        //         },
        //         logicalOperator: "AND",
        //         children: [
        //             {
        //                 attributes: {"xsi:type": "CustomCriteria"},
        //                 keyId: "11937648",
        //                 operator: "IS",
        //                 valueIds: ["448135954758"]
        //             }
        //         ]
        //     }]
        // }
        //requestPlatformTargeting: {
            //targetedRequestPlatforms: ["VIDEO_PLAYER"]
        //}
    };
}

export function Size(width, height, isAspectRatio) {
    return {
        width: width,
        height: height,
        isAspectRatio: isAspectRatio
    }
}

export function CreativePlaceholder(size, expectedCreativeCount, creativeSizeType) {
    return {
        size: size,
        expectedCreativeCount: expectedCreativeCount,
        creativeSizeType: creativeSizeType,
        isAmpOnly: false
    }
}

export function ThirdPartyCreative(advertiserId, name, size, snippet) {
    return {
        attributes: {"xsi:type": "ThirdPartyCreative"},
        advertiserId: advertiserId,
        name: name,
        size: size,
        thirdPartyDataDeclaration: {declarationType: "DECLARED", thirdPartyCompanyIds: ['2213', ]},
        snippet: snippet,
    }
}

export function VastPartyCreative(advertiserId, name, size, vastTagUrl) {
    return {
        attributes: {"xsi:type": "VastRedirectCreative"},
        advertiserId: advertiserId,
        name: name,
        size: size,
        vastXmlUrl: vastTagUrl,
        vastRedirectType: "LINEAR_AND_NON_LINEAR",
        duration: 1
    }
}

export function CustomCriteriaSet(customCriterias) {
    return {
        logicalOperator: "OR",
        children: [{
            attributes: {
                "xsi:type": "CustomCriteriaSet"
            },
            logicalOperator: "AND",
            children: customCriterias
        }]
    }
}

export function CustomCriteria(keyId, valueIds, operator = "IS") {
    return {
        attributes: {
            "xsi:type": "CustomCriteria"
        },
        keyId: keyId,
        valueIds: valueIds,
        operator: operator
    }
}

export function LineItemCreativeAssociation(lineItemId, creativeId, sizes) {
    return {
        lineItemId: lineItemId,
        creativeId: creativeId,
        sizes: sizes
    }
}

