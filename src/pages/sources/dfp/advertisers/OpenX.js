import AbstractAdvertiser from '../../../sources/AbstractAdvertiser'
import {CreativePlaceholder, Size, Targeting} from "../DataTypes";

export class OpenX extends AbstractAdvertiser {

    static advertiser = "openx";

    customTargetingKey = "hb_pb";

    CREATIVE_FORMATS = {
        "": "All",
        "300x600": "300 x 600",
        "300x50": "300 x 50",
        "320x50": "320 x 50",
        "300x250": "300 x 250",
        "728x90": "728 x 90",
        "970x250": "970 x 250",
        "160x600": "160 x 600",
        "300x100": "300 x 100",
        "970x90": "970 x 90",
    };

    getCreativeHtmlData(creativeFormat) {
        const [width, height] = creativeFormat.split("x")
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