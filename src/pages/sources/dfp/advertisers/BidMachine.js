import AbstractAdvertiser from '../../../sources/AbstractAdvertiser'

export class BidMachine extends AbstractAdvertiser {

    static advertiser = "bidmachine";

    customTargetingKey = "bm_pf";

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

    getDefaultSize(params){
        return [1, 1];
    }

    getCreativeHtmlData(params) {
        if(params && params.snippetType === "interstitial") {
            return '<script type=\"text/javascript\" src="//media.admob.com/api/v1/google_mobile_app_ads.js"></script>\n' +
                '<script type=\"text/javascript\">document.addEventListener("DOMContentLoaded", function() {\n' +
                '      admob.events.dispatchAppEvent("bidmachine-interstitial", "");\n' +
                '    });</script>'
        }
        return '<script type=\"text/javascript\" src="//media.admob.com/api/v1/google_mobile_app_ads.js"></script>\n' +
            '<script type=\"text/javascript\">document.addEventListener("DOMContentLoaded", function() {\n' +
            '      admob.events.dispatchAppEvent("bidmachine-banner", "");\n' +
            '    });</script>'
    }

    getVastTagUrl() {
        return "https://js.bidmachine.io/gam_lightweight.xml"
    }
}