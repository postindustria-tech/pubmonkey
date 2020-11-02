import React, {Component} from "react";
import {
    Col, CustomInput,
    Input,
    Label,
    Row, Tooltip
} from "reactstrap";
import {
    KEYWORD_PLACEHOLDER,
    KEYWORD_TEMPLATE_DEFAULT_VALUE, PRICE_GRID
} from "../../constants/common";
import {AD_SERVER_ADMOB, AD_SERVER_DFP, AD_SERVER_MOPUB, AD_SERVERS} from '../../constants/source';
import {isEmpty, toInteger} from "../../helpers";
import _ from "underscore";
import {AdTypeSelect, AdUnitsSelect, CreativeSnippet, LineItemsNamingInput, VastTagUrl} from "../components";
import adServerSelectors from "../../../redux/selectors/adServer";
import {connect} from "react-redux";
import CreateOrderForm from "./CreateOrderForm";
import bind from "bind-decorator";

let defaultAdvertiser = "bidmachine";

const initialState = {
    advertiser: defaultAdvertiser,
    order: {},
    defaultFields: [],
    formValid: true,
    keyword: "",
};

class BidMachineCreateOrder extends CreateOrderForm {

    static defaultProps = {
        stateSetter: () => {},
        handleInputChange: () => {},
        handleAdUnitsCheckboxChange: () => {},
        formErrors: {
            orderName: "",
            lineItemsNaming: "",
            step: "",
            keywordStep: "",
        },
        attributes: {
            orderName: '',
            lineItemsNaming: KEYWORD_PLACEHOLDER[defaultAdvertiser],
            keywordTemplate:
                localStorage.getItem(defaultAdvertiser) ||
                KEYWORD_TEMPLATE_DEFAULT_VALUE[defaultAdvertiser],creativeFormat: "",
            creativeSnippet: "",
            adServerDomain: "",
            granularity: "",
            childContentEligibility: "DISALLOWED",
            tooltipChildAllow: false,
            tooltipVastTag: false,
            snippetType: "banner",
            BidMachinePriceGrid: "",
            vastTagUrl: "",
            os: '',
            customEventClassName: '',
            customEventData: "{}",
        },
    };

    state = initialState;

    @bind
    tooltipToggle() {
        this.setState({
            tooltipChildAllow: !this.state.tooltipChildAllow
        });
    }

    @bind
    tooltipToggleVast() {
        this.setState({
            tooltipVastTag: !this.state.tooltipVastTag
        });
    }

    render() {
        const tooltip = `Select whether to allow this line item to serve child-directed ads. For YouTube Partner Sellers, please note that <a href="https://support.google.com/adspolicy/answer/9683742" target="_blank">YouTube's content policies for kids</a> are applicable. Learn more about <a href="https://support.google.com/platformspolicy/answer/3204170" target="_blank">COPPA.</a>`;
        const tooltipVast = `The VAST URL from a third-party ad server. <a href="https://support.google.com/admanager/answer/1171783#redirect" target="_blank">Learn more</a>`;

        return (
            <React.Fragment>
                <Row className={"main-form"}>
                    <Col className={"col-sm-2"} hidden={this.props.type === AD_SERVER_ADMOB}>
                        <Label className={"mp-label"}>
                            Granularity:{" "}
                        </Label>
                        <Input
                            type="select"
                            name={"granularity"}
                            onChange={this.handleInputChange}
                            id="granularity"
                            value={this.props.attributes.granularity}
                            className={"mp-form-control"}
                        >
                            <option value={"custom"}>{"custom"}</option>
                            <option value={"low"}>{"low"}</option>
                            <option value={"med"}>{"med"}</option>
                            <option value={"high"}>{"high"}</option>
                            <option value={"auto"}>{"auto"}</option>
                            <option value={"dense"}>{"dense"}</option>
                        </Input>
                    </Col>
                    <Col className={"col-sm-2"}>
                        <Label className="mp-label">
                            Price Grid:
                        </Label>
                        <Input type="textarea"
                               className="mr-sm-2"
                               rows={4}
                               name={"BidMachinePriceGrid"}
                               id="BidMachinePriceGrid"
                               style={{width: "100%", border: "1px solid #ced4da", borderRadius: "0.25rem"}}
                               placeholder="0.1&#10;0.2&#10;0.3&#10;0.4"
                               onChange={this.handleInputChange}
                               value={this.props.attributes.BidMachinePriceGrid}
                        />
                    </Col>
                    <Col className={"col-sm-4"}>
                        <LineItemsNamingInput
                            onChange={this.handleInputChange}
                            value={this.props.attributes.lineItemsNaming}
                            invalid={!isEmpty(this.props.formErrors.lineItemsNaming)}
                        />
                    </Col>
                    <Col className={"col-sm-4"}>
                        <Label className={"mp-label"}>Keywords template: </Label>
                        <div>
                            <Input
                                className="mr-sm-2"
                                name="keywordTemplate"
                                style={{width: "100%", border: "1px solid #ced4da", borderRadius: "0.25rem"}}
                                placeholder={this.props.attributes.keywordTemplate}
                                onChange={this.handleInputChange}
                                value={this.props.attributes.keywordTemplate}
                            />
                        </div>
                    </Col>
                    <Col className={"col-sm-4"} hidden={this.props.type === AD_SERVER_DFP}>
                        <Label className={"mp-label"}>OS:</Label>
                        <Input
                            type="select"
                            name={"os"}
                            id="creativeFormat"
                            onChange={this.handleInputChange}
                            value={this.props.attributes.os}
                            className={"mp-form-control"}
                        >
                            <option value={""}>Select OS</option>
                            <option value={"iphone"}>iOS</option>
                            <option value={"android"}>Android</option>
                        </Input>
                    </Col>
                    <Col className={"col-sm-4"} hidden={this.props.type === AD_SERVER_DFP}>
                        <Label className={"mp-label"}>Ad Type:</Label>
                        <AdTypeSelect
                            onChange={this.onChangeAdType}
                            os={this.props.attributes.os}
                            networkClasses={this.props.networkClasses}
                        />
                    </Col>
                    <Col className={"col-sm-7"} hidden={this.props.type === AD_SERVER_DFP}>
                        <Label className={"mp-label"}>Custom Event Class Name: </Label>
                        <CustomInput
                            type="text"
                            id={"customEventClassName"}
                            name={"customEventClassName"}
                            onChange={this.handleInputChange}
                            value={this.props.attributes.customEventClassName}
                            className={"mp-form-control"}
                        />
                    </Col>
                    <Col className={"col-sm-5"} hidden={this.props.type !== AD_SERVER_MOPUB}>
                        <Label className={"mp-label"}>Custom Event Data:</Label>
                        <CustomInput
                            invalid={!isEmpty(this.props.formErrors.customEventData)}
                            type="text"
                            id={"customEventData"}
                            name={"customEventData"}
                            value={this.props.attributes.customEventData}
                            onChange={this.handleInputChange}
                            className={"mp-form-control"}
                        />
                    </Col>
                    <Col className={"col-sm-4"} hidden={this.props.type !== AD_SERVER_DFP}>
                        <Label className={"mp-label"}>Creative type:</Label>
                        <Input
                            type="select"
                            name={"snippetType"}
                            onChange={this.handleInputChange}
                            id="snippetType"
                            value={this.props.attributes.snippetType}
                            className={"mp-form-control"}
                        >
                            <option value={"banner"}>{"Banner"}</option>
                            <option value={"interstitial"}>{"Interstitial"}</option>
                            <option value={"VAST"}>{"VAST"}</option>
                        </Input>
                    </Col>
                    <Col className={"col-sm-8"} hidden={this.props.type !== AD_SERVER_DFP}>
                        <Label className={"mp-label"}>Child-directed ads:</Label>
                        <i className="fa fa-question-circle" id={"Tooltip-child-allow"}/>
                        <Tooltip
                            placement="top"
                            isOpen={this.state.tooltipChildAllow}
                            target={"Tooltip-child-allow"}
                            toggle={this.tooltipToggle}
                            autohide={false}
                        >
                            <span dangerouslySetInnerHTML={{__html: tooltip}}></span>
                        </Tooltip>
                        <Input
                            type="select"
                            name={"childContentEligibility"}
                            onChange={this.handleInputChange}
                            id="childContentEligibility"
                            value={this.props.attributes.childContentEligibility}
                            className={"mp-form-control"}
                        >
                        <option value={"DISALLOWED"}>{"Do not serve on child-directed requests"}</option>
                        <option value={"ALLOWED"}>{"Allow to serve on child-directed requests"}</option>
                    </Input>
                    </Col>
                    <Col className={"col-sm-12"} hidden={this.props.attributes.snippetType === "VAST" ||
                                                         this.props.type === AD_SERVER_MOPUB || this.props.type === AD_SERVER_ADMOB}>
                        <Label className="mr-sm-2 mp-label">
                            Creative Snippet:
                        </Label>
                        <CreativeSnippet
                            snippet={this.props.attributes.creativeSnippet}
                            onChange={(snippet) => {this.stateSetter({creativeSnippet: snippet})}}
                        />
                    </Col>
                    <Col className={"col-sm-12"} hidden={this.props.attributes.snippetType !== "VAST"}>
                        <Label className="mr-sm-2 mp-label">
                            Vast tag URL:
                        </Label>
                        <i className="fa fa-question-circle" id={"Tooltip-vast-tag"}/>
                        <Tooltip
                            placement="top"
                            isOpen={this.state.tooltipVastTag}
                            target={"Tooltip-vast-tag"}
                            toggle={this.tooltipToggleVast}
                            autohide={false}
                        >
                            <span dangerouslySetInnerHTML={{__html: tooltipVast}}></span>
                        </Tooltip>
                        <VastTagUrl
                            vastTagUrl={this.props.attributes.vastTagUrl}
                            onChange={(vastTagUrl) => {this.stateSetter({vastTagUrl: vastTagUrl})}}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col className={"col-sm-12"}>
                        <AdUnitsSelect
                            adunits={this.props.adunits}
                            adUnitsSelected={this.props.attributes.adUnitsSelected}
                            keyword={this.props.attributes.keyword}
                            advertiser={'openx'}
                            creativeFormat={this.props.attributes.creativeFormat}
                            os={this.props.attributes.os}
                            adType={this.state.adType}
                            onAdUnitsCheckboxChange={this.handleAdUnitsCheckboxChange}
                            onChangeKeyword={this.handleChangeKeyword}
                        />
                    </Col>
                </Row>
                <Row hidden={isEmpty(this.state.defaultFields)}>
                    <Col className={"col-sm-12"}>
                        <h4>Fields with default value:</h4>
                        <ul>
                            {this.state.defaultFields.map(field => (
                                <li key={_.uniqueId("defaultField")}>{field}</li>
                            ))}
                        </ul>
                    </Col>
                </Row>
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => ({
    adunits: adServerSelectors.adunits(state),
    sourceHandler: adServerSelectors.sourceHandler(state),
    type: adServerSelectors.switcherType(state),

    ...adServerSelectors.dfpInventory(state),
    ...adServerSelectors.duplicateOrder(state),
});

export default connect(mapStateToProps, null)(BidMachineCreateOrder)