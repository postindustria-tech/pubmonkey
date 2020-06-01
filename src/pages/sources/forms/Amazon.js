import React, {Component} from "react";
import {
    Col,
    CustomInput,
    Input,
    Label,
    Row,
    Tooltip
} from "reactstrap";
import {
    AMAZON_KVP_FORMAT,
    PRICE_GRID,
    KEYWORD_PLACEHOLDER,
    KEYWORD_TEMPLATE_DEFAULT_VALUE
} from "../../constants/common";
import InputNumber from "rc-input-number";
import {isEmpty} from "../../helpers";
import _ from "underscore";
import {AdUnitsSelect, LineItemsNamingInput, LineItemsRangeInput} from "../components";
import adServerSelectors from "../../../redux/selectors/adServer";
import {connect} from "react-redux";
import bind from "bind-decorator";
import {ModalWindowService} from "../../services";
import CreateOrderForm from "./CreateOrderForm";

let defaultAdvertiser = "amazon";

const initialState = {
    advertiser: defaultAdvertiser,
    order: {},
    defaultFields: [],
    formValid: true,
    tooltipKVPairsOpen: false,
    keyword: "",
};

class AmazonCreateOrder extends CreateOrderForm {

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
            priceGrid: PRICE_GRID.non_uniform,
            amazonStartPrice: 0.1,
            amazonStep: 0.1,
            amazonCSVItems: "",
            rangeFrom: 1,
            rangeTo: 10,
            lineItemsNaming: KEYWORD_PLACEHOLDER[defaultAdvertiser],
            keywordTemplate:
                localStorage.getItem(defaultAdvertiser) ||
                KEYWORD_TEMPLATE_DEFAULT_VALUE[defaultAdvertiser],
            creativeFormat: "",
        },
    };

    state = initialState;

    @bind
    tooltipKVPairsToggle() {
        this.setState({
            tooltipKVPairsOpen: !this.state.tooltipKVPairsOpen
        });
    }

    @bind
    handleCSVChange(event) {
        let {value, name} = event.target;
        if (!isEmpty(value)) {
            value = [].concat.apply([], value.split("\n").map(v => v.split(",")));
            let broken = [];
            value = value.map((item, index) => {
                const trimmed = item.trim();
                if (!isEmpty(trimmed) && !AMAZON_KVP_FORMAT.test(trimmed)) {
                    broken.push(`can't parse line #${index + 1} "${trimmed}"`);
                }
                return trimmed;
            }).filter((item) => {
                return !isEmpty(item);
            });
            if (!isEmpty(broken)) {
                ModalWindowService.ErrorPopup.showMessage(broken.join("<br>"));
            }
        }
        this.stateSetter({amazonCSVItems: value});
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
                            id="amazon-price-grid-non-uniform"
                            onChange={this.handleInputChange}
                            checked={this.props.attributes.priceGrid === PRICE_GRID.non_uniform}
                        />
                        <CustomInput
                            type="radio"
                            name="priceGrid"
                            value={PRICE_GRID.uniform}
                            label="uniform price grid"
                            id="amazon-price-grid-uniform"
                            onChange={this.handleInputChange}
                            checked={this.props.attributes.priceGrid === PRICE_GRID.uniform}
                        />
                    </Col>
                    <Col className={"col-sm-4"}
                         hidden={PRICE_GRID.non_uniform === this.props.attributes.priceGrid}>
                        <LineItemsRangeInput
                            onChange={this.handleInputChange}
                            invalidRangeFrom={!isEmpty(this.props.formErrors.rangeFrom)}
                            invalidRangeTo={!isEmpty(this.props.formErrors.rangeTo)}
                            rangeFrom={this.props.attributes.rangeFrom}
                            rangeTo={this.props.attributes.rangeTo}
                            unit={'position'}
                        />
                    </Col>
                    <Col className={"col-sm-4"}
                         hidden={this.props.attributes.priceGrid !== PRICE_GRID.uniform}>
                        <Row className={"mb-0"}>
                            <Col className={"col-sm-6 mb-0"}>
                                <Label for="amazonStartPrice" className="mp-label">
                                    Start price:
                                </Label>
                                <InputNumber
                                    min={0.1}
                                    max={1000}
                                    step={0.1}
                                    value={this.props.attributes.amazonStartPrice}
                                    onChange={event => this.handleInputChange({
                                        target: {
                                            name: 'amazonStartPrice',
                                            value: event
                                        }
                                    })}
                                    style={{width: 65, display: "block"}}
                                    className={"mp-form-control"}
                                    parser={(input) => input.replace(/[^\d\.]/g, '')}
                                />
                            </Col>
                            <Col className={"col-sm-6 mb-0"}>
                                <Label for="amazonStep" className="mp-label">
                                    Step:
                                </Label>
                                <InputNumber
                                    min={0.1}
                                    max={1000}
                                    step={0.1}
                                    value={this.props.attributes.amazonStep}
                                    onChange={event => this.handleInputChange({
                                        target: {
                                            name: 'amazonStep',
                                            value: event
                                        }
                                    })}
                                    style={{width: 65, display: "block"}}
                                    className={"mp-form-control"}
                                    parser={(input) => input.replace(/[^\d\.]/g, '')}
                                />
                            </Col>
                        </Row>
                    </Col>
                    <Col className={"col-sm-4"}
                         hidden={this.props.attributes.priceGrid !== PRICE_GRID.non_uniform}>
                        <Label className="mp-label">
                            KV Pairs:
                        </Label>
                        <i className="fa fa-question-circle" id={"Tooltip-1"}/>
                        <Tooltip
                            placement="top"
                            isOpen={this.state.tooltipKVPairsOpen}
                            target={"Tooltip-1"}
                            toggle={this.tooltipKVPairsToggle}
                        >
                            Copy the key-value pairs from the spreadsheet sent to you by the account manager.
                            One line per line item in the format "key:value" (without quotes), where key denotes
                            the line item targeting keyword, and value is the line item price.
                        </Tooltip>
                        <Input type="textarea"
                            className="mr-sm-2"
                            name="amazonCSVItems"
                            style={{width: "100%", border: "1px solid #ced4da", borderRadius: "0.25rem"}}
                            onBlur={this.handleCSVChange}
                            onKeyDown={event => {
                                if (13 == event.keyCode) {
                                    this.handleCSVChange(event)
                                }
                            }}
                            placeholder="m320x50p1:0.53&#10;m320x50p2:0.68&#10;m320x50p3:0.83"
                            onChange={this.handleInputChange}
                            value={Array.isArray(this.props.attributes.amazonCSVItems) ? this.props.attributes.amazonCSVItems.join("\n") : this.props.attributes.amazonCSVItems}
                        />
                    </Col>
                    <Col className={"col-sm-4"}
                         hidden={PRICE_GRID.non_uniform === this.props.attributes.priceGrid}>
                        <LineItemsNamingInput
                            onChange={this.handleInputChange}
                            value={this.props.attributes.lineItemsNaming}
                            invalid={!isEmpty(this.props.formErrors.lineItemsNaming)}
                        />
                    </Col>
                    <Col className={"col-sm-4"}
                         hidden={PRICE_GRID.non_uniform === this.props.attributes.priceGrid}>
                        <Label className="mp-label">Keywords template: </Label>
                        {this.props.attributes.keywordTemplate}
                    </Col>
                    <Col className={"col-sm-4"}>
                        <Label className="mp-label">Creative format: </Label>
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
                    </Col>
                </Row>
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
                    <Col className={"col-sm-4"}>
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

export default connect(mapStateToProps, null)(AmazonCreateOrder)
