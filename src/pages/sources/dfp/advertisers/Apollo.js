import AbstractAdvertiser from '../../../sources/AbstractAdvertiser'

export class Apollo extends AbstractAdvertiser {

    static advertiser = "apollo";

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

    getDefaultSize(params){
        return [1, 1];
    }

    getCreativeHtmlData(params) {
        return '<script src = "https://cdn.jsdelivr.net/npm/prebid-universal-creative@latest/dist/creative.js"></script>\n' +
            "<script>\n" +
            "   var ucTagData = {};\n" +
            '   ucTagData.adServerDomain = "";\n' +
            '   ucTagData.pubUrl = "%%PATTERN:url%%";\n' +
            '   ucTagData.targetingMap = %%PATTERN:TARGETINGMAP%%;\n' +
            '   ucTagData.adId = "%%PATTERN:hb_adid%%";\n' +
            '   ucTagData.cacheHost = "%%PATTERN:hb_cache_host%%";\n' +
            '   ucTagData.cachePath = "%%PATTERN:hb_cache_path%%";\n' +
            '   ucTagData.uuid = "%%PATTERN:hb_cache_id%%";\n' +
            '   ucTagData.mediaType = "%%PATTERN:hb_format%%";\n' +
            '   ucTagData.env = "%%PATTERN:hb_env%%";\n' +
            '   ucTagData.size = "%%PATTERN:hb_size%%";\n' +
            '   ucTagData.hbPb = "%%PATTERN:hb_pb%%";\n' +
            "   try {\n" +
            "       ucTag.renderAd(document, ucTagData);\n" +
            "   } catch (e) {\n" +
            "       console.log(e);\n" +
            "   }\n" +
            "</script>";
    }
}