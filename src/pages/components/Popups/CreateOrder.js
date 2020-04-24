import React, {Component} from "react";
import bind from "bind-decorator";
import {ModalWindowService} from "../../services";
import {
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
    Label,
    Row,
    Col, CustomInput, Tooltip,
} from "reactstrap";
import FormErrors from "../FormErrors";
import {isEmpty, toInteger} from "../../helpers";
import ConfirmModal from "./ConfirmModal";
import HelperModal from "./HelperModal";
import {
    ONLY_NUMBERS,
    AMAZON_KVP_FORMAT,
    KEYWORD_TEMPLATE_DEFAULT_VALUE,
    KEYWORD_PLACEHOLDER,
    PRICE_GRID
} from '../../constants/common';
import {AD_SERVER_DFP, AD_SERVER_MOPUB, AD_SERVERS} from '../../constants/source';
import adServerActions from "../../../redux/actions/adServer";
import adServerSelectors from "../../../redux/selectors/adServer";
import {connect} from "react-redux";
import AmazonCreateOrder from "../../sources/forms/Amazon";
import ClearBidCreateOrder from "../../sources/forms/ClearBid";
import OpenXCreateOrder from "../../sources/forms/OpenX";
import PubMaticCreateOrder from "../../sources/forms/PubMatic";
import PubNativeCreateOrder from "../../sources/forms/PubNative";
import SmaatoCreateOrder from "../../sources/forms/Smaato";

let progress = null,
    defaultAdvertiser = "amazon";

const initialState = {
    title: "Create New Order",
    executor: "create",
    backdrop: true,
    showCreativeFormat: false,
    advertiser: defaultAdvertiser,
    adUnitsSelected: [],
    order: {},
    orderName: '',
    priceGrid: PRICE_GRID.non_uniform,
    priceBand: '',
    amazonStartPrice: 0.1,
    amazonCSVItems: '',
    amazonStep: 0.1,
    defaultFields: [],
    lineItemsNaming: KEYWORD_PLACEHOLDER[defaultAdvertiser],
    keywordTemplate:
        localStorage.getItem(defaultAdvertiser) ||
        KEYWORD_TEMPLATE_DEFAULT_VALUE[defaultAdvertiser],
    step: 0.1,
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
    confirmModalMessage: null,
    creativeFormat: "",
    creativeSnippet: "",
    tooltipCompanyOpen: false,
    selectedAdvertiser: defaultAdvertiser,
    Ad_ZONE_ID: 2,
    os: '',
    networkClass: '',
    customEventClassName: '',
    adServerDomain: '',
    keyword: '',
    granularity: 'auto',

    advertiserId: null,
    customEventData: '',
};

class CreateOrderModal extends Component {

    progress = null;

    justCreatedOrder = null;

    static defaultProps = {
        onClose: () => {},
        withButton: true,
        sourceAdvertisers: [],
        sourceHandlerReady: false,
        customTargetingKeys: [],
        customTargetingValues: [],
        ADVERTISER_DEFAULT_NAME: {},
        creativeFormats: {},
        networkClasses: {},
        orderKey: null,
        advertiser: defaultAdvertiser,
        networkCode: '',
        orders: []
    };

    state = initialState;

    reset() {
        this.setState(initialState);
    }

    onCancel = () => {
        if (progress && progress.cancel) progress.cancel();
        this.close();
        this.props.toUpdate && this.props.toUpdate();
        ModalWindowService.ProgressModal.hideModal();
    };

    componentDidMount = () => {
        ModalWindowService.onUpdate = () => this.forceUpdate();
        ModalWindowService.ProgressModal.onCancel(this.onCancel);
        window.addEventListener('resize', this.updateDimensions);
        // window.setTimeout(this.updateDimensions, 50);
    };

    componentWillUnmount() {
        ModalWindowService.onUpdate = null;
        window.removeEventListener('resize', this.updateDimensions);
    }

    componentDidUpdate(prevProps, prevState) {
        this.updateDimensions();
        ModalWindowService.ProgressModal.onCancel(this.onCancel);

        if (prevState.advertiser !== this.state.advertiser && this.state.advertiser) {
            this.changeAdvertiser(this.state.advertiser);
        }
        if (prevProps.type !== this.props.type) {
            this.reset();
        }
        if (prevProps.advertiserId !== this.props.advertiserId && this.props.advertiserId) {
            this.setState({advertiserId: this.props.advertiserId});
        }
        if (
            this.props.orderName !== prevProps.orderName
            || (this.props.timestamp && this.props.timestamp != prevProps.timestamp)
        ) {
            this.setState({
                orderName: this.props.orderName,
                lineItemInfo: this.props.lineItemInfo,
                defaultFields: this.props.defaultFields,
                rangeFrom: this.props.rangeFrom,
                rangeTo: this.props.rangeTo,
                adUnitsSelected: this.props.adUnitsSelected,
                advertiser: this.props.advertiser,
                title: this.props.title
            });
        }
    }

    componentWillReceiveProps = (props, state) => {
        if (
            this.props.orders.length != props.orders.length
            && props.orders.length - this.props.orders.length == 1
        ) {
            this.justCreatedOrder = props.orders.map(o => o.key).filter(key => !this.props.orders.map(o => o.key).includes(key))[0]
            ModalWindowService.AlertPopup.message = this.createModalMessage()
        }
    };

    createModalMessage = () => (
        <p style={{margin: 0}}>
            Order has been created successfully.<br/>
            {this.justCreatedOrder && <a href={this.getOrderUrl(this.justCreatedOrder)} target="_blank">
                View in {this.props.type === AD_SERVER_DFP ? 'DFP' : 'MoPub'}
            </a>}
        </p>
    );

    ask = () => {
        this.confirmModal.toggle();
    };

    updateDimensions = () => {
        const modal = document.getElementById('createOrderModal'),
            footer = document.getElementById('createOrderModalFooter');
        if (!modal) return;
        const height = modal.clientHeight,
            top = modal.offsetTop;
        footer.style.width = (modal.clientWidth - 2) + 'px';
        if (window.innerHeight > (height + top)) {
            footer.style.top = height + 'px';
            footer.style.bottom = 'auto';
        } else {
            footer.style.top = 'auto';
            footer.style.bottom = '40px';
        }
    };

    @bind
    tooltipToggle() {
        this.setState({
            tooltipCompanyOpen: !this.state.tooltipCompanyOpen
        });
    }

    render() {

        const classWidth = this.props.type === AD_SERVER_DFP ? 'col-sm-4' : 'col-sm-6',
            networkCode = this.props.networkCode || localStorage.getItem('dfpNetworkCode'),
            tooltip = `Companies are defined in your Google Ad Manager account under Admin -> Companies. <a href="https://admanager.google.com/${networkCode}#admin/company/list" target="_blank"> Take me there.</a>`;

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
                    id={"createOrderModal"}
                    ref="myImgContainer"
                    isOpen={this.props.createOrderModalOpen}
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
                            <Col className={classWidth}>
                                <Label for="orderName" className="mp-label">
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
                            </Col>
                            <Col className={classWidth}>
                                <Label for="Advertiser" className="mp-label">
                                    Header Bidding Service:
                                </Label>
                                <Input
                                    type="select"
                                    name={"advertiser"}
                                    id="advertiser"
                                    onChange={this.handleInputChange}
                                    value={this.state.advertiser || ''}
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
                            </Col>
                            <Col className={classWidth} hidden={this.props.type !== AD_SERVER_DFP}>
                                <Label for="advertiserId" className="mp-label">
                                    Company:
                                    {" "}
                                    <i className="fa fa-question-circle" id={"Tooltip-company"}/>
                                    <Tooltip
                                        placement="top"
                                        isOpen={this.state.tooltipCompanyOpen}
                                        target={"Tooltip-company"}
                                        toggle={this.tooltipToggle}
                                        autohide={false}
                                    >
                                        <span dangerouslySetInnerHTML={{__html: tooltip}}></span>
                                    </Tooltip>
                                </Label>
                                <Input
                                    type="select"
                                    name={"advertiserId"}
                                    onChange={this.handleInputChange}
                                    value={this.state.advertiserId || ''}
                                    id="advertiserId"
                                    className={"mp-form-control"}
                                >
                                    <option>--</option>
                                    {this.props.sourceAdvertisers.map(
                                        ({id, name}) => (
                                            <option key={id} value={id}>{name}</option>
                                        )
                                    )}
                                </Input>
                            </Col>
                        </Row>

                        {((advertiser) => {
                            switch (advertiser) {
                                case 'amazon':
                                    return <AmazonCreateOrder
                                        formErrors={this.state.formErrors}
                                        handleInputChange={this.handleInputChange}
                                        handleAdUnitsCheckboxChange={this.handleAdUnitsCheckboxChange}
                                        attributes={{
                                            orderName: this.state.orderName,
                                            priceGrid: this.state.priceGrid,
                                            amazonStartPrice: this.state.amazonStartPrice,
                                            amazonCSVItems: this.state.amazonCSVItems,
                                            amazonStep: this.state.amazonStep,
                                            rangeFrom: this.state.rangeFrom,
                                            rangeTo: this.state.rangeTo,
                                            lineItemsNaming: this.state.lineItemsNaming,
                                            keywordTemplate: this.state.keywordTemplate,
                                            creativeFormat: this.state.creativeFormat,
                                            adUnitsSelected: this.state.adUnitsSelected,
                                            keyword: this.state.keyword,
                                        }}
                                        stateSetter={this.stateSetter}
                                    />;
                                case 'clearbid':
                                    return <ClearBidCreateOrder
                                        formErrors={this.state.formErrors}
                                        handleInputChange={this.handleInputChange}
                                        handleAdUnitsCheckboxChange={this.handleAdUnitsCheckboxChange}
                                        attributes={{
                                            orderName: this.state.orderName,
                                            priceGrid: this.state.priceGrid,
                                            priceBand: this.state.priceBand,
                                            rangeFrom: this.state.rangeFrom,
                                            rangeTo: this.state.rangeTo,
                                            lineItemsNaming: this.state.lineItemsNaming,
                                            step: this.state.step,
                                            keywordTemplate: this.state.keywordTemplate,
                                            os: this.state.os,
                                            customEventClassName: this.state.customEventClassName,
                                            customEventData: this.state.customEventData,
                                            adUnitsSelected: this.state.adUnitsSelected,
                                            keyword: this.state.keyword,
                                        }}
                                        stateSetter={this.stateSetter}
                                    />;
                                case 'openx':
                                    return <OpenXCreateOrder
                                        formErrors={this.state.formErrors}
                                        handleInputChange={this.handleInputChange}
                                        handleAdUnitsCheckboxChange={this.handleAdUnitsCheckboxChange}
                                        attributes={{
                                            orderName: this.state.orderName,
                                            rangeFrom: this.state.rangeFrom,
                                            rangeTo: this.state.rangeTo,
                                            lineItemsNaming: this.state.lineItemsNaming,
                                            keywordTemplate: this.state.keywordTemplate,
                                            creativeFormat: this.state.creativeFormat,
                                            creativeSnippet: this.state.creativeSnippet,
                                            adServerDomain: this.state.adServerDomain,
                                            adUnitsSelected: this.state.adUnitsSelected,
                                            keyword: this.state.keyword,
                                            granularity: this.state.granularity,
                                        }}
                                        stateSetter={this.stateSetter}
                                    />;
                                case 'pubmatic':
                                    return <PubMaticCreateOrder
                                        formErrors={this.state.formErrors}
                                        handleInputChange={this.handleInputChange}
                                        handleAdUnitsCheckboxChange={this.handleAdUnitsCheckboxChange}
                                        attributes={{
                                            orderName: this.state.orderName,
                                            rangeFrom: this.state.rangeFrom,
                                            rangeTo: this.state.rangeTo,
                                            lineItemsNaming: this.state.lineItemsNaming,
                                            step: this.state.step,
                                            keywordTemplate: this.state.keywordTemplate,
                                            os: this.state.os,
                                            customEventClassName: this.state.customEventClassName,
                                            customEventData: this.state.customEventData,
                                            adUnitsSelected: this.state.adUnitsSelected,
                                            keyword: this.state.keyword,
                                        }}
                                        stateSetter={this.stateSetter}
                                    />;
                                case 'pubnative':
                                    return <PubNativeCreateOrder
                                        formErrors={this.state.formErrors}
                                        handleInputChange={this.handleInputChange}
                                        handleAdUnitsCheckboxChange={this.handleAdUnitsCheckboxChange}
                                        attributes={{
                                            orderName: this.state.orderName,
                                            rangeFrom: this.state.rangeFrom,
                                            rangeTo: this.state.rangeTo,
                                            lineItemsNaming: this.state.lineItemsNaming,
                                            step: this.state.step,
                                            keywordStep: this.state.keywordStep,
                                            keywordTemplate: this.state.keywordTemplate,
                                            os: this.state.os,
                                            customEventClassName: this.state.customEventClassName,
                                            Ad_ZONE_ID: this.state.Ad_ZONE_ID,
                                            adUnitsSelected: this.state.adUnitsSelected,
                                            keyword: this.state.keyword,
                                        }}
                                        stateSetter={this.stateSetter}
                                    />;
                                case 'smaato':
                                    return <SmaatoCreateOrder
                                        formErrors={this.state.formErrors}
                                        handleInputChange={this.handleInputChange}
                                        handleAdUnitsCheckboxChange={this.handleAdUnitsCheckboxChange}
                                        attributes={{
                                            orderName: this.state.orderName,
                                            rangeFrom: this.state.rangeFrom,
                                            rangeTo: this.state.rangeTo,
                                            lineItemsNaming: this.state.lineItemsNaming,
                                            step: this.state.step,
                                            keywordTemplate: this.state.keywordTemplate,
                                            os: this.state.os,
                                            customEventClassName: this.state.customEventClassName,
                                            customEventData: this.state.customEventData,
                                            adUnitsSelected: this.state.adUnitsSelected,
                                            keyword: this.state.keyword,
                                        }}
                                        stateSetter={this.stateSetter}
                                    />;
                                default:
                                    return null;
                            }
                        })(this.state.advertiser)}
                    </ModalBody>
                    <ModalFooter id={"createOrderModalFooter"} className={"sticky"}>
                        <Button className={"mr-auto"}
                                onClick={() => this.preOrder("download")}
                                color="warning"
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
                    message={this.state.confirmModalMessage}
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
            granularity: "",
            customEventData: "",
            amazonStartPrice: "",
            amazonCSVItems: "",
            amazonStep: "",
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
        if (this.state.advertiser === "amazon") {
            if (PRICE_GRID.uniform === this.state.priceGrid) {
                if (this.state.amazonStartPrice <= 0) {
                    fieldValidationErrors.amazonStartPrice = "Amazon start price must be greater than 0";
                    isValid = false;
                }
                if (this.state.amazonStep <= 0) {
                    fieldValidationErrors.amazonStartPrice = "Amazon price step must be greater than 0";
                    isValid = false;
                }
            }
            if (PRICE_GRID.non_uniform === this.state.priceGrid) {
                if (isEmpty(this.state.amazonCSVItems)) {
                    fieldValidationErrors.amazonCSVItems = "KV pairs is required";
                    isValid = false;
                } else {
                    let broken = [];
                    this.state.amazonCSVItems.map((item, index) => {
                        const trimmed = item.trim();
                        if (!AMAZON_KVP_FORMAT.test(trimmed)) {
                            broken.push(`#${index + 1} "${trimmed}"`);
                        }
                        return trimmed;
                    });
                    if (!isEmpty(broken)) {
                        fieldValidationErrors.amazonCSVItems = `KV pairs: can't parse line(s) ${broken.join(' ')}`;
                        isValid = false;
                    }
                }
            }
        } else if (this.state.advertiser === "clearbid" && PRICE_GRID.non_uniform === this.state.priceGrid) {
            if (isEmpty(this.state.priceBand)) {
                fieldValidationErrors.priceBand = "Price band is required!";
                isValid = false;
            } else {
                if (!/^[0-9\.\,]+$/.test(this.state.priceBand)) {
                    fieldValidationErrors.amazonCSVItems = `Allowed characters for Price Band are "0-9,."`;
                    isValid = false;
                }
            }
        } else {
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
            this.state.advertiser !== "openx" &&
            this.state.rangeTo !== this.state.rangeFrom &&
            this.state.rangeTo - this.state.rangeFrom < this.state.step
        ) {
            fieldValidationErrors.step = "Range too short!";
            isValid = false;
        }
        if (["amazon"].indexOf(this.state.advertiser) !== -1 && isEmpty(this.state.creativeFormat)) {
            fieldValidationErrors.adType = "Creative Format is required!";
            isValid = false;
        }
        if (["clearbid", "pubmatic", "pubnative", "smaato"].indexOf(this.state.advertiser) !== -1 && isEmpty(this.state.customEventClassName)) {
            fieldValidationErrors.adType = "Custom Event Class Name is required!";
            isValid = false;
        }
        if (isEmpty(this.state.adUnitsSelected)) {
            fieldValidationErrors.adunits = "Your line item will not run without targeting an ad unit";
            isValid = false;
        }
        if ((isEmpty(this.state.advertiserId) || '--' == this.state.advertiserId) && this.props.type === AD_SERVER_DFP) {
            fieldValidationErrors.advertiserId = "Header Bidding Service GAM is required";
            isValid = false;
        }
        if (isEmpty(this.state.granularity) && this.state.selectedAdvertiser === 'openx') {
            fieldValidationErrors.granularity = "Granularity is required!";
            isValid = false;
        }
        if (["smaato", "clearbid"].indexOf(this.state.advertiser) !== -1) {
            if (isEmpty(this.state.customEventData)) {
                fieldValidationErrors.customEventData = "Custom Event Data is required!";
                isValid = false;
            } else {
                // check if json valid
                if (/^[\],:{}\s]*$/.test(
                    this.state.customEventData
                        .replace(/\\["\\\/bfnrtu]/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))
                ) {

                } else {
                    fieldValidationErrors.customEventData = "Custom Event Data should have valid JSON format";
                    isValid = false;
                }
            }
        }

        this.setState({
            formErrors: fieldValidationErrors,
            formValid: isValid
        });

        return isValid;
    }

    @bind
    open() {
        this.changeAdvertiser(defaultAdvertiser);
        this.props.createOrderModalToggle();
    }

    @bind
    close() {
        this.props.createOrderModalToggle();
    }

    @bind
    toggle() {
        this.setState(initialState);
        this.props.createOrderModalToggle();
    }

    @bind
    handleInputChange(event) {
        const {value, name} = event.target;

        if (['rangeFrom', 'rangeTo', 'amazonStartPrice', 'amazonStep'].includes(name)) {
            if (value !== "" && !ONLY_NUMBERS.test(value)) {
                return;
            }
        }

        this.setState({[name]: value}, () => {
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
                    adUnitsSelected: [],
                    networkClass: this.props.networkClasses[value][0],
                    customEventClassName: this.props.networkClasses[value][0].hasOwnProperty('value') ? this.props.networkClasses[value][0].value : ''
                });
            }
        })
    }

    @bind
    stateSetter(state) {
        this.setState(state);
    }

    changeAdvertiser(advertiser) {
        const lineItemsNaming = KEYWORD_PLACEHOLDER[advertiser],
            step = advertiser === "amazon" ? 1 : 0.1,
            keywordStep = advertiser === "amazon" ? 1 : 0.01,
            showCreativeFormat = advertiser === "amazon" || advertiser === "openx";

        const customEventData = ((advertiser) => {
            switch (advertiser) {
                case "smaato":
                    return "{\"publisherId\":\"\", \"spaceId\":\"\"}";
                case "clearbid":
                    return "{\"w\":\"\", \"h\":\"\", \"ad_unit_id\":\"\"}";
                case "pubmatic":
                    return "{}";
                default:
                    return "";
            }
        })(advertiser);

        this.props.sourceHandler.setAdvertiser(advertiser);
        this.props.setAdvertiser(advertiser);

        this.setState({
            keywordTemplate: CreateOrderModal.getKeywordTemplate(
                advertiser,
                this.state.creativeFormat
            ),
            step: step,
            keywordStep: keywordStep,
            lineItemsNaming: lineItemsNaming,
            showCreativeFormat: showCreativeFormat,
            advertiser: advertiser,
            selectedAdvertiser: advertiser,
            os: "",
            networkClass: "",
            formValid: true,
            rangeFrom: advertiser === "amazon" ? 1 : 0.1,
            rangeTo: 10,
            customEventClassName: '',
            customEventData: customEventData,
            granularity: "auto",
            creativeSnippet: advertiser === "openx" ? this.props.sourceHandler.getAdvertiser().getCreativeHtmlData([]) : "",
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
    handleAdUnitsCheckboxChange(event) {
        const {checked, name} = event.target;
        if (checked) {
            this.setState(state => ({
                adUnitsSelected: [...new Set([...state.adUnitsSelected, name])]
            }));
        } else {
            this.setState(state => ({
                adUnitsSelected: state.adUnitsSelected.filter(adunit => adunit !== name)
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
            granularity,
            priceGrid
        } = this.state;

        const formValid = this.formValidator();
        if (!formValid) {
            return;
        }

        rangeFrom = toInteger(rangeFrom);
        rangeTo = toInteger(rangeTo);
        step = toInteger(step);

        let items = 0,
            keywords = 0,
            bid;

        if (advertiser === "openx" || advertiser === "pubmatic") {
            if (advertiser === "pubmatic") {
                granularity = 'auto';
                items++
            }
            switch (granularity) {
                case 'low':
                    step = rangeFrom = toInteger(0.5);
                    rangeTo = toInteger(5);
                    for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                        items++;
                    }
                    keywords = 1;
                    break;
                case 'med':
                    step = rangeFrom = toInteger(0.1);
                    rangeTo = toInteger(20);
                    for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                        items++;
                    }
                    keywords = 1;
                    break;
                case 'high':
                    step = rangeFrom = toInteger(0.1);
                    rangeTo = toInteger(20);
                    keywords = 10;
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
                    keywords = 1;
                    break;
                case 'dense':
                    // 0.01 ... 3 (0.01)
                    step = rangeFrom = toInteger(0.01);
                    rangeTo = toInteger(3);
                    for (bid = rangeFrom; bid <= rangeTo; bid += step) {
                        items++;
                    }
                    // 3.05 ... 8 (0.05)
                    step = toInteger(0.05);
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
                    keywords = 1;
                    break;
            }
        } else {
            if (advertiser === "amazon" && priceGrid === PRICE_GRID.non_uniform) {
                items = this.state.amazonCSVItems.length;
                keywords = 1;
            } else if (advertiser === "clearbid" && priceGrid === PRICE_GRID.non_uniform) {
                items = this.state.priceBand.split(',').length;
                keywords = 1;
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
                if (["clearbid", "smaato"].includes(advertiser)) {
                    keywords = 1;
                }
            }
        }

        let lineItemsCount = 0;
        if (this.props.type === AD_SERVER_MOPUB && executor === "create") {
            lineItemsCount = this.props.orders.reduce(function (sum, current) {
                return current.status !== "archived" ? sum + current.lineItemCount : sum;
            }, 0);
        }

        if (this.props.type === AD_SERVER_MOPUB && executor === "create" && lineItemsCount >= 1000) {
            return ModalWindowService.ErrorPopup.showMessage("Number of line items exceeded");
        }

        let message = `Will generate:<br/>${items.toFixed(0)} line item(s), ${keywords.toFixed(0)} keyword(s) per line item.`;

        if (this.props.type === AD_SERVER_MOPUB && executor === "create" && items + lineItemsCount > 1000) {
            message = `${message}<br/>You will exceed the number of line items available in MoPub, this creation will create only some part of line items out of requested ${items}, would you like to continue?`;
        } else {
            message = `${message}<br/>${items.toFixed(0) > 100 ? 'It will take some time. Are you sure?' : 'Are you sure?'}`;
        }

        this.setState(() => ({
            confirmModalMessage: message,
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
            adUnitsSelected: adunits,
            step,
            keywordStep,
            keywordTemplate,
            rangeFrom,
            rangeTo,
            orderName,
            lineItemsNaming,
            advertiser,
            creativeFormat,
            creativeSnippet,
            networkClass,
            customEventClassName,
            Ad_ZONE_ID,
            adServerDomain,
            advertiserId,
            granularity,
            customEventData,
            amazonStartPrice,
            amazonCSVItems,
            amazonStep,
            priceGrid,
            priceBand,
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
            creativeSnippet,
            networkClass,
            customEventClassName,
            Ad_ZONE_ID,
            adServerDomain,
            customTargetingKeys: this.props.customTargetingKeys,
            customTargetingValues: this.props.customTargetingValues,
            granularity,
            customEventData,
            amazonStartPrice,
            amazonCSVItems,
            amazonStep,
            priceGrid,
            priceBand,
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

        this.justCreatedOrder = null;

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
                ModalWindowService.AlertPopup.showMessage(
                    this.createModalMessage(),
                    'Success!'
                );
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

        ModalWindowService.ProgressModal.onCancel(() => {
            this.setState({canceled: true});
            ModalWindowService.ProgressModal.hideModal();
            window.canceledExport = true;
            //progress.cancel("canceled by user");

            this.timer = setTimeout(() => {
                this.setState({canceled: false});
                window.canceledExport = false
            }, 1000)
        });
    }

    getOrderUrl(key) {
        if (this.props.sourceHandler) {
            return this.props.sourceHandler.getOrderUrl(key);
        }
        return null;
    }

    @bind
    async download() {
        let {
            adUnitsSelected: adunits,
            step,
            keywordStep,
            keywordTemplate,
            rangeFrom,
            rangeTo,
            orderName,
            lineItemsNaming,
            advertiser,
            creativeFormat,
            creativeSnippet,
            networkClass,
            customEventClassName,
            Ad_ZONE_ID,
            advertiserId,
            adServerDomain,
            granularity,
            customEventData,
            amazonStartPrice,
            amazonCSVItems,
            amazonStep,
            priceGrid,
            priceBand,
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
            creativeSnippet,
            networkClass,
            customEventClassName,
            Ad_ZONE_ID,
            adServerDomain,
            customTargetingKeys: this.props.customTargetingKeys,
            customTargetingValues: this.props.customTargetingValues,
            granularity,
            customEventData,
            amazonStartPrice,
            amazonCSVItems,
            amazonStep,
            priceGrid,
            priceBand,
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
                // this.close();
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
    orders: adServerSelectors.orders(state),
    createOrderModalOpen: adServerSelectors.createOrderModalOpen(state),
    type: adServerSelectors.switcherType(state),
    sourceHandler: adServerSelectors.sourceHandler(state),
    adunits: adServerSelectors.adunits(state),
    sourceHandlerReady: adServerSelectors.sourceHandlerStatus(state),
    advertiser: adServerSelectors.getAdvertiser(state),
    networkCode: adServerSelectors.networkCode(state),

    ...adServerSelectors.dfpInventory(state),
    ...adServerSelectors.duplicateOrder(state),
});

export default connect(mapStateToProps, mapDispatchToProps)(CreateOrderModal)
