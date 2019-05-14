import React, {Component} from "react";
import Select from "react-select";
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
    CardHeader
} from "reactstrap";
import InputNumber from "rc-input-number";
import {OrderController} from "../../controllers";
import FormErrors from "../FormErrors";
import {ProgressModal} from "./";
import {isEmpty} from "../../helpers";
import ConfirmModal from "./ConfirmModal";

const delay = ms => new Promise(res => setTimeout(() => res(ms), ms));

export class CreateOrderModal extends Component {
    static defaultProps = {
        onClose: () => {
        }
    };

    state = {
        isOpen: false,
        backdrop: true,
        adunits: [],
        adunitsSelected: [],
        order: {},
        orderName: "",
        lineItemsNaming: "",
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
        willGenerateKeywords: 0,
        willGenerateLineItems: 0
    };

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

    componentDidMount = () => {
        window.MopubAutomation.adunits.then(adunits => this.setState({adunits}));

        ModalWindowService.onUpdate = () => this.forceUpdate();
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

    render() {
        return (
            <React.Fragment>
                <Button color="primary" onClick={this.open}>
                    <i className="fa fa-plus-circle"/>
                    &nbsp; Create
                </Button>
                <Modal
                    isOpen={this.state.isOpen}
                    toggle={this.toggle}
                    size="lg"
                    backdrop={this.state.backdrop}
                >
                    <ModalHeader>Create New Order</ModalHeader>

                    <ModalBody>
                        <div className="panel panel-default">
                            <FormErrors
                                formErrors={this.state.formErrors}
                                formValid={this.state.formValid}
                            />
                        </div>
                        <Form inline>
                            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                                <Label for="orderName" className="mr-sm-2">
                                    Order Name:
                                </Label>
                                <Input
                                    invalid={!isEmpty(this.state.formErrors.orderName)}
                                    type="text"
                                    name={"orderName"}
                                    id="orderName"
                                    onChange={this.handleInputChange}
                                />
                            </FormGroup>
                            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                                <Label for="AdServer" className="mr-sm-2">
                                    AdServer:
                                </Label>
                                <Input
                                    type="select"
                                    name={"AdServer"}
                                    onChange={this.handleInputChange}
                                    id="AdServer"
                                >
                                    <option value={1}>MoPub</option>
                                </Input>
                            </FormGroup>
                            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                                <Label for="Advertiser" className="mr-sm-2">
                                    Advertiser:
                                </Label>
                                <Input
                                    type="select"
                                    name={"Advertiser"}
                                    onChange={this.handleInputChange}
                                    id="Advertiser"
                                >
                                    <option value={1}>Pubnative</option>
                                </Input>
                            </FormGroup>
                        </Form>

                        <Row>
                            <Col className={"col-sm-12"}>
                                Line Items Range: from [
                                <CustomInput
                                    invalid={!isEmpty(this.state.formErrors.rangeFrom)}
                                    inline
                                    style={{width: "40px"}}
                                    type="text"
                                    id={"rangeFrom"}
                                    name={"rangeFrom"}
                                    value={this.state.rangeFrom}
                                    onChange={this.handleInputChange}
                                />{" "}
                                to{" "}
                                <CustomInput
                                    invalid={!isEmpty(this.state.formErrors.rangeTo)}
                                    inline
                                    style={{width: "40px"}}
                                    type="text"
                                    id={"rangeTo"}
                                    name={"rangeTo"}
                                    value={this.state.rangeTo}
                                    onChange={this.handleInputChange}
                                />
                                ].
                            </Col>
                        </Row>
                        <Row>
                            <Col className={"col-sm-12"}>
                                Step:
                                <InputNumber
                                    invalid={!isEmpty(this.state.formErrors.step)}
                                    min={0.1}
                                    max={1000}
                                    step={0.1}
                                    value={this.state.step}
                                    onChange={this.onChangeStep}
                                    style={{width: 60}}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col className={"col-sm-12"}>
                                Keyword Step:
                                <InputNumber
                                    invalid={!isEmpty(this.state.formErrors.keywordStep)}
                                    min={0.01}
                                    max={1000}
                                    step={0.01}
                                    value={this.state.keywordStep}
                                    onChange={this.onChangeKeywordStep}
                                    style={{width: 60}}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col className={"col-sm-3"}>Line Items naming:</Col>
                            <Col className={"col-sm-9"}>
                                <CustomInput
                                    invalid={!isEmpty(this.state.formErrors.lineItemsNaming)}
                                    inline
                                    style={{width: "200px"}}
                                    type="text"
                                    id={"lineItemsNaming"}
                                    name={"lineItemsNaming"}
                                    onChange={this.handleInputChange}
                                    placeholder="PN Hybib {bid}"
                                    className={"form-control"}
                                />
                                <FormText color="muted">
                                    "bid" macro above is replaced to the bid value corresponding
                                    to the line item
                                </FormText>
                            </Col>
                        </Row>
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
                                                ({name, format, key, appName}) => (
                                                    <tr key={key}>
                                                        <td>
                                                            <div className="custom-control custom-checkbox">
                                                                <input
                                                                    type="checkbox"
                                                                    name={key}
                                                                    onChange={this.handleAdunitsCheckboxChange}
                                                                    className="custom-control-input"
                                                                    id={`adUnit${key}`}
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
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={this.cancel} color="secondary">
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
            rangeTo: ""
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
        if (data.keywordStep >= data.step) {
            fieldValidationErrors.step =
                "Line items step can not be less than Keyword step!";
            isValid = false;
        }
        if (data.rangeTo - data.rangeFrom < data.step) {
            fieldValidationErrors.step = "Range too short!";
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
    handleInputChange(event) {
        const {value, name} = event.target;
        this.setState({[name]: value});
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
            orderName,
            lineItemsNaming,
            rangeTo
        } = this.state;

        const order1 = {
            adunits,
            step,
            keywordStep,
            orderName,
            rangeFrom,
            rangeTo,
            lineItemsNaming
        };
        // console.log(order1);

        const formValid = this.formValidator(order1);
        if (!formValid) {
            return;
        }

        rangeFrom = Number(rangeFrom);
        rangeTo = Number(rangeTo);
        step = Number(step);

        let items = (rangeTo - rangeFrom) / step;
        let keywords = step / keywordStep;

        this.setState(() => ({
            willGenerateLineItems: items.toFixed(0),
            willGenerateKeywords: keywords.toFixed(0),
        }));

        this.ask();
    }

    toValidUI = num => Math.round(num * 100) / 100;

    @bind
    async create() {
        let {
            adunitsSelected: adunits,
            step,
            keywordStep,
            rangeFrom,
            orderName,
            lineItemsNaming,
            rangeTo
        } = this.state;

        let order = {
            advertiser: orderName,
            description: "",
            name: orderName
        };

        const responseOrder = await OrderController.createOrderNew(order);
        // const responseOrder = {};

        let requests = [],
            bid;

        rangeFrom = Number(rangeFrom);
        rangeTo = Number(rangeTo);
        step = Number(step);

        for (bid = rangeFrom; bid <= rangeTo; bid += step) {
            bid = this.toValidUI(bid);
            let keywords = [];
            for (let i = bid; i < bid + step; i += keywordStep) {
                i = this.toValidUI(i);
                // depends on advert
                const keyword = "pn_bid:" + i;
                keywords.push(keyword);
            }
            requests.push({
                // ...response,
                adUnitKeys: adunits,
                bid: bid,
                name: lineItemsNaming.replace("{bid}", bid),
                orderKey: responseOrder.key,

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
                keywords: keywords,
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
                type: "promo",
                userAppsTargeting: "include",
                userAppsTargetingList: []
            });
        }
        // console.log(requests);

        ModalWindowService.ProgressModal.setProgress([
            {
                title: `orders: 1/1`,
                progress: {value: 100}
            },
            {
                title: "line items:",
                progress: {value: 0}
            }
        ]);

        const responseLineItems = await OrderController.createLineItemsNew(
            requests,
            (item, step) => {
                // do some with item
                ModalWindowService.ProgressModal.setProgress([
                    {
                        title: `orders: 1/1`,
                        progress: {value: 100}
                    },
                    {
                        title: `line items: ${step}/${requests.length}`,
                        progress: {value: (step / requests.length) * 100}
                    }
                ]);
                // delay(500);
            }
        );

        // hide progress modal after create
        ModalWindowService.ProgressModal.hideModal();

        // Hide modal after create
        this.setState({isOpen: false});
    }

    @bind
    toggle() {
        this.setState(state => ({isOpen: !state.isOpen}));
    }

    @bind
    cancel() {
        this.setState({isOpen: false});
    }
}
