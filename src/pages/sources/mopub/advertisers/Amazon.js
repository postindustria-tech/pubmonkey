import AbstractAdvertiser from '../../../sources/AbstractAdvertiser'

export class Amazon extends AbstractAdvertiser {

    static advertiser = "amazon";

    CREATIVE_FORMATS = {
        "": "All",
        "320x50": "320 x 50 (Banner)",
        "300x250": "300 x 250 (MRect)",
        "728x90": "728 x 90 (Tablet Leaderboard)",
        "160x600": "160 x 600 (Tablet Skyscraper)"
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
            '          amzn.dtb.loadAd("%%KEYWORD:amznslots%%", "%%KEYWORD:amzn_b%%", "%%KEYWORD:amzn_h%%");\n' +
            "    </script>\n" +
            "</div>";
        creativeHtmlData = creativeHtmlData
            .replace("{width}", width)
            .replace("{height}", height);

        return creativeHtmlData;
    }
}