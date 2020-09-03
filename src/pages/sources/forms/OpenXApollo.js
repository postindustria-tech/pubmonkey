import React, {Component} from "react";
import {
    Col,
    Input,
    Label,
    Row, Tooltip,
} from "reactstrap";
import {
    KEYWORD_PLACEHOLDER,
    KEYWORD_TEMPLATE_DEFAULT_VALUE
} from "../../constants/common";
import {AD_SERVER_DFP, AD_SERVER_MOPUB, AD_SERVERS} from '../../constants/source';
import {isEmpty} from "../../helpers";
import _ from "underscore";
import {AdUnitsSelect, CreativeSnippet, LineItemsNamingInput} from "../components";
import adServerSelectors from "../../../redux/selectors/adServer";
import {connect} from "react-redux";
import CreateOrderForm from "./CreateOrderForm";
import bind from "bind-decorator";

let defaultAdvertiser = "apollo";

const initialState = {
    advertiser: defaultAdvertiser,
    order: {},
    defaultFields: [],
    formValid: true,
    keyword: "",
};

class ApolloCreateOrder extends CreateOrderForm {

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
            childContentEligibility: "DISALLOWED",
            tooltipChildAllow: false,
        },
    };

    state = initialState;

    @bind
    tooltipToggle() {
        this.setState({
            tooltipChildAllow: !this.state.tooltipChildAllow
        });
    }

    render() {
        const tooltip = `Select whether to allow this line item to serve child-directed ads. For YouTube Partner Sellers, please note that <a href="https://support.google.com/adspolicy/answer/9683742" target="_blank">YouTube's content policies for kids</a> are applicable. Learn more about <a href="https://support.google.com/platformspolicy/answer/3204170" target="_blank">COPPA.</a>`;

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
                            <option value={"low"}>{"low"}</option>
                            <option value={"med"}>{"med"}</option>
                            <option value={"high"}>{"high"}</option>
                            <option value={"auto"}>{"auto"}</option>
                            <option value={"dense"}>{"dense"}</option>
                        </Input>
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
                    <Col className={"col-sm-4"} >
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
                    </Col>
                    <Col className={"col-sm-8"}>
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
    type: adServerSelectors.switcherType(state),

    ...adServerSelectors.dfpInventory(state),
    ...adServerSelectors.duplicateOrder(state),
});

export default connect(mapStateToProps, null)(ApolloCreateOrder)