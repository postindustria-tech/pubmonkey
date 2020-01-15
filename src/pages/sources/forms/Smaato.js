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
import InputNumber from "rc-input-number";
import {isEmpty} from "../../helpers";
import _ from "underscore";
import {AdTypeSelect, AdUnitsSelect} from "../components";
import adServerSelectors from "../../../redux/selectors/adServer";
import {connect} from "react-redux";
import CreateOrderForm from "./CreateOrderForm";

const helperText =
    "{bid} macro is replaced with a corresponding bid value\n" +
    "{position} macro is replaced with a position number (natural values starting from 1)";

let defaultAdvertiser = "smaato";

const initialState = {
    advertiser: defaultAdvertiser,
    order: {},
    defaultFields: [],

    formValid: true,

    tooltipOpen: false,
    keyword: "",
};

class SmaatoCreateOrder extends CreateOrderForm {

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
            step: 0.1,
            os: '',
            customEventClassName: '',
            customEventData: "{\"publisherId\":\"\", \"spaceId\":\"\"}",
        },
        networkClasses: {},
    };

    state = initialState;

    render() {
        return (
            <React.Fragment>
                <Row className={"main-form"}>
                    <Col className={"col-sm-4"}>
                        <Label className={"mp-label"}>Line Items Range:</Label>
                        <div>from [
                        <CustomInput
                            invalid={!isEmpty(this.props.formErrors.rangeFrom)}
                            inline
                            style={{width: "50px"}}
                            type="text"
                            id={"rangeFrom"}
                            name={"rangeFrom"}
                            value={this.props.attributes.rangeFrom}
                            onChange={this.handleInputChange}
                            className={"mp-form-control"}
                        />{" "}
                        to{" "}
                        <CustomInput
                            invalid={!isEmpty(this.props.formErrors.rangeTo)}
                            inline
                            style={{width: "50px"}}
                            type="text"
                            id={"rangeTo"}
                            name={"rangeTo"}
                            value={this.props.attributes.rangeTo}
                            onChange={this.handleInputChange}
                            className={"mp-form-control"}
                        />
                        ] $.</div>
                    </Col>
                    <Col className={"col-sm-4"}>
                        <Label className={"mp-label"}>Line Items naming:</Label>
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
                        <Label className={"mp-label"}>Step:</Label>
                        <InputNumber
                            invalid={!isEmpty(this.props.formErrors.step)}
                            min={0.1}
                            max={1000}
                            step={0.1}
                            value={this.props.attributes.step}
                            onChange={this.onChangeStep}
                            style={{width: 65, display: "block"}}
                            className={"mp-form-control"}
                            parser={(input) => input.replace(/[^\d\.]/g, '')}
                        />
                    </Col>
                    <Col className={"col-sm-4"}>
                        <Label className={"mp-label"}>Keywords template: </Label>
                        <div>
                        {this.props.attributes.keywordTemplate}
                        </div>
                    </Col>
                    <Col className={"col-sm-4"}>
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
                    <Col className={"col-sm-4"}>
                        <Label className={"mp-label"}>Ad Type:</Label>
                        <AdTypeSelect
                            onChange={this.onChangeAdType}
                            os={this.props.attributes.os}
                            networkClasses={this.props.networkClasses}
                        />
                    </Col>
                    <Col className={"col-sm-4"}>
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
                    <Col className={"col-sm-4"}>
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
                </Row>
                <Row>
                    <Col className={"col-sm-12"}>
                        <AdUnitsSelect
                            adunits={this.props.adunits}
                            adUnitsSelected={this.props.attributes.adUnitsSelected}
                            keyword={this.props.attributes.keyword}
                            advertiser={'smaato'}
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

    ...adServerSelectors.dfpInventory(state),
    ...adServerSelectors.duplicateOrder(state),
});

export default connect(mapStateToProps, null)(SmaatoCreateOrder)