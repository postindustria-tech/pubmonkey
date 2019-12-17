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
    AMAZON_KVP_FORMAT,
    AMAZON_PRICE_GRID,
    KEYWORD_PLACEHOLDER,
    KEYWORD_TEMPLATE_DEFAULT_VALUE
} from "../../constants/common";
import InputNumber from "rc-input-number";
import {isEmpty} from "../../helpers";
import _ from "underscore";
import {AdUnitsSelect} from "../components";
import adServerSelectors from "../../../redux/selectors/adServer";
import {connect} from "react-redux";
import bind from "bind-decorator";
import {ModalWindowService} from "../../services";
import CreateOrderForm from "./CreateOrderForm";

const helperText =
    "{bid} macro is replaced with a corresponding bid value\n" +
    "{position} macro is replaced with a position number (natural values starting from 1)";

let defaultAdvertiser = "amazon";

const initialState = {
    advertiser: defaultAdvertiser,
    order: {},
    defaultFields: [],

    formValid: true,

    tooltipOpen: false,
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
            amazonPriceGrid: AMAZON_PRICE_GRID.non_uniform,
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
            value = value.split("\n");
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
                <Row hidden={(AMAZON_PRICE_GRID.non_uniform === this.props.attributes.amazonPriceGrid)}>
                    <Col className={"col-sm-12"}>
                        <span className={"mp-label"}>Line Items Range:</span> from [
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
                        ] position.
                    </Col>
                </Row>
                <Row>
                    <Col className={"col-sm-12"}>
                        <Form inline>
                            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                                <CustomInput
                                    type="radio"
                                    name="amazonPriceGrid"
                                    value={AMAZON_PRICE_GRID.non_uniform}
                                    label="non-uniform price grid"
                                    id="amazon-price-grid-non-uniform"
                                    onChange={this.handleInputChange}
                                    checked={this.props.attributes.amazonPriceGrid === AMAZON_PRICE_GRID.non_uniform}
                                />
                                &nbsp;&nbsp;&nbsp;
                                <CustomInput
                                    type="radio"
                                    name="amazonPriceGrid"
                                    value={AMAZON_PRICE_GRID.uniform}
                                    label="uniform price grid"
                                    id="amazon-price-grid-uniform"
                                    onChange={this.handleInputChange}
                                    checked={this.props.attributes.amazonPriceGrid === AMAZON_PRICE_GRID.uniform}
                                />
                            </FormGroup>
                        </Form>
                    </Col>
                </Row>
                {this.props.attributes.amazonPriceGrid === AMAZON_PRICE_GRID.uniform ? <Row>
                    <Col className={"col-sm-16"}>
                        <Form inline>
                            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                                <Label for="amazonStartPrice" className="mr-sm-2 mp-label">
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
                                    style={{width: 65}}
                                    className={"mp-form-control"}
                                    parser={(input) => input.replace(/[^\d\.]/g, '')}
                                />
                                &nbsp;&nbsp;&nbsp;
                                <Label for="amazonStep" className="mr-sm-2 mp-label">
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
                                    style={{width: 65}}
                                    className={"mp-form-control"}
                                    parser={(input) => input.replace(/[^\d\.]/g, '')}
                                />
                            </FormGroup>
                        </Form>
                    </Col>
                </Row> : ''}
                {this.props.attributes.amazonPriceGrid === AMAZON_PRICE_GRID.non_uniform ? <Row>
                    <Col className={"col-sm-12"}>
                        <Form inline>
                            <FormGroup className="mb-2 mr-sm-2 mb-sm-0" style={{width: "50%"}}>
                                <Label className="mr-sm-2 mp-label">
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
                                <textarea
                                    className="mr-sm-2"
                                    style={{width: "100%"}}
                                    onBlur={this.handleCSVChange}
                                    onKeyDown={event => {
                                        if (13 == event.keyCode) {
                                            this.handleCSVChange(event)
                                        }
                                    }}
                                    placeholder="m320x50p1:0.53&#10;m320x50p2:0.68&#10;m320x50p3:0.83"
                                    onChange={() => {
                                    }}
                                >{this.props.attributes.amazonCSVItems}</textarea>
                            </FormGroup>
                        </Form>
                    </Col>
                </Row> : ''}
                <Row hidden={AMAZON_PRICE_GRID.non_uniform === this.props.attributes.amazonPriceGrid}>
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
                        <i className="fa fa-question-circle" id={"Tooltip-2"}/>
                        <Tooltip
                            placement="top"
                            isOpen={this.state.tooltipOpen}
                            target={"Tooltip-2"}
                            toggle={this.tooltipToggle}
                        >
                            {helperText}
                        </Tooltip>
                    </Col>
                </Row>
                <Row hidden={AMAZON_PRICE_GRID.non_uniform === this.props.attributes.amazonPriceGrid}>
                    <Col className={"col-sm-12"}>
                        <span className={"mp-label"}>Keywords template: </span>
                        {this.props.attributes.keywordTemplate}
                    </Col>
                </Row>
                <Row>
                    <Col className={"col-sm-12"}>
                        <span className={"mp-label"}>Creative format: </span>
                        <Input
                            type="select"
                            name={"creativeFormat"}
                            id="creativeFormat"
                            onChange={this.handleInputChange}
                            value={this.props.attributes.creativeFormat}
                            style={{display: "inline-block", width: "auto"}}
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

    ...adServerSelectors.dfpInventory(state),
    ...adServerSelectors.duplicateOrder(state),
});

export default connect(mapStateToProps, null)(AmazonCreateOrder)