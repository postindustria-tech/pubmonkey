import React, {Component} from "react";
import {
    Col,
    CustomInput,
    Input,
    Label,
    Row
} from "reactstrap";
import {
    PRICE_GRID,
    KEYWORD_PLACEHOLDER,
    KEYWORD_TEMPLATE_DEFAULT_VALUE, AMAZON_KVP_FORMAT
} from "../../constants/common";
import InputNumber from "rc-input-number";
import {isEmpty} from "../../helpers";
import _ from "underscore";
import {AdTypeSelect, AdUnitsSelect, LineItemsNamingInput, LineItemsRangeInput} from "../components";
import adServerSelectors from "../../../redux/selectors/adServer";
import {connect} from "react-redux";
import CreateOrderForm from "./CreateOrderForm";
import bind from "bind-decorator";
import {ModalWindowService} from "../../services";

let defaultAdvertiser = "clearbid";

const initialState = {
    advertiser: defaultAdvertiser,
    order: {},
    defaultFields: [],
    formValid: true,
    keyword: "",
};

class ClearBidCreateOrder extends CreateOrderForm {

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
            customEventData: "{\"w\":\"\", \"h\":\"\", \"ad_unit_id\":\"\"}",
            priceGrid: PRICE_GRID.non_uniform,
            priceBand: '',
        },
        networkClasses: {},
    };

    state = initialState;

    @bind
    handlePriceBandChange(event) {
        let {value, name} = event.target;
        if (!isEmpty(value)) {
            let broken = [];
            if (!/^[0-9\.\,]+$/.test(value)) {
                broken.push(`Allowed characters for Price Band are "0-9,."`);
            }
            if (!isEmpty(broken)) {
                ModalWindowService.ErrorPopup.showMessage(broken.join("<br>"));
            }
        }
        this.stateSetter({priceBand: value});
    }

    render() {
        return (
            <React.Fragment>
                <Row className={"main-form"}>
                    <Col className={"col-sm-4"}>
                        <CustomInput
                            type="radio"
                            name="priceGrid"
                            value={PRICE_GRID.non_uniform}
                            label="non-uniform price grid"
                            id="price-grid-non-uniform"
                            onChange={this.handleInputChange}
                            checked={this.props.attributes.priceGrid === PRICE_GRID.non_uniform}
                        />
                        <CustomInput
                            type="radio"
                            name="priceGrid"
                            value={PRICE_GRID.uniform}
                            label="uniform price grid"
                            id="price-grid-uniform"
                            onChange={this.handleInputChange}
                            checked={this.props.attributes.priceGrid === PRICE_GRID.uniform}
                        />
                    </Col>
                    <Col className={"col-sm-4"}
                         hidden={this.props.attributes.priceGrid !== PRICE_GRID.non_uniform}>
                        <Label className="mp-label">
                            Price band:
                        </Label>
                        <textarea
                            className="mr-sm-2"
                            style={{width: "100%", border: "1px solid #ced4da", borderRadius: "0.25rem"}}
                            onBlur={this.handlePriceBandChange}
                            onKeyDown={event => {
                                if (13 == event.keyCode) {
                                    this.handlePriceBandChange(event)
                                }
                            }}
                            placeholder="0.01,0.2,0.4,0.6,0.8,1,1.25,1.5,1.65,1.75,1.85,1.95,2,2.05,2.15,2.25,2.35,2.5,2.75,3,3.5,4,4.5,5,5.5,6,6.5,7,8,9,10,15,20"
                            onChange={() => {
                            }}
                        >{this.props.attributes.priceBand}</textarea>
                    </Col>
                    <Col className={"col-sm-4"}
                         hidden={this.props.attributes.priceGrid !== PRICE_GRID.uniform}>
                        <LineItemsRangeInput
                            onChange={this.handleInputChange}
                            invalidRangeFrom={!isEmpty(this.props.formErrors.rangeFrom)}
                            invalidRangeTo={!isEmpty(this.props.formErrors.rangeTo)}
                            rangeFrom={this.props.attributes.rangeFrom}
                            rangeTo={this.props.attributes.rangeTo}
                        />
                    </Col>
                    <Col className={"col-sm-4"}
                         hidden={this.props.attributes.priceGrid !== PRICE_GRID.uniform}>
                        <Label className={"mp-label"}>Step: </Label>
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
                        <LineItemsNamingInput
                            onChange={this.handleInputChange}
                            value={this.props.attributes.lineItemsNaming}
                            invalid={!isEmpty(this.props.formErrors.lineItemsNaming)}
                        />
                    </Col>
                    <Col className={"col-sm-4"}>
                        <Label className={"mp-label"}>Keywords template: </Label>
                        <div>
                        {this.props.attributes.keywordTemplate}
                        </div>
                    </Col>
                    <Col className={"col-sm-4"}>
                        <Label className={"mp-label"}>OS: </Label>
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
                        <Label className={"mp-label"}>Ad Type: </Label>
                        <AdTypeSelect
                            onChange={this.onChangeAdType}
                            os={this.props.attributes.os}
                            networkClasses={this.props.networkClasses}
                        />
                    </Col>
                    <Col className={"col-sm-6"}>
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
                    <Col className={"col-sm-6"}>
                        <Label className={"mp-label"}>Custom Event Data: </Label>
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
                </Row>
                <Row>
                    <Col className={"col-sm-12"}>
                        <AdUnitsSelect
                            adunits={this.props.adunits}
                            adUnitsSelected={this.props.attributes.adUnitsSelected}
                            keyword={this.props.attributes.keyword}
                            advertiser={'clearbid'}
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

export default connect(mapStateToProps, null)(ClearBidCreateOrder)