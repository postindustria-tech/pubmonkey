import AbstractAdvertiser from '../../../sources/AbstractAdvertiser'

export class Amazon extends AbstractAdvertiser {

    static advertiser = "amazon";

    customTargetingKey = "amznslots";

    CREATIVE_FORMATS = {
        "": "All",
        "320x50": "320 x 50",
        "300x250": "300 x 250",
        "728x90": "728 x 90",
        // "im": "interstitial mobile",
        // "it": "interstitial tablet",
    };

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
            '          amzn.dtb.loadAd("%%PATTERN:amznslots%%", "%%PATTERN:amzn_b%%","%%PATTERN:amzn_h%%");\n' +
            "    </script>\n" +
            "</div>";
        creativeHtmlData = creativeHtmlData
            .replace("{width}", width)
            .replace("{height}", height);

        return creativeHtmlData;
    }
}