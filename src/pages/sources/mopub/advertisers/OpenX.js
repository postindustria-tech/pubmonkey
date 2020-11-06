import AbstractAdvertiser from '../../../sources/AbstractAdvertiser'
import {toDecimal, toInteger, toValidUI} from "../../../helpers";

export class OpenX extends AbstractAdvertiser {

    static advertiser = "openx";

    CREATIVE_FORMATS = {
        "": "All",
        "320x50": "320 x 50 (Banner)",
        "300x250": "300 x 250 (MRect)",
        "728x90": "728 x 90 (Tablet Leaderboard)",
    };

    composerLineItems(orderKey, params) {
        let {
            adunits,
            step,
            keywordStep,
            keywordTemplate,
            rangeFrom,
            rangeTo,
            lineItemsNaming,
            granularity,
        } = params;

        let lineItemInfo = {...this.lineItemInfo},
            lineItems = [],
            bid;

        rangeFrom = toInteger(rangeFrom);
        rangeTo = toInteger(rangeTo);
        step = toInteger(step);

        let mask = "{bid}";

        const keywordStepDecimalPartLength = (keywordStep + "").replace(/^[-\d]+\./, "").length;
        let stepDecimalPartLength = (step + "").replace(/^[-\d]+\./, "").length;
        if (step >= 100) {
            stepDecimalPartLength--;
        }

        let bids = [], skip = false;
        switch (granularity) {
            case 'low':
                bids.push(toDecimal(0.00).toFixed(2));
                step = rangeFrom = toInteger(0.5);
                rangeTo = toInteger(5);
                for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                    bids.push(toDecimal(bid).toFixed(2));
                }
                break;
            case 'med':
                bids.push(toDecimal(0.00).toFixed(2));
                step = rangeFrom = toInteger(0.1);
                rangeTo = toInteger(20);
                for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                    bids.push(toDecimal(bid).toFixed(2));
                }
                break;
            case 'high':
                skip = true;
                step = rangeFrom = toInteger(0.1);
                rangeTo = toInteger(20);
                keywordStep = 0.01;
                for (bid = rangeFrom; bid <= rangeTo; bid += step) {

                    const bidDecimal = toDecimal(bid).toFixed(2);

                    let keywords = [];
                    const to = +toValidUI(toDecimal(bid) + toDecimal(step)).toFixed(2);

                    for (let i = toInteger(bidDecimal); i < toInteger(to); i += toInteger(keywordStep)) {
                        const key = toDecimal(i);
                        const value = key.toFixed(keywordStepDecimalPartLength),
                            keyword = keywordTemplate.replace(mask, value);
                        keywords.push(keyword);
                    }

                    lineItems.push({
                        adUnitKeys: adunits,
                        bid: bidDecimal,
                        name: lineItemsNaming.replace("{bid}", bidDecimal),
                        orderKey: orderKey,
                        keywords: keywords,
                        ...lineItemInfo
                    });
                }
                break;
            case 'auto':
                bids.push(toDecimal(0.00).toFixed(2));
                // 0.05 ... 5 (0.05)
                step = rangeFrom = toInteger(0.05);
                rangeTo = toInteger(5);
                for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                    bids.push(toDecimal(bid).toFixed(2));
                }
                // 5.1 ... 10 (0.1)
                step = toInteger(0.1);
                rangeFrom = toInteger(5.1);
                rangeTo = toInteger(10);
                for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                    bids.push(toDecimal(bid).toFixed(2));
                }
                // 10.5 ... 20 (0.5)
                step = toInteger(0.5);
                rangeFrom = toInteger(10.5);
                rangeTo = toInteger(20);
                for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                    bids.push(toDecimal(bid).toFixed(2));
                }
                break;
            case 'dense':
                // 0.01 ... 3 (0.01)
                step = rangeFrom = toInteger(0.01);
                rangeTo = toInteger(3);
                for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                    bids.push(toDecimal(bid).toFixed(2));
                }
                // 3.05 ... 8 (0.05)
                step = toInteger(0.05);
                rangeFrom = toInteger(3.05);
                rangeTo = toInteger(8);
                for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                    bids.push(toDecimal(bid).toFixed(2));
                }
                // 8.5 ... 20 (0.5)
                step = toInteger(0.5);
                rangeFrom = toInteger(8.5);
                rangeTo = toInteger(20);
                for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                    bids.push(toDecimal(bid).toFixed(2));
                }
                break;
        }

        if (!skip) {
            lineItems = bids.map(bid => {

                return {
                    adUnitKeys: adunits,
                    //if bid = 0.00 : price = 0.01
                    bid: bid != 0 ? bid : 0.01,
                    name: lineItemsNaming.replace("{bid}", bid),
                    orderKey: orderKey,
                    keywords: [keywordTemplate.replace(mask, bid)],
                    ...lineItemInfo
                }
            });
        }

        return lineItems;
    }

    createCreatives(lineItemKey, params, cb, currentAdUnit = null) {
        const creativeParams = Object.assign({}, params)

        if(currentAdUnit){
            creativeParams.creativeFormat = creativeParams.creativeFormat && creativeParams.creativeFormat.length
                ? creativeParams.creativeFormat
                : (params.adUnitsParams.find(adunit => adunit.key == currentAdUnit) || {}).format
        }

        const creative = {
            adType: "html",
            dimensions: creativeParams.creativeFormat,
            extended: {
                htmlData: creativeParams.creativeSnippet,//this.getCreativeHtmlData(params),
                isMraid: false
            },
            format: creativeParams.creativeFormat,
            imageKeys: [],
            lineItemKey: lineItemKey,
            name: "Creative ".concat(creativeParams.creativeFormat)
        };
        if (cb) {
            const result = cb(creative)
            .then(result => {})
            .catch(error => {
                console.log('Create creative error', creative, error)
            });
        }
        return creative;
    }

    getCreativeHtmlData(params) {
        return '<script src = "https://cdn.jsdelivr.net/npm/prebid-universal-creative@latest/dist/creative.js"></script>\n' +
            "<script>\n" +
            "   var ucTagData = {};\n" +
            '   ucTagData.adServerDomain = "";\n' +//' + params.adServerDomain + '
            '   ucTagData.cacheHost = "";\n' +
            '   ucTagData.cachePath = "";\n' +
            '   ucTagData.pubUrl = "%%KEYWORD:url%%";\n' +
            '   ucTagData.targetingKeywords = "%%KEYWORDS%%";\n' +
            '   ucTagData.hbPb = "%%KEYWORD:hb_pb%%";\n' +
            "   try {\n" +
            "       ucTag.renderAd(document, ucTagData);\n" +
            "   } catch (e) {\n" +
            "       console.log(e);\n" +
            "   }\n" +
            "</script>";
    }
}