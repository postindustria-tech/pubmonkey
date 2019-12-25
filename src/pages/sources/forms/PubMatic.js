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
import {AdUnitsSelect} from "../components";
import adServerSelectors from "../../../redux/selectors/adServer";
import {connect} from "react-redux";
import CreateOrderForm from "./CreateOrderForm";
import {AdTypeSelect} from '../components';

const helperText =
    "{bid} macro is replaced with a corresponding bid value\n" +
    "{position} macro is replaced with a position number (natural values starting from 1)";

let defaultAdvertiser = "pubmatic";

const initialState = {
    advertiser: defaultAdvertiser,
    order: {},
    defaultFields: [],

    formValid: true,

    tooltipOpen: false,
    keyword: "",
};

class PubMaticCreateOrder extends CreateOrderForm {

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
            os: '',
            customEventClassName: '',
            customEventData: "{\"w\":\"\", \"h\":\"\", \"ad_unit_id\":\"\"}",
        },
        networkClasses: {},
    };

    state = initialState;

    render() {
        return (
            <React.Fragment>
                <Row>
                    <Col className={"col-sm-12"}>
                        <Form inline>
                            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                                <Label for="orderName" className="mr-sm-2 mp-label">
                                    Order Name:
                                </Label>
                                <Input
                                    invalid={!isEmpty(this.props.formErrors.orderName)}
                                    type="text"
                                    name={"orderName"}
                                    id="orderName"
                                    onChange={this.handleInputChange}
                                    value={this.props.attributes.orderName}
                                    className={"mp-form-control"}
                                />
                            </FormGroup>
                        </Form>
                    </Col>
                </Row>
                <Row>
                    <Col className={"col-sm-12"}>
                        <span className={"mp-label"}>Line Items naming: </span>
                        <CustomInput
                            invalid={!isEmpty(this.props.formErrors.lineItemsNaming)}
                            inline
                            style={{width: "200px", display: "inline-block"}}
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
                </Row>
                <Row>
                    <Col className={"col-sm-12"}>
                        <span className={"mp-label"}>Keywords template: </span>
                        {this.props.attributes.keywordTemplate}
                    </Col>
                </Row>
                <Row>
                    <Col className={"col-sm-12"}>
                        <span className={"mp-label"}>OS: </span>
                        <Input
                            type="select"
                            name={"os"}
                            onChange={this.handleInputChange}
                            value={this.props.attributes.os}
                            style={{display: "inline-block", width: "auto"}}
                            className={"mp-form-control"}
                        >
                            <option value={""}>Select OS</option>
                            <option value={"iphone"}>iOS</option>
                            <option value={"android"}>Android</option>
                        </Input>{" "}
                        <span className={"mp-label"}>Ad Type: </span>
                        <div style={{width: "200px", display: "inline-block"}}>
                            <AdTypeSelect
                                onChange={this.onChangeAdType}
                                os={this.props.attributes.os}
                                networkClasses={this.props.networkClasses}
                            />
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col className={"col-sm-12"}>
                        <span className={"mp-label"}>Custom Event Class Name: </span>
                        <div style={{width: "300px", display: "inline-block"}}>
                            <CustomInput
                                inline
                                style={{width: "300px", display: "inline-block"}}
                                type="text"
                                id={"customEventClassName"}
                                name={"customEventClassName"}
                                onChange={this.handleInputChange}
                                value={this.props.attributes.customEventClassName}
                                className={"mp-form-control"}
                            />
                        </div>
                    </Col>
                </Row>
                <br/>
                <Row>
                    <Col className={"col-sm-12"}>
                        <AdUnitsSelect
                            adunits={this.props.adunits}
                            adUnitsSelected={this.props.attributes.adUnitsSelected}
                            keyword={this.props.attributes.keyword}
                            advertiser={'amazon'}
                            creativeFormat={this.props.attributes.creativeFormat}
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

export default connect(mapStateToProps, null)(PubMaticCreateOrder)