import React, {Component} from "react";
import {Card, CardBody, CardHeader, Input} from "reactstrap";
import {isEmpty} from "../../helpers";
import {NETWORK_CLASS_TO_DIMENSION} from "../../constants/common";

export class AdUnitsSelect extends Component {

    static defaultProps = {
        onAdUnitsCheckboxChange: () => {},
        onChangeKeyword: () => {},
        adunits: [],
        adUnitsSelected: [],
        keyword: '',
        os: '',
        networkClass: ''
    };

    onAdUnitsCheckboxChange = (event) => {
        this.props.onAdUnitsCheckboxChange(event);
    };

    onChangeKeyword = (event) => {
        this.props.onChangeKeyword(event);
    };

    filterAdunits = ({name = '', format, key = '', appName, appType}) => {
        let {
            keyword,
            advertiser,
            networkClass,
            creativeFormat,
            os
        } = this.props;

        let adUnitFormat = true;
        if (!isEmpty(format)) {
            if (advertiser === "pubnative") {
                if (networkClass.hasOwnProperty('value') && !isEmpty(networkClass.value)) {
                    if (typeof NETWORK_CLASS_TO_DIMENSION[networkClass.value] !== "undefined" &&
                        !isEmpty(NETWORK_CLASS_TO_DIMENSION[networkClass.value])) {
                        adUnitFormat = NETWORK_CLASS_TO_DIMENSION[networkClass.value] === format;
                    }
                }
            } else if (!isEmpty(creativeFormat)) {
                adUnitFormat = creativeFormat === format;
            }
        }

        os = os !== "" ? os === appType : true;

        return adUnitFormat && os && (
            appName.toLocaleLowerCase().includes(keyword.toLocaleLowerCase()) ||
            name.toLocaleLowerCase().includes(keyword.toLocaleLowerCase()) ||
            key.toLocaleLowerCase().includes(keyword.toLocaleLowerCase())
        )
    };

    setCheckedStatus(key) {
        return this.props.adUnitsSelected.indexOf(key) !== -1;
    }

    render() {
        return (
            <Card>
                <CardHeader>Choose ad units:
                    <Input
                        placeholder="Type to find"
                        value={this.props.keyword}
                        onChange={this.onChangeKeyword}
                        style={{display: "inline-block", width: "300px", float: "right"}}
                    />
                </CardHeader>
                <CardBody style={{height: "400px", overflowX: "scroll", paddingTop: 0}}>

                    <div className="table">
                        <div className="tr header">
                            <div className="td header">&nbsp;</div>
                            <div className="td header">App Name</div>
                            <div className="td header">AdUnit Name</div>
                            <div className="td header">Format</div>
                            <div className="td header">Key</div>
                        </div>

                        {this.props.adunits ? this.props.adunits.filter(this.filterAdunits).map(
                            ({name, format, key, appName, appType}) => (
                                <div className="tr" key={key}>
                                    <div className="td">
                                        <div className="custom-control custom-checkbox">
                                            <input
                                                type="checkbox"
                                                name={key}
                                                onChange={this.onAdUnitsCheckboxChange}
                                                className="custom-control-input"
                                                id={`adUnit${key}`}
                                                checked={this.setCheckedStatus(key)}
                                            />
                                            <label
                                                className="custom-control-label"
                                                htmlFor={`adUnit${key}`}
                                            >
                                                &nbsp;
                                            </label>
                                        </div>
                                    </div>
                                    <div className="td" style={{wordBreak: "break-all"}}>
                                        {appName}
                                    </div>
                                    <div className="td"
                                         style={{wordBreak: "break-all"}}>{name}</div>
                                    <div className="td">{format}</div>
                                    <div className="td">{key}</div>
                                </div>
                            )
                        ) : ""}
                    </div>
                </CardBody>
            </Card>
        )
    }
}