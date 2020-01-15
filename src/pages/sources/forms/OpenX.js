import React, {Component} from "react";
import {
    Col,
    CustomInput,
    Form,
    FormGroup, Input,
    Label,
    Row,
    Tooltip
} from "reactstrap";
import {
    KEYWORD_PLACEHOLDER,
    KEYWORD_TEMPLATE_DEFAULT_VALUE
} from "../../constants/common";
import {isEmpty} from "../../helpers";
import _ from "underscore";
import {AdUnitsSelect,CreativeSnippet} from "../components";
import adServerSelectors from "../../../redux/selectors/adServer";
import {connect} from "react-redux";
import CreateOrderForm from "./CreateOrderForm";

const helperText =
    "{bid} macro is replaced with a corresponding bid value\n" +
    "{position} macro is replaced with a position number (natural values starting from 1)";

let defaultAdvertiser = "openx";

const initialState = {
    advertiser: defaultAdvertiser,
    order: {},
    defaultFields: [],

    formValid: true,

    tooltipOpen: false,
    keyword: "",
};

class OpenXCreateOrder extends CreateOrderForm {

    static defaultProps = {
        stateSetter: () => {},
        handleInputChange: () => {},
        handleAdUnitsCheckboxChange: () => {},
        formErrors: {
            orderName: "",
            lineItemsNaming: "",
            step: "",
            keywordStep: "",
            rangeFrom: "",
            rangeTo: ""
        },
        attributes: {
            orderName: '',
            rangeFrom: 1,
            rangeTo: 10,
            lineItemsNaming: KEYWORD_PLACEHOLDER[defaultAdvertiser],
            keywordTemplate:
                localStorage.getItem(defaultAdvertiser) ||
                KEYWORD_TEMPLATE_DEFAULT_VALUE[defaultAdvertiser],
            creativeFormat: "",
            creativeSnippet: "",
            adServerDomain: "",
        },
    };

    state = initialState;

    render() {
        return (
            <React.Fragment>
                <Row className={"main-form"}>
                    <Col className={"col-sm-4"}>
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
                            <option value={""}>{""}</option>
                            <option value={"low"}>{"low"}</option>
                            <option value={"med"}>{"med"}</option>
                            <option value={"high"}>{"high"}</option>
                            <option value={"auto"}>{"auto"}</option>
                            <option value={"dense"}>{"dense"}</option>
                        </Input>
                    </Col>
                    <Col className={"col-sm-4"}>
                        <Label className={"mp-label"}>Line Items naming: </Label>
                        <CustomInput
                            invalid={!isEmpty(this.props.formErrors.lineItemsNaming)}
                            inline
                            style={{width: "210px", display: "inline-block"}}
                            type="text"
                            id={"lineItemsNaming"}
                            name={"lineItemsNaming"}
                            onChange={this.handleInputChange}
                            value={this.props.attributes.lineItemsNaming}
                            placeholder="PN Hybib {bid}"
                            className={"mp-form-control"}
                        />{" "}
                        <i className="fa fa-question-circle" id={"Tooltip-1"}/>
                        <Tooltip
                            placement="top"
                            isOpen={this.state.tooltipOpen}
                            target={"Tooltip-1"}
                            toggle={this.tooltipToggle}
                        >
                            {helperText}
                        </Tooltip>
                    </Col>
                    <Col className={"col-sm-4"}>
                        <Label className={"mp-label"}>Keywords template: </Label>
                        <div>
                        {this.props.attributes.keywordTemplate}
                        </div>
                    </Col>
                    <Col className={"col-sm-4"}>
                        <Label className={"mp-label"}>Creative format: </Label>
                        <Input
                            type="select"
                            name={"creativeFormat"}
                            id="creativeFormat"
                            onChange={this.handleInputChange}
                            value={this.props.attributes.creativeFormat}
                            className={"mp-form-control"}
                        >
                            {Object.keys(this.props.creativeFormats).map((option, index) => (
                                <option key={index} value={option}>
                                    {this.props.creativeFormats[option]}
                                </option>
                            ))}
                        </Input>
                        {/*<div
                            style={{display: "inline-block", width: "auto"}}
                        >
                            {" "}
                            <span className={"mp-label"}> AdServer Domain: </span>
                            <CustomInput
                                invalid={!isEmpty(this.props.formErrors.adServerDomain)}
                                inline
                                type="text"
                                id={"adServerDomain"}
                                name={"adServerDomain"}
                                value={this.props.attributes.adServerDomain}
                                onChange={this.handleInputChange}
                                className={"mp-form-control"}
                                style={{width: "200px"}}
                            />
                        </div>*/}
                    </Col>
                    <Col className={"col-sm-12"}>
                        <Label className="mr-sm-2 mp-label">
                            Creative Snippet:
                        </Label>
                        <CreativeSnippet
                            snippet={this.props.attributes.creativeSnippet}
                            onChange={(snippet) => {this.stateSetter({creativeSnippet: snippet})}}
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

    ...adServerSelectors.dfpInventory(state),
    ...adServerSelectors.duplicateOrder(state),
});

export default connect(mapStateToProps, null)(OpenXCreateOrder)