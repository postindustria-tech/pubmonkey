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
}