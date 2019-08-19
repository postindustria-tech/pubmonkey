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

    getCreativeHtmlData(creativeFormat) {
        const creativeHtmlData =
            '<script src = "https://cdn.jsdelivr.net/npm/prebid-universal-creative@latest/dist/creative.js"></script>\n' +
            '<script>\n' +
            '   var ucTagData = {};\n' +
            '       ucTagData.adServerDomain = "' + adServerDomain +'";\n' +
            '       ucTagData.pubUrl = "%%PATTERN:url%%";\n' +
            '       ucTagData.targetingMap = %%PATTERN:TARGETINGMAP%%;\n' +
            '   try {\n' +
            '       ucTag.renderAd(document, ucTagData);\n' +
            '   } catch (e) {\n' +
            '       console.log(e);\n' +
            '   }\n' +
            '</script>';

        return creativeHtmlData;
    }
}