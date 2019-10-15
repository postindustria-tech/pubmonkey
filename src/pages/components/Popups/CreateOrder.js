import React, {Component} from "react";
import bind from "bind-decorator";
import {ModalWindowService} from "../../services";
import {
    Button,
    Progress,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
    Label,
    Row,
    Col,
    Table,
    Form,
    FormGroup,
    FormText,
    CustomInput,
    Card,
    CardBody,
    CardHeader,
    Tooltip
} from "reactstrap";
import InputNumber from "rc-input-number";
import FormErrors from "../FormErrors";
import {isEmpty, toInteger, toDecimal, toValidUI} from "../../helpers";
import ConfirmModal from "./ConfirmModal";
import _ from "underscore";
import HelperModal from "./HelperModal";
import {
    ONLY_NUMBERS,
    KEYWORD_TEMPLATE_DEFAULT_VALUE,
    KEYWORD_PLACEHOLDER,
    NETWORK_CLASS,
    NETWORK_CLASS_TO_DIMENSION
} from '../../constants/common';
import {AD_SERVER_DFP, AD_SERVERS} from '../../constants/source';
import adServerActions from "../../../redux/actions/adServer";
import adServerSelectors from "../../../redux/selectors/adServer";
import {connect} from "react-redux";

const helperText =
    "{bid} macro is replaced with a corresponding bid value\n" +
    "{position} macro is replaced with a position number (natural values starting from 1)";

let progress = null,
    defaultAdvertiser = "pubnative";

const initialState = {
    executor: "create",
    backdrop: true,
    showCreativeFormat: false,
    advertiser: defaultAdvertiser,
    adunitsSelected: [],
    order: {},
    orderName: "",
    defaultFields: [],
    lineItemsNaming: KEYWORD_PLACEHOLDER[defaultAdvertiser],
    keywordTemplate:
        localStorage.getItem(defaultAdvertiser) ||
        KEYWORD_TEMPLATE_DEFAULT_VALUE[defaultAdvertiser],
    step: 0.1,
    keywordStepMin: 0.01,
    keywordStep: 0.01,
    rangeFrom: 0.1,
    rangeTo: 10,
    formErrors: {
        orderName: "",
        lineItemsNaming: "",
        step: "",
        keywordStep: "",
        rangeFrom: "",
        rangeTo: ""
    },
    formValid: true,
    willGenerateKeywords: 0,
    willGenerateLineItems: 0,
    creativeFormat: "",
    tooltipOpen: false,
    selectedAdvertiser: defaultAdvertiser,
    Ad_ZONE_ID: 2,
    os: "",
    networkClass: "",
    adServerDomain: "",
    keyword: "",
    rangeMeasure: "$",
    granularity: "",

    advertiserId: null,
    isDfpPrebid: false,
};

class CreateOrderModal extends Component {

    progress = null;

    static defaultProps = {
        onClose: () => {},
        withButton: true,
        sourceAdvertisers: [],
        sourceHandlerReady: false,
        customTargetingKeys: [],
        customTargetingValues: [],
        ADVERTISER_DEFAULT_NAME: {},
        creativeFormats: {},
        title: "Create New Order",
        orderKey: null
    };

    state = initialState;

    reset() {
        console.log('reset state');
        this.setState(initialState);
    }

    @bind
    tooltipToggle() {
        this.setState({
            tooltipOpen: !this.state.tooltipOpen
        });
    }

    onChangeStep = value => {
        if (value === "" || ONLY_NUMBERS.test(value)) {
            this.setState({
                step: value
            });
        }
    };

    onChangeKeywordStep = value => {
        this.setState({
            keywordStep: value
        });
    };

    onCancel = () => {
        if (progress && progress.cancel) progress.cancel();
        this.close();
        this.props.toUpdate && this.props.toUpdate();
        ModalWindowService.ProgressModal.hideModal();
    };

    componentDidMount = () => {
        ModalWindowService.onUpdate = () => this.forceUpdate();
        ModalWindowService.ProgressModal.onCancel(this.onCancel);
    };

    componentWillUnmount() {
        ModalWindowService.onUpdate = null;
    }

    componentDidUpdate(prevProps, prevState) {
        ModalWindowService.ProgressModal.onCancel(this.onCancel);

        if (prevState.advertiser !== this.state.advertiser && this.state.advertiser) {
            this.changeAdvertiser(this.state.advertiser);
        }
        if (prevProps.type !== this.props.type) {
            this.reset();
        }
        if (prevProps.advertiserId !== this.props.advertiserId) {
            this.setState({advertiserId: this.props.advertiserId});
        }
    }

    static getDerivedStateFromProps = (props, state) => {
        if (props.orderName !== undefined && props.orderName !== state.orderName) {
            return {
                ...state,
                orderName: props.orderName,
                lineItemInfo: props.lineItemInfo,
                defaultFields: props.defaultFields,
                rangeFrom: props.rangeFrom,
                rangeTo: props.rangeTo,
                adunitsSelected: props.adunitsSelected,
                advertiser: props.advertiser,
            }
        }
        return state;
    };

    ask = () => {
        this.confirmModal.toggle();
    };

    setCheckedStatus(key) {
        return this.state.adunitsSelected.indexOf(key) !== -1;
    }

    handleChangeKeyword = (event) => {
        const {value} = event.target;
        this.setState({keyword: value})
    };

    filterAdunits = ({name = '', format, key = '', appName, appType}) => {
        let {
            keyword,
            advertiser,
            networkClass,
            creativeFormat,
            os
        } = this.state;

        let adUnitFormat = true;
        if (!isEmpty(format)) {
            if (advertiser === "pubnative") {
                if (typeof NETWORK_CLASS_TO_DIMENSION[networkClass] !== "undefined" &&
                    !isEmpty(NETWORK_CLASS_TO_DIMENSION[networkClass])) {
                    adUnitFormat = NETWORK_CLASS_TO_DIMENSION[networkClass] === format;
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

    render() {
        return (
            <React.Fragment>
                {this.props.withButton ? (
                    <Button
                        color="primary"
                        onClick={this.open}
                        disabled={!this.props.sourceHandlerReady}
                    >
                        <i className="fa fa-plus-circle"/>
                        &nbsp; Create
                    </Button>
                ) : null}
                <HelperModal
                    header={"Something went wrong!"}
                    ref={helperModal => (this.helperModal = helperModal)}
                />
                <Modal
                    isOpen={this.props.createOrderModalOpen}
                    toggle={this.toggle}
                    size="lg"
                    backdrop={this.state.backdrop}
                >
                    <ModalHeader>{this.props.title}</ModalHeader>
                    <ModalBody className="mp-order-form">
                        <div className="panel panel-default">
                            <FormErrors
                                formErrors={this.state.formErrors}
                                formValid={this.state.formValid}
                            />
                        </div>
                        <Row>
                            <Col className={"col-sm-12"}>
                                <Form inline>
                                    <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                                        <Label for="orderName" className="mr-sm-2 mp-label">
                                            Order Name:
                                        </Label>
                                        <Input
                                            invalid={!isEmpty(this.state.formErrors.orderName)}
                                            type="text"
                                            name={"orderName"}
                                            id="orderName"
                                            onChange={this.handleInputChange}
                                            value={this.state.orderName}
                                            className={"mp-form-control"}
                                        />
                                    </FormGroup>
                                </Form>
                            </Col>
                        </Row>
                        <Row>
                            <Col className={"col-sm-12"}>
                                <Form inline>
                                    <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                                        <Label for="Advertiser" className="mr-sm-2 mp-label">
                                            Advertiser:
                                        </Label>
                                        <Input
                                            type="select"
                                            name={"advertiser"}
                                            id="advertiser"
                                            onChange={this.handleInputChange}
                                            value={this.state.advertiser}
                                            className={"mp-form-control"}
                                        >
                                            {Object.keys(this.props.ADVERTISER_DEFAULT_NAME).map(
                                                (option, index) => (
                                                    <option key={index} value={option}>
                                                        {this.props.ADVERTISER_DEFAULT_NAME[option]}
                                                    </option>
                                                )
                                            )}
                                        </Input>
                                    </FormGroup>
                                    <FormGroup className="mb-2 mr-sm-2 mb-sm-0"
                                               hidden={this.props.type !== AD_SERVER_DFP}>
                                        <Label for="advertiserId" className="mr-sm-2 mp-label">
                                            Advertiser DFP:
                                        </Label>
                                        <Input
                                            type="select"
                                            name={"advertiserId"}
                                            onChange={this.handleInputChange}
                                            value={this.state.advertiserId}
                                            id="advertiserId"
                                            className={"mp-form-control"}
                                        >
                                            {this.props.sourceAdvertisers.map(
                                                ({id, name}) => (
                                                    <option key={id} value={id}>{name}</option>
                                                )
                                            )}
                                        </Input>
                                    </FormGroup>
                                </Form>
                            </Col>
                        </Row>
                        <Row hidden={!this.state.isDfpPrebid}>
                            <Col className={"col-sm-12"}>
                                <span className={"mp-label"}>
                                      Granularity:{" "}
                                    </span>
                                <Input
                                    type="select"
                                    name={"granularity"}
                                    onChange={this.handleInputChange}
                                    id="granularity"
                                    value={this.state.granularity}
                                    className={"mp-form-control"}
                                    style={{display: "inline-block", width: "auto"}}
                                >
                                    <option value={""}>{""}</option>
                                    <option value={"low"}>{"low"}</option>
                                    <option value={"med"}>{"med"}</option>
                                    <option value={"high"}>{"high"}</option>
                                    <option value={"auto"}>{"auto"}</option>
                                    <option value={"dense"}>{"dense"}</option>
                                </Input>
                            </Col>
                        </Row>
                        <Row hidden={this.state.isDfpPrebid}>
                            <Col className={"col-sm-12"}>
                                <span className={"mp-label"}>Line Items Range:</span> from [
                                <CustomInput
                                    invalid={!isEmpty(this.state.formErrors.rangeFrom)}
                                    inline
                                    style={{width: "50px"}}
                                    type="text"
                                    id={"rangeFrom"}
                                    name={"rangeFrom"}
                                    value={this.state.rangeFrom}
                                    onChange={this.handleInputChange}
                                    className={"mp-form-control"}
                                />{" "}
                                to{" "}
                                <CustomInput
                                    invalid={!isEmpty(this.state.formErrors.rangeTo)}
                                    inline
                                    style={{width: "50px"}}
                                    type="text"
                                    id={"rangeTo"}
                                    name={"rangeTo"}
                                    value={this.state.rangeTo}
                                    onChange={this.handleInputChange}
                                    className={"mp-form-control"}
                                />
                                ] {this.state.rangeMeasure}.
                            </Col>
                        </Row>
                        <Row>
                            <Col className={"col-sm-12"}>
                                <span className={"mp-label"}>Line Items naming: </span>
                                <CustomInput
                                    invalid={!isEmpty(this.state.formErrors.lineItemsNaming)}
                                    inline
                                    style={{width: "200px", display: "inline-block"}}
                                    type="text"
                                    id={"lineItemsNaming"}
                                    name={"lineItemsNaming"}
                                    onChange={this.handleInputChange}
                                    value={this.state.lineItemsNaming}
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
                        <Row hidden={this.state.selectedAdvertiser === "amazon" || this.state.isDfpPrebid}>
                            <Col className={"col-sm-12"}>
                                <span className={"mp-label"}>Step: </span>
                                <InputNumber
                                    invalid={!isEmpty(this.state.formErrors.step)}
                                    min={0.1}
                                    max={1000}
                                    step={0.1}
                                    value={this.state.step}
                                    onChange={this.onChangeStep}
                                    style={{width: 65}}
                                    className={"mp-form-control"}
                                    parser={(input) => input.replace(/[^\d\.]/g, '')}
                                />{" "}
                                <span className={"mp-label"}>
                                  Keyword Step:{" "}
                                </span>
                                <InputNumber
                                    invalid={!isEmpty(this.state.formErrors.keywordStep)}
                                    min={this.state.keywordStepMin}
                                    max={1000}
                                    step={this.state.keywordStepMin}
                                    value={this.state.keywordStep}
                                    onChange={this.onChangeKeywordStep}
                                    style={{width: 65}}
                                    className={"mp-form-control"}
                                    parser={(input) => input.replace(/[^\d\.]/g, '')}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col className={"col-sm-12"}>
                                <span className={"mp-label"}>Keywords template: </span>
                                {this.state.keywordTemplate}
                            </Col>
                        </Row>
                        <Row hidden={!this.state.showCreativeFormat}>
                            <Col className={"col-sm-12"}>
                                <span className={"mp-label"}>Creative format: </span>
                                <Input
                                    type="select"
                                    name={"creativeFormat"}
                                    id="creativeFormat"
                                    onChange={this.handleInputChange}
                                    value={this.state.creativeFormat}
                                    style={{display: "inline-block", width: "auto"}}
                                    className={"mp-form-control"}
                                >
                                    {Object.keys(this.props.creativeFormats).map((option, index) => (
                                        <option key={index} value={option}>
                                            {this.props.creativeFormats[option]}
                                        </option>
                                    ))}
                                </Input>
                                <div
                                    hidden={this.state.selectedAdvertiser !== "openx"}
                                    style={{display: "inline-block", width: "auto"}}
                                >
                                    {" "}
                                    <span className={"mp-label"}> AdServer Domain: </span>
                                    <CustomInput
                                        invalid={!isEmpty(this.state.formErrors.adServerDomain)}
                                        inline
                                        type="text"
                                        id={"adServerDomain"}
                                        name={"adServerDomain"}
                                        value={this.state.adServerDomain}
                                        onChange={this.handleInputChange}
                                        className={"mp-form-control"}
                                        style={{width: "200px"}}
                                    />
                                </div>
                            </Col>
                        </Row>
                        <Row hidden={this.state.selectedAdvertiser !== "pubnative"}>
                            <Col className={"col-sm-12"}>
                                <span className={"mp-label"}>OS: </span>
                                <Input
                                    type="select"
                                    name={"os"}
                                    id="creativeFormat"
                                    onChange={this.handleInputChange}
                                    value={this.state.os}
                                    style={{display: "inline-block", width: "auto"}}
                                    className={"mp-form-control"}
                                >
                                    <option value={""}>Select OS</option>
                                    <option value={"iphone"}>iOS</option>
                                    <option value={"android"}>Android</option>
                                </Input>{" "}
                                <span className={"mp-label"}>Creative format: </span>
                                <Input
                                    type="select"
                                    name={"networkClass"}
                                    id="networkClass"
                                    onChange={this.handleInputChange}
                                    value={this.state.networkClass}
                                    style={{display: "inline-block", width: "auto"}}
                                    className={"mp-form-control"}
                                    invalid={!isEmpty(this.state.formErrors.networkClass)}
                                >
                                    {Object.keys(NETWORK_CLASS[this.state.os]).map(
                                        (option, index) => (
                                            <option key={index} value={option}>
                                                {NETWORK_CLASS[this.state.os][option]}
                                            </option>
                                        )
                                    )}
                                </Input>{" "}
                                <span className={"mp-label"}>Ad_ZONE_ID:</span>
                                <CustomInput
                                    invalid={!isEmpty(this.state.formErrors.Ad_ZONE_ID)}
                                    inline
                                    type="text"
                                    id={"Ad_ZONE_ID"}
                                    name={"Ad_ZONE_ID"}
                                    value={this.state.Ad_ZONE_ID}
                                    onChange={this.handleInputChange}
                                    className={"mp-form-control"}
                                    style={{width: "50px"}}
                                />
                            </Col>
                        </Row>
                        <br/>
                        <Row>
                            <Col className={"col-sm-12"}>
                                <Card>
                                    <CardHeader>Choose ad units:
                                        <Input
                                            placeholder="Type to find"
                                            value={this.state.keyword}
                                            onChange={this.handleChangeKeyword}
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
                                                                    onChange={this.handleAdunitsCheckboxChange}
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
                    </ModalBody>
                    <ModalFooter>
                        <Button className={"mr-auto"} onClick={() => this.preOrder("download")} color="warning"
                                hidden={this.props.type === AD_SERVER_DFP}>
                            Download JSON
                        </Button>

                        <Button onClick={this.close} color="secondary">
                            Cancel
                        </Button>
                        <Button onClick={() => this.preOrder("create")} color="primary">
                            Create in {AD_SERVERS[this.props.type]}
                        </Button>
                    </ModalFooter>
                </Modal>
                <ConfirmModal
                    message={"Are you sure?"}
                    willGenerateLineItems={this.state.willGenerateLineItems}
                    willGenerateKeywords={this.state.willGenerateKeywords}
                    ref={modal => (this.confirmModal = modal)}
                    onConfirm={this.confirmed}
                />
            </React.Fragment>
        );
    }

    @bind
    formValidator() {
        let fieldValidationErrors = {
            orderName: "",
            lineItemsNaming: "",
            step: "",
            keywordStep: "",
            rangeFrom: "",
            rangeTo: "",
            networkClass: "",
            Ad_ZONE_ID: "",
            adunits: "",
            granularity: ""
        };
        let isValid = true;

        //@TODO: Need to refactor
        if (isEmpty(this.state.orderName)) {
            fieldValidationErrors.orderName = "Order name is required!";
            isValid = false;
        }
        if (isEmpty(this.state.lineItemsNaming)) {
            fieldValidationErrors.lineItemsNaming = "Line item name is required!";
            isValid = false;
        }
        if (isEmpty(this.state.step)) {
            fieldValidationErrors.lineItemsNaming = "Step is required!";
            isValid = false;
        }
        if (isEmpty(this.state.keywordStep)) {
            fieldValidationErrors.lineItemsNaming = "Keyword step is required!";
            isValid = false;
        }
        if (this.state.advertiser !== "amazon") {
            if (this.state.keywordStep > this.state.step) {
                fieldValidationErrors.step = "Line items step can not be less than Keyword step!";
                isValid = false;
            }
        }
        if (this.state.Ad_ZONE_ID < 1) {
            fieldValidationErrors.Ad_ZONE_ID = "Minimum value for Ad_ZONE_ID is 1!";
            isValid = false;
        }
        if (this.state.rangeFrom <= 0) {
            fieldValidationErrors.Ad_ZONE_ID = "Bid must be greater than 0";
            isValid = false;
        }
        if (
            this.state.rangeTo != this.state.rangeFrom &&
            this.state.rangeTo - this.state.rangeFrom < this.state.step
        ) {
            fieldValidationErrors.step = "Range too short!";
            isValid = false;
        }
        if ((this.state.advertiser === "pubnative" && isEmpty(this.state.networkClass)) ||
            (["amazon", "openx"].indexOf(this.state.advertiser) !== -1 && isEmpty(this.state.creativeFormat))) {
            fieldValidationErrors.networkClass = "Creative format is required!";
            isValid = false;
        }
        if (isEmpty(this.state.adunitsSelected)) {
            fieldValidationErrors.adunits = "Your line item will not run without targeting an ad unit";
            isValid = false;
        }
        if (isEmpty(this.state.granularity) && this.state.isDfpPrebid) {
            fieldValidationErrors.granularity = "Granularity is required!";
            isValid = false;
        }

        this.setState({
            formErrors: fieldValidationErrors,
            formValid: isValid
        });

        return isValid;
    }

    @bind
    open() {
        this.changeAdvertiser(this.props.type === AD_SERVER_DFP ? "openx" : "pubnative");
        this.props.createOrderModalToggle();
    }

    @bind
    close() {
        this.props.createOrderModalToggle();
    }

    @bind
    toggle() {
        this.props.createOrderModalToggle();
    }

    @bind
    handleInputChange(event) {
        const {value, name} = event.target;
        if (['rangeFrom', 'rangeTo'].includes(name)) {
            if (value !== "" && !ONLY_NUMBERS.test(value)) {
                return;
            }
        }
        // if (name === "advertiser") {
        //     this.changeAdvertiser(value);
        // }
        if (name === "creativeFormat" && this.state.selectedAdvertiser === "amazon") {
            let lineItemsNaming = KEYWORD_PLACEHOLDER["amazon"];
            if (value.indexOf("x") !== -1) {
                const [width, height] = value.split("x");
                lineItemsNaming = lineItemsNaming.replace("{width}", width).replace("{height}", height);
            }
            this.setState({
                keywordTemplate: CreateOrderModal.getKeywordTemplate("amazon", value),
                lineItemsNaming: lineItemsNaming
            });
        }
        if (name === "os") {
            this.setState({
                adunitsSelected: [],
                networkClass: Object.keys(NETWORK_CLASS[value])[0]
            });
        }
        this.setState({[name]: value});
    }

    changeAdvertiser(advertiser) {
        const lineItemsNaming = KEYWORD_PLACEHOLDER[advertiser],
            step = advertiser === "amazon" ? 1 : 0.1,
            keywordStep = advertiser === "amazon" ? 1 : 0.01,
            showCreativeFormat = advertiser === "amazon" || advertiser === "openx";

        this.props.sourceHandler.setAdvertiser(advertiser);
        this.props.setAdvertiser(advertiser);

        this.setState({
            keywordTemplate: CreateOrderModal.getKeywordTemplate(
                advertiser,
                this.state.creativeFormat
            ),
            step: step,
            keywordStep: keywordStep,
            keywordStepMin: keywordStep,
            lineItemsNaming: lineItemsNaming,
            showCreativeFormat: showCreativeFormat,
            advertiser: advertiser,
            selectedAdvertiser: advertiser,
            os: "",
            formValid: true,
            rangeMeasure: advertiser === "amazon" ? "position" : "$",
            rangeFrom: advertiser === "amazon" ? 1 : 0.1,
            isDfpPrebid: this.props.type === AD_SERVER_DFP && advertiser === "openx"
        });
    }

    static getKeywordTemplate = (value, creativeFormat) => {
        let storageKeywordTemplate = localStorage.getItem(value) || KEYWORD_TEMPLATE_DEFAULT_VALUE[value];
        if (value === "amazon") {
            storageKeywordTemplate = storageKeywordTemplate.replace("{format}", creativeFormat);
        }
        return storageKeywordTemplate;
    };

    @bind
    handleChangeKeywordTemplate(event) {
        const {value, name} = event.target;
        localStorage.setItem(this.state.advertiser, value);
        this.setState({keywordTemplate: value});
        return true;
    }

    @bind
    handleAdunitsCheckboxChange(event) {
        const {checked, name} = event.target;
        if (checked) {
            this.setState(state => ({
                adunitsSelected: [...new Set([...state.adunitsSelected, name])]
            }));
        } else {
            this.setState(state => ({
                adunitsSelected: state.adunitsSelected.filter(adunit => adunit !== name)
            }));
        }
    }

    @bind
    preOrder(executor) {
        let {
            step,
            keywordStep,
            rangeFrom,
            rangeTo,
            advertiser,
            granularity
        } = this.state;

        const formValid = this.formValidator();
        if (!formValid) {
            return;
        }

        rangeFrom = toInteger(rangeFrom);
        rangeTo = toInteger(rangeTo);
        step = toInteger(step);

        let items = 0,
            keywords = 0;

        if (this.props.type === AD_SERVER_DFP && advertiser === "openx") {
            let bid;
            switch (granularity) {
                case 'low':
                    step = rangeFrom = toInteger(0.5);
                    rangeTo = toInteger(5);
                    for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                        items++;
                    }
                    break;
                case 'med':
                    step = rangeFrom = toInteger(0.1);
                    rangeTo = toInteger(20);
                    for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                        items++;
                    }
                    break;
                case 'high':
                    step = rangeFrom = toInteger(0.01);
                    rangeTo = toInteger(20);
                    for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                        items++;
                    }
                    break;
                case 'auto':
                    // 0.05 ... 5 (0.05)
                    step = rangeFrom = toInteger(0.05);
                    rangeTo = toInteger(5);
                    for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                        items++;
                    }
                    // 5.1 ... 10 (0.1)
                    step = toInteger(0.1);
                    rangeFrom = toInteger(5.1);
                    rangeTo = toInteger(10);
                    for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                        items++;
                    }
                    // 10.5 ... 20 (0.5)
                    step = toInteger(0.5);
                    rangeFrom = toInteger(10.5);
                    rangeTo = toInteger(20);
                    for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                        items++;
                    }
                    break;
                case 'dense':
                    // 0.01 ... 3 (0.01)
                    step = rangeFrom = toInteger(0.01);
                    rangeTo = toInteger(3);
                    for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                        items++;
                    }
                    // 3.05 ... 8 (0.05)
                    step = toInteger(0.1);
                    rangeFrom = toInteger(3.05);
                    rangeTo = toInteger(8);
                    for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                        items++;
                    }
                    // 8.5 ... 20 (0.5)
                    step = toInteger(0.5);
                    rangeFrom = toInteger(8.5);
                    rangeTo = toInteger(20);
                    for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                        items++;
                    }
                    break;
            }
            keywords = items;
        } else {
            for (let bid = rangeFrom; bid <= rangeTo; bid += step) {
                items++;
                if (items == 1) {
                    if (advertiser === "amazon") {
                        for (let i = 0; i < keywordStep; i += 1) {
                            keywords++;
                        }
                    } else {
                        for (let i = bid; i < bid + step; i += toInteger(keywordStep)) {
                            keywords++;
                        }
                    }
                }
            }
        }

        this.setState(() => ({
            willGenerateLineItems: items.toFixed(0),
            willGenerateKeywords: keywords.toFixed(0),
            executor: executor
        }));

        this.ask();
    }

    @bind
    confirmed() {
        //@TODO: Need to refactor, use only one method for both actions
        switch (this.state.executor) {
            case "create":
                this.create();
                break;
            case "download":
                this.download();
                break;
        }
    }

    @bind
    async create() {
        let {
            adunitsSelected: adunits,
            step,
            keywordStep,
            keywordTemplate,
            rangeFrom,
            rangeTo,
            orderName,
            lineItemsNaming,
            advertiser,
            creativeFormat,
            networkClass,
            Ad_ZONE_ID,
            adServerDomain,
            advertiserId,
            granularity
        } = this.state;

        let order = this.props.sourceHandler.composeOrderRequest(
            this.props.type === AD_SERVER_DFP ? advertiserId : this.props.ADVERTISER_DEFAULT_NAME[advertiser],
            orderName
        );
        // console.log(order);

        let params = {
            adunits,
            step,
            keywordStep,
            keywordTemplate,
            rangeFrom,
            rangeTo,
            lineItemsNaming,
            advertiser,
            creativeFormat,
            networkClass,
            Ad_ZONE_ID,
            adServerDomain,
            customTargetingKeys: this.props.customTargetingKeys,
            customTargetingValues: this.props.customTargetingValues,
            granularity
        };

        ModalWindowService.ProgressModal.setProgress([
            {
                title: "orders:",
                progress: {value: 0}
            },
            {
                title: "line items:",
                progress: {value: 0}
            }
        ]);

        progress = this.props.sourceHandler.createOrderDataFromSet(
            order,
            params,
            ({lineItemCount, lineItemsDone, orderCount, ordersDone}) => {
                ModalWindowService.ProgressModal.setProgress([
                    {
                        title: `orders: ${ordersDone}/${orderCount}`,
                        progress: {value: (ordersDone / orderCount) * 100}
                    },
                    {
                        title: `line items: ${lineItemsDone}/${lineItemCount}`,
                        progress: {value: (lineItemsDone / lineItemCount) * 100}
                    }
                ]);
            }
        )
            .then(ModalWindowService.ProgressModal.hideModal)
            .then(() => {
                this.close();
                if (this.props.toUpdate) {
                    this.props.toUpdate();
                }
                this.reset();
            })
            .catch(error => {
                console.error(error);
                ModalWindowService.ProgressModal.cancel();

                let close = true,
                    trace = true,
                    errorName = JSON.stringify(error),
                    errorPopup = false;
                if (errorName.length) {
                    errorName = error.name;
                    if (error.hasOwnProperty('close')) {
                        close = error.close;
                    }
                    if (error.hasOwnProperty('trace')) {
                        trace = error.trace;
                    }
                    if (error.hasOwnProperty('message')) {
                        errorName = error.message;
                        errorPopup = true;
                    }
                }
                if (close) {
                    this.close();
                    this.props.toUpdate && this.props.toUpdate();
                }
                if (errorPopup) {
                    ModalWindowService.ErrorPopup.showMessage(errorName);
                } else {
                    this.helperModal.open({
                        text: errorName + '<br/>' + (trace ? error.stack.replace(/\r?\n/g, '<br/>') : '')
                    });
                }
            });
    }

    @bind
    async download() {
        let {
            adunitsSelected: adunits,
            step,
            keywordStep,
            keywordTemplate,
            rangeFrom,
            rangeTo,
            orderName,
            lineItemsNaming,
            advertiser,
            creativeFormat,
            networkClass,
            Ad_ZONE_ID,
            adServerDomain,
            granularity
        } = this.state;

        let order = this.props.sourceHandler.composeOrderRequest(
            this.props.type === AD_SERVER_DFP ? advertiserId : this.props.ADVERTISER_DEFAULT_NAME[advertiser],
            orderName
        );

        let params = {
            adunits,
            step,
            keywordStep,
            keywordTemplate,
            rangeFrom,
            rangeTo,
            lineItemsNaming,
            advertiser,
            creativeFormat,
            networkClass,
            Ad_ZONE_ID,
            adServerDomain,
            customTargetingKeys: this.props.customTargetingKeys,
            customTargetingValues: this.props.customTargetingValues,
            granularity
        };

        ModalWindowService.ProgressModal.setProgress([
            {
                title: "orders:",
                progress: {value: 0}
            },
            {
                title: "line items:",
                progress: {value: 0}
            }
        ]);

        progress = this.props.sourceHandler.downloadOrderDataFromSet(
            order,
            params,
            ({lineItemCount, lineItemsDone, orderCount, ordersDone}) => {
                ModalWindowService.ProgressModal.setProgress([
                    {
                        title: `orders: ${ordersDone}/${orderCount}`,
                        progress: {value: (ordersDone / orderCount) * 100}
                    },
                    {
                        title: `line items: ${lineItemsDone}/${lineItemCount}`,
                        progress: {value: (lineItemsDone / lineItemCount) * 100}
                    }
                ]);
            }
        )
            .then(ModalWindowService.ProgressModal.hideModal)
            .then(() => {
                this.close();
                // this.props.toUpdate && this.props.toUpdate();
            })
            .catch(error => {
                ModalWindowService.ProgressModal.cancel();

                this.close();
                this.props.toUpdate && this.props.toUpdate();

                let errorName = JSON.stringify(error);
                if (errorName.length === 2) {
                    errorName = error.name;
                }

                this.helperModal.open({
                    text: errorName + '<br/>' + error.stack.replace(/\r?\n/g, '<br/>')
                });
            });
    }
}

const mapDispatchToProps = {
    setAdvertiser: adServerActions.setAdvertiser,
    createOrderModalToggle: adServerActions.createOrderModalToggle
};

const mapStateToProps = state => ({
    createOrderModalOpen: adServerSelectors.createOrderModalOpen(state),
    type: adServerSelectors.switcherType(state),
    sourceHandler: adServerSelectors.sourceHandler(state),
    adunits: adServerSelectors.adunits(state),
    sourceHandlerReady: adServerSelectors.sourceHandlerStatus(state),

    ...adServerSelectors.dfpInventory(state),
    ...adServerSelectors.duplicateOrder(state),
});

export default connect(mapStateToProps, mapDispatchToProps)(CreateOrderModal)