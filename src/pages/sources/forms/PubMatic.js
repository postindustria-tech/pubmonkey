import React, {Component} from "react";
import {
    Col,
    CustomInput,
    Input,
    Label,
    Row,
} from "reactstrap";
import {
    KEYWORD_PLACEHOLDER,
    KEYWORD_TEMPLATE_DEFAULT_VALUE
} from "../../constants/common";
import {isEmpty} from "../../helpers";
import _ from "underscore";
import {AdUnitsSelect, LineItemsNamingInput} from "../components";
import adServerSelectors from "../../../redux/selectors/adServer";
import {connect} from "react-redux";
import CreateOrderForm from "./CreateOrderForm";
import {AdTypeSelect} from '../components';

let defaultAdvertiser = "pubmatic";

const initialState = {
    advertiser: defaultAdvertiser,
    order: {},
    defaultFields: [],
    formValid: true,
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
        },
        attributes: {
            orderName: '',
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
                <Row className={"main-form"}>
                    <Col className={"col-sm-4"}>
                        <LineItemsNamingInput
                            onChange={this.handleInputChange}
                            value={this.props.attributes.lineItemsNaming}
                            invalid={!isEmpty(this.props.formErrors.lineItemsNaming)}
                        />
                    </Col>
                    <Col className={"col-sm-4"}>
                        <span className={"mp-label"}>Keywords template: </span>
                        <div>
                        {this.props.attributes.keywordTemplate}
                        </div>
                    </Col>
                    <Col className={"col-sm-4"}>
                        <Label className={"mp-label"}>OS: </Label>
                        <Input
                            type="select"
                            name={"os"}
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
                        <Label className={"mp-label"}>Ad Type: </Label>
                        <AdTypeSelect
                            onChange={this.onChangeAdType}
                            os={this.props.attributes.os}
                            networkClasses={this.props.networkClasses}
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
                            advertiser={'pubmatic'}
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

export default connect(mapStateToProps, null)(PubMaticCreateOrder)