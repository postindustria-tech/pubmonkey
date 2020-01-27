import AbstractAdvertiser from '../../../sources/AbstractAdvertiser'
import {toDecimal, toInteger, toValidUI} from "../../../helpers";
import {AMAZON_KVP_FORMAT, AMAZON_PRICE_GRID} from "../../../constants/common";

export class Amazon extends AbstractAdvertiser {

    static advertiser = "amazon";

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
            amazonStartPrice,
            amazonStep,
            amazonPriceGrid,
            amazonCSVItems,
        } = params;

        let lineItemInfo = {...this.lineItemInfo},
            lineItems = [],
            bid;

        rangeFrom = toInteger(rangeFrom);
        rangeTo = toInteger(rangeTo);
        step = toInteger(step);

        const mask = "{position}";
        let stepDecimalPartLength = (step + "").replace(/^[-\d]+\./, "").length;
        if (step >= 100) {
            stepDecimalPartLength--;
        }

        if (AMAZON_PRICE_GRID.non_uniform === amazonPriceGrid) {
            amazonCSVItems.map(line => {
                const match = line.match(AMAZON_KVP_FORMAT);
                const bidDecimal = parseFloat(match[2]);
                lineItems.push({
                    adUnitKeys: adunits,
                    bid: bidDecimal,
                    name: line.substring(0, line.indexOf(':')),
                    orderKey: orderKey,
                    keywords: ["amznslots:" + line.substring(0, line.indexOf(':'))],
                    ...lineItemInfo
                });
            });
        } else {
            let startPriceIndex = 0;
            for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                const bidDecimal = amazonStartPrice + startPriceIndex * amazonStep,
                    s = toDecimal(step),
                    bidValue = bidDecimal.toFixed(stepDecimalPartLength);

                let name = lineItemsNaming.replace("{bid}", bidValue),
                    keywords = [];

                for (let i = 0; i < keywordStep; i += 1) {
                    i = toValidUI(i);
                    const keyword = keywordTemplate.replace(mask, i + bid / 100);
                    keywords.push(keyword);
                }
                name = name.replace("{position}", bid / 100);

                lineItems.push({
                    adUnitKeys: adunits,
                    bid: bidDecimal,
                    name: name,
                    orderKey: orderKey,
                    keywords: keywords,
                    ...lineItemInfo
                });
                startPriceIndex++
            }
        }

        return lineItems;
    }

    createCreatives(lineItemKey, params, cb) {
        const creative = {
            adType: "html",
            extended: {
                htmlData: this.getCreativeHtmlData(params),
                isMraid: true
            },
            format: params.creativeFormat,
            imageKeys: [],
            lineItemKey: lineItemKey,
            name: "Creative"
        };
        if (cb) {
            cb(creative);
        }
        return creative;
    }

    getCreativeHtmlData(params) {
        const [width, height] = params.creativeFormat.split("x")

        let creativeHtmlData =
            '<div style="display:inline-block">\n' +
            '    <div id="__dtbAd__" style="width:{width}px; height:{height}px; overflow:hidden;">\n' +
            "        <!--Placeholder for the Ad --> \n" +
            "    </div>\n" +
            '    <script type="text/javascript" src="mraid.js"></script>\n' +
            '    <script type="text/javascript" src="https://c.amazon-adsystem.com/dtb-m.js"> </script>\n' +
            '    <script type="text/javascript">\n' +
            '          amzn.dtb.loadAd("%%KEYWORD:amznslots%%", "%%KEYWORD:amzn_b%%", "%%KEYWORD:amzn_h%%");\n' +
            "    </script>\n" +
            "</div>";
        creativeHtmlData = creativeHtmlData
            .replace("{width}", width)
            .replace("{height}", height);

        return creativeHtmlData;
    }
}