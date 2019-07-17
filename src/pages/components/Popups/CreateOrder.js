import React, {Component} from "react";
import Select from "react-select";
import bind from "bind-decorator";
import {FileService, ModalWindowService} from "../../services";
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
import {OrderController} from "../../controllers";
import FormErrors from "../FormErrors";
import {ProgressModal} from "./";
import {isEmpty} from "../../helpers";
import ConfirmModal from "./ConfirmModal";
import _ from "underscore";
import moment from "../Orders/List";
import HelperModal from "./HelperModal";

const defaultAdvertiserValue = "pubnative";

const keywordTemplateDefaultValue = {
    pubnative: "pn_bid:{bid}",
    openx: "hb_pb:{bid}",
    amazon: "amznslots:m{format}p{position}"
};

const keywordPlaceholder = {
    pubnative: "PN Hybib {bid}",
    openx: "hb_pb {bid}",
    amazon: "m320x50p{position}"
};

const advertiserDefaultName = {
    pubnative: "PubNative",
    openx: "Prebid.org",
    amazon: "Amazon HB"
};

const creativeFormats = {
    "320x50": "320 x 50 (Banner)",
    "300x250": "300 x 250 (MRect)",
    "728x90": "728 x 90 (Tablet Leaderboard)",
    "160x600": "160 x 600 (Tablet Skyscraper)"
};

const networkClass = {
    "": {
        "": "Please select OS"
    },
    iphone: {
        HyBidMoPubLeaderboardCustomEvent: "728x90 Leaderboard",
        HyBidMoPubBannerCustomEvent: "320x50 Banner",
        HyBidMoPubMRectCustomEvent: "300x250 MRect",
        HyBidMoPubInterstitialCustomEvent: "728x90 Leaderboard"
    },
    android: {
        "net.pubnative.lite.adapters.mopub.PNLiteMoPubBannerCustomEvent": "320x50 Banner",
        "net.pubnative.lite.adapters.mopub.PNLiteMoPubMRectCustomEvent": "300x250 Banner",
        "net.pubnative.lite.adapters.mopub.PNLiteMoPubInterstitialCustomEvent": "Interstitial"
    }
};

const helperText =
    "{bid} macro is replaced with a corresponding bid value\n" +
    "{position} macro is replaced with a position number (natural values starting from 1)";

let progress = null;

export class CreateOrderModal extends Component {
    progress = null;
    static defaultProps = {
        onClose: () => {
        },
        withButton: true
    };

    state = {
        title: "Create New Order",
        isOpen: false,
        backdrop: true,
        showCreativeFormat: false,
        advertiser: defaultAdvertiserValue,
        adunits: [],
        adunitsSelected: [],
        order: {},
        orderName: "",
        defaultFields: [],
        lineItemInfo: {
            allocationPercentage: 100,
            bidStrategy: "cpm",
            budget: null,
            budgetStrategy: "allatonce",
            budgetType: "unlimited",
            dayPartTargeting: "alltime",
            deviceTargeting: false,
            end: null,
            frequencyCapsEnabled: false,
            includeConnectivityTargeting: "all",
            includeGeoTargeting: "all",
            maxAndroidVersion: "999",
            maxIosVersion: "999",
            minAndroidVersion: "1.5",
            minIosVersion: "2.0",
            priority: 12,
            refreshInterval: 0,
            start: "2019-05-01T00:00:00.000Z",
            startImmediately: true,
            targetAndroid: false,
            targetIOS: "unchecked",
            targetIpad: false,
            targetIphone: false,
            targetIpod: false,
            type: "non_gtee",
            userAppsTargeting: "include",
            userAppsTargetingList: []
        },
        lineItemsNaming: keywordPlaceholder[defaultAdvertiserValue],
        keywordTemplate:
            localStorage.getItem(defaultAdvertiserValue) ||
            keywordTemplateDefaultValue[defaultAdvertiserValue],
        step: 0.1,
        keywordStepMin: 0.01,
        keywordStep: 0.01,
        keywordStepLabel: "Keyword Step",
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
        creativeFormat: "320x50",
        tooltipOpen: false,
        selectedAdvertiser: "pubnative",
        Ad_ZONE_ID: 2,
        os: "",
        networkClass: "",
        adServerDomain: ""
    };

    @bind
    tooltipToggle() {
        this.setState({
            tooltipOpen: !this.state.tooltipOpen
        });
    }

    onChangeStep = value => {
        this.setState({
            step: value
        });
    };

    onChangeKeywordStep = value => {
        this.setState({
            keywordStep: value
        });
    };

    onCancel = () => {
        progress.cancel();
        this.close();
        this.props.toUpdate && this.props.toUpdate();
        ModalWindowService.ProgressModal.hideModal();
    };

    componentDidMount = () => {
        window.MopubAutomation.adunits.then(adunits => this.setState({adunits}));

        ModalWindowService.onUpdate = () => this.forceUpdate();

        ModalWindowService.ProgressModal.onCancel(this.onCancel);
    };

    componentWillUnmount() {
        ModalWindowService.onUpdate = null;
    }

    static getDerivedStateFromProps = (props, state) => {
        if (props.isOpen !== undefined) {
            return {
                ...state,
                isOpen: props.isOpen
            };
        }
        return state;
    };

    ask = () => {
        this.confirmModal.toggle();
    };

    setCheckedStatus(key) {
        return this.state.adunitsSelected.indexOf(key) !== -1;
    }

    render() {
        return (
            <React.Fragment>
                {this.props.withButton ? (
                    <Button color="primary" onClick={this.open}>
                        <i className="fa fa-plus-circle"/>
                        &nbsp; Create
                    </Button>
                ) : null}
                <HelperModal
                    header={"Something went wrong!"}
                    ref={helperModal => (this.helperModal = helperModal)}
                />
                <Modal
                    isOpen={this.state.isOpen}
                    toggle={this.toggle}
                    size="lg"
                    backdrop={this.state.backdrop}
                >
                    <ModalHeader>{this.state.title}</ModalHeader>

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
                                        <Label for="AdServer" className="mr-sm-2 mp-label">
                                            AdServer:
                                        </Label>
                                        <Input
                                            type="select"
                                            name={"AdServer"}
                                            onChange={this.handleInputChange}
                                            id="AdServer"
                                            className={"mp-form-control"}
                                        >
                                            <option value={1}>MoPub</option>
                                        </Input>
                                    </FormGroup>
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
                                            {Object.keys(advertiserDefaultName).map(
                                                (option, index) => (
                                                    <option key={index} value={option}>
                                                        {advertiserDefaultName[option]}
                                                    </option>
                                                )
                                            )}
                                        </Input>
                                    </FormGroup>
                                </Form>
                            </Col>
                        </Row>
                        <Row>
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
                                ]. <span className={"mp-label"}>Line Items naming: </span>
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
                        <Row>
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
                                />{" "}
                                <span className={"mp-label"}>
                  {this.state.keywordStepLabel}:{" "}
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
                                    {Object.keys(creativeFormats).map((option, index) => (
                                        <option key={index} value={option}>
                                            {creativeFormats[option]}
                                        </option>
                                    ))}
                                </Input>

                                <div
                                    hidden={this.state.selectedAdvertiser !== "openx"}
                                    style={{display: "inline-block", width: "auto"}}
                                >
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
                                <span className={"mp-label"}>Class: </span>
                                <Input
                                    type="select"
                                    name={"networkClass"}
                                    id="creativeFormat"
                                    onChange={this.handleInputChange}
                                    value={this.state.networkClass}
                                    style={{display: "inline-block", width: "auto"}}
                                    className={"mp-form-control"}
                                    invalid={!isEmpty(this.state.formErrors.networkClass)}
                                >
                                    {Object.keys(networkClass[this.state.os]).map(
                                        (option, index) => (
                                            <option key={index} value={option}>
                                                {networkClass[this.state.os][option]}
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
                                    <CardHeader>Choose ad units:</CardHeader>
                                    <CardBody>
                                        <Table size="sm">
                                            <thead>
                                            <tr>
                                                <th/>
                                                <th>App Name</th>
                                                <th>AdUnit Name</th>
                                                <th>Format</th>
                                                <th>Key</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {this.state.adunits.map(
                                                ({name, format, key, appName, appType}) => (
                                                    <tr key={key}>
                                                        <td>
                                                            <div className="custom-control custom-checkbox">
                                                                <input
                                                                    type="checkbox"
                                                                    name={key}
                                                                    onChange={this.handleAdunitsCheckboxChange}
                                                                    className="custom-control-input"
                                                                    id={`adUnit${key}`}
                                                                    checked={this.setCheckedStatus(key)}
                                                                    disabled={
                                                                        this.state.os !== "" &&
                                                                        this.state.os !== appType
                                                                    }
                                                                />
                                                                <label
                                                                    className="custom-control-label"
                                                                    htmlFor={`adUnit${key}`}
                                                                >
                                                                    &nbsp;
                                                                </label>
                                                            </div>
                                                        </td>
                                                        <td style={{wordBreak: "break-all"}}>
                                                            {appName}
                                                        </td>
                                                        <td style={{wordBreak: "break-all"}}>{name}</td>
                                                        <td>{format}</td>
                                                        <td>{key}</td>
                                                    </tr>
                                                )
                                            )}
                                            </tbody>
                                        </Table>
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
                        <Button onClick={this.close} color="secondary">
                            Cancel
                        </Button>
                        <Button onClick={this.preOrder} color="primary">
                            Create
                        </Button>
                    </ModalFooter>
                </Modal>
                <ConfirmModal
                    message={"Are you sure?"}
                    willGenerateLineItems={this.state.willGenerateLineItems}
                    willGenerateKeywords={this.state.willGenerateKeywords}
                    ref={modal => (this.confirmModal = modal)}
                    onConfirm={this.create}
                />
            </React.Fragment>
        );
    }

    @bind
    formValidator(data) {
        let fieldValidationErrors = {
            orderName: "",
            lineItemsNaming: "",
            step: "",
            keywordStep: "",
            rangeFrom: "",
            rangeTo: "",
            networkClass: "",
            Ad_ZONE_ID: "",
            adunits: ""
        };
        let isValid = true;

        //@TODO: Need to refactor
        if (isEmpty(data.orderName)) {
            fieldValidationErrors.orderName = "Order name is required!";
            isValid = false;
        }
        if (isEmpty(data.lineItemsNaming)) {
            fieldValidationErrors.lineItemsNaming = "Line item name is required!";
            isValid = false;
        }
        if (isEmpty(data.step)) {
            fieldValidationErrors.lineItemsNaming = "Step is required!";
            isValid = false;
        }
        if (isEmpty(data.keywordStep)) {
            fieldValidationErrors.lineItemsNaming = "Keyword step is required!";
            isValid = false;
        }
        if (data.advertiser !== "amazon") {
            if (data.keywordStep > data.step) {
                fieldValidationErrors.step =
                    "Line items step can not be less than Keyword step!";
                isValid = false;
            }
        }
        if (data.Ad_ZONE_ID < 1) {
            fieldValidationErrors.Ad_ZONE_ID = "Minimum value for Ad_ZONE_ID is 1!";
            isValid = false;
        }
        if (
            data.rangeTo != data.rangeFrom &&
            data.rangeTo - data.rangeFrom < data.step
        ) {
            fieldValidationErrors.step = "Range too short!";
            isValid = false;
        }
        if (data.advertiser === "pubnative" && isEmpty(data.networkClass)) {
            fieldValidationErrors.networkClass = "Class is required!";
            isValid = false;
        }
        if (isEmpty(data.adunits)) {
            fieldValidationErrors.adunits = "Your line item will not run without targeting an ad unit";
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
        this.setState({isOpen: true});
    }

    @bind
    close() {
        this.setState({isOpen: false});
    }

    @bind
    handleInputChange(event) {
        const {value, name} = event.target;
        if (name === "advertiser") {
            const lineItemsNaming = keywordPlaceholder[value],
                keywordStep = value === "amazon" ? 1 : 0.01,
                keywordStepLabel =
                    value === "amazon" ? "Keyword Quantity" : "Keyword Step",
                showCreativeFormat = value === "amazon" || value === "openx";

            this.setState({
                keywordTemplate: CreateOrderModal.getKeywordTemplate(
                    value,
                    this.state.creativeFormat
                ),
                keywordStep: keywordStep,
                keywordStepMin: keywordStep,
                keywordStepLabel: keywordStepLabel,
                lineItemsNaming: lineItemsNaming,
                showCreativeFormat: showCreativeFormat,
                selectedAdvertiser: value,
                os: ""
            });
        }
        if (
            name === "creativeFormat" &&
            this.state.selectedAdvertiser === "amazon"
        ) {
            this.setState({
                keywordTemplate: CreateOrderModal.getKeywordTemplate("amazon", value)
            });
        }
        if (name === "os") {
            this.setState({
                adunitsSelected: []
            });
        }
        this.setState({[name]: value});
    }

    static getKeywordTemplate = (value, creativeFormat) => {
        let storageKeywordTemplate =
            localStorage.getItem(value) || keywordTemplateDefaultValue[value];
        if (value === "amazon") {
            storageKeywordTemplate = storageKeywordTemplate.replace(
                "{format}",
                creativeFormat
            );
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
    preOrder() {
        let {
            adunitsSelected: adunits,
            step,
            keywordStep,
            rangeFrom,
            rangeTo,
            orderName,
            lineItemsNaming,
            advertiser,
            networkClass,
            Ad_ZONE_ID
        } = this.state;

        const formValid = this.formValidator({
            adunits,
            step,
            keywordStep,
            orderName,
            rangeFrom,
            rangeTo,
            lineItemsNaming,
            advertiser,
            networkClass,
            Ad_ZONE_ID
        });
        if (!formValid) {
            return;
        }

        rangeFrom = this.toInteger(rangeFrom);
        rangeTo = this.toInteger(rangeTo);
        step = this.toInteger(step);

        let items = 0,
            keywords = 0;

        for (let bid = rangeFrom; bid <= rangeTo; bid += step) {
            items++;
            if (items == 1) {
                if (advertiser === "amazon") {
                    for (let i = 0; i < keywordStep; i += 1) {
                        keywords++;
                    }
                } else {
                    const j = this.toDecimal(bid);
                    const s = this.toDecimal(step);
                    for (let i = j; i < j + s; i += keywordStep) {
                        keywords++;
                    }
                }
            }
        }

        this.setState(() => ({
            willGenerateLineItems: items.toFixed(0),
            willGenerateKeywords: keywords.toFixed(0)
        }));

        this.ask();
    }

    toInteger = num => Number((Number(num) * 100).toFixed(0));
    toDecimal = num => this.toValidUI(num / 100);
    toValidUI = num => Math.round(num * 100) / 100;

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
            lineItemInfo,
            lineItemsNaming,
            advertiser,
            creativeFormat,
            networkClass,
            Ad_ZONE_ID,
            adServerDomain
        } = this.state;

        let order = {
            advertiser: advertiserDefaultName[advertiser],
            description: "",
            name: orderName
        };

        let params = {
            adunits,
            step,
            keywordStep,
            keywordTemplate,
            rangeFrom,
            rangeTo,
            lineItemInfo,
            lineItemsNaming,
            advertiser,
            creativeFormat,
            networkClass,
            Ad_ZONE_ID,
            adServerDomain
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

        progress = OrderController.createOrderDataFromSet(
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
                this.props.toUpdate && this.props.toUpdate();
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

    @bind
    toggle(event, orderKey = null) {
        if (orderKey) {
            OrderController.getOrder(orderKey).then(order => {
                let {lineItemInfo, rangeFrom, rangeTo} = this.state,
                    adUnitKeys = [],
                    defaultLineItemInfo = lineItemInfo,
                    values = {},
                    defaultFields = [],
                    arrays = [];
                if (!isEmpty(order.lineItems)) {
                    for (let key in defaultLineItemInfo) {
                        values[key] = [];
                    }

                    order.lineItems.forEach(lineItem => {
                        for (let key in defaultLineItemInfo) {
                            if (!lineItem.hasOwnProperty(key)) {
                                continue;
                            }
                            let value = lineItem[key];
                            if (Array.isArray(value)) {
                                if (arrays.indexOf(key) === -1) {
                                    arrays.push(key);
                                }
                                value = value.join('###');
                            }
                            if (values[key].indexOf(value) === -1) {
                                values[key].push(value);
                            }
                        }
                    });

                    for (let key in defaultLineItemInfo) {
                        if (values.hasOwnProperty(key) && values[key].length === 1) {
                            values[key] = values[key].shift();
                        } else {
                            values[key] = defaultLineItemInfo[key];
                            defaultFields.push(key);
                        }
                    }

                    rangeFrom = 999999999;
                    rangeTo = 0;
                    order.lineItems.forEach(lineItem => {
                        if (lineItem.bid > rangeTo) {
                            rangeTo = lineItem.bid;
                        }
                        if (lineItem.bid < rangeFrom) {
                            rangeFrom = lineItem.bid;
                        }
                        adUnitKeys = [...adUnitKeys, ...lineItem.adUnitKeys].unique();
                    });
                }

                if (isEmpty(values)) {
                    values = lineItemInfo;
                } else {
                    for (let i in arrays) {
                        const key = arrays[i];
                        if (!isEmpty(values[key])) {
                            values[key] = values[key].split('###');
                        } else {
                            values[key] = [];
                        }
                    }
                }

                this.setState(state => ({
                    isOpen: !state.isOpen,
                    orderName: order.name,
                    lineItemInfo: values,
                    defaultFields: defaultFields,
                    rangeFrom: rangeFrom,
                    rangeTo: rangeTo,
                    adunitsSelected: adUnitKeys,
                    title: "Duplicate Order"
                }));
            });
        } else {
            this.setState(state => ({isOpen: !state.isOpen}));
        }
    }
}
