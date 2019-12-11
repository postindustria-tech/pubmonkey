import React, {Component} from "react";
import {
    Button,
    Input,
    Col,
    Row
} from "reactstrap";
import {connect} from 'react-redux'
import moment from "moment";
import bind from "bind-decorator";
import OrdersTable from "./Table";
import BaseLayout from "../layouts/BaseLayout";
import {FileService, ModalWindowService} from "../../services";
import {MainController, OrderController} from "../../controllers";
import CreateOrderModal from "../Popups/CreateOrder";
import {AD_SERVER_DFP, AD_SERVER_MOPUB} from "../../constants/source";
import adServerSelectors from '../../../redux/selectors/adServer'
import adServerActions from '../../../redux/actions/adServer'
import ConfirmModal from "../Popups/ConfirmModal";

window.canceledExport = false;

class OrdersList extends Component {

    timer = null;

    static defaultProps = {
        sourceHandlerReady: false,
        STATUS_OPTIONS: [],
    };

    state = {
        orders: [],
        selected: [],
        orderCount: 0,
        lineItemCount: 0,
        filter: undefined,
        filterFn: () => true,
        canceled: false,
        loggedIn: null,
        ordersForImport: [],
        confirmModalMessage: null,
    };

    componentDidMount() {
        this.props.setSwitcher(this.props.type);
        window.MopubAutomation.loggedIn.then(loggedIn => this.setState({loggedIn}));
    }

    componentWillUnmount() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.type !== prevProps.type) {
            this.filterChange(this.props.filter);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.filter !== this.props.filter || this.state.filter === undefined) {
            this.setState({
                filter: nextProps.filter,
                filterFn: nextProps.sourceHandler.FILTER_FN[nextProps.filter],
            });
        }
    }

    render() {
        let {
            orderCount,
            filter,
            filterFn,
            loggedIn
        } = this.state;

        return (
            <BaseLayout className="orders-list-layout">

                <h2>Orders</h2>
                <div className={"orders-list-actions"}>
                    <Button
                        color="primary"
                        onClick={this.exportSelected}
                        disabled={!orderCount || !this.props.sourceHandlerReady}
                    >
                        <i className="fa fa-cloud-download"/>
                        &nbsp; Export
                    </Button>
                    <Button
                        color="primary"
                        onClick={this.importSelected}
                        hidden={this.props.type === AD_SERVER_DFP}
                        disabled={!this.props.sourceHandlerReady}
                    >
                        <i className="fa fa-cloud-upload"/>
                        &nbsp; Import
                    </Button>
                    <CreateOrderModal
                        toUpdate={this.loadOrders}
                    />
                    {/*<Button
                    color="primary"
                    onClick={this.backupSelected}
                    disabled={!orderCount}
                >
                    Create Backup
                </Button>*/}
                    {/* <Button
                    color="primary"
                    onClick={ this.archiveSelected }
                    disabled={ !orderCount }
                >
                    Archive/Unarchive
                </Button> */}
                </div>

                <Row className="list-filter">
                    <Col className={"col-sm-12"}>
                        <span className={"mp-label"}>Status: </span>
                        <Input
                            type="select"
                            name={"status"}
                            onChange={this.onFilterChange}
                            value={filter}
                            className={"mp-form-control"}
                        >
                            {this.props.STATUS_OPTIONS.map(
                                (item, index) => (
                                    <option key={index} value={item.value}>
                                        {item.label}
                                    </option>
                                )
                            )}
                        </Input>
                    </Col>
                </Row>
                {this.props.ordersLoaded ?
                <Row className="list-filter">
                    <Col className={"col-sm-12"}>
                        <span className={"mp-label"}>
                            {
                                this.props.orders.filter(this.props.sourceHandler.FILTER_FN[0]).length + ' orders, ' +
                                this.props.orders.filter(this.props.sourceHandler.FILTER_FN[0]).map(o => parseInt(o.lineItemCount)).reduce((a,b) => a + b, 0) + ' line items'
                            }
                         </span>
                    </Col>
                </Row> : ''}
                <OrdersTable
                    updatedFiltersAt={this.state.updatedFiltersAt}
                    orders={this.props.orders}
                    adServer={this.props.type}
                    filter={filterFn}
                    onUpdate={this.onOrdersListUpdate}
                />

                {((this.props.type == AD_SERVER_MOPUB && loggedIn != null && loggedIn) || (this.props.type == AD_SERVER_DFP && this.props.dfpLoggedIn != null && this.props.dfpLoggedIn))
                        ? (
                            this.props.ordersLoaded
                            ? (
                                !this.props.orders.filter(filterFn).length && (
                                    <div className={"no-orders"}>
                                        <p>No orders</p>
                                    </div>
                                )
                            )
                            : (
                                <div className={"loading-in-progress"}>
                                    <p>Loading...</p>
                                    <svg width="100px"  height="100px"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" className="lds-rolling" style={{"background": "none"}}><circle cx="50" cy="50" fill="none"  stroke="#b3121e" strokeWidth="10" r="35" strokeDasharray="164.93361431346415 56.97787143782138" transform="rotate(68.8726 50 50)"><animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 50;360 50 50" keyTimes="0;1" dur="2.1s" begin="0s" repeatCount="indefinite"></animateTransform></circle></svg>
                                </div>
                                )
                        )
                        : (<div className={"please-log-in"}>
                            <p>Please login to load orders</p>
                        </div>)
                }

                <ConfirmModal
                    message={this.state.confirmModalMessage}
                    ref={modal => (this.confirmModal = modal)}
                    onConfirm={this.importOrders}
                />
            </BaseLayout>
        );
    }

    @bind
    importSelected() {
        FileService.openFile().then((result) => {
            if (result) {
                let orders;
                try {
                    orders = JSON.parse(result).orders;
                } catch (e) {
                    return Promise.reject("Import failed. File is damaged or invalid.");
                }

                this.setState({ordersForImport: orders});

                if (this.props.type === AD_SERVER_MOPUB) {
                    const total = orders.reduce((sum, {lineItems}) => sum + lineItems.length, 0),
                        lineItemsCount = this.props.orders.reduce(function(sum, current) {
                        return current.status !== "archived" ? sum + current.lineItemCount : sum;
                    }, 0);

                    if (lineItemsCount >= 1000) {
                        return Promise.reject("Number of line items exceeded");
                    }

                    if (total + lineItemsCount > 1000) {
                        this.setState({confirmModalMessage: `You will exceed the number of line items available in MoPub, this import will create only some part of line items out of requested ${total}, would you like to continue?`});
                        this.confirmModal.toggle();
                        return;
                    }
                }

                this.importOrders();
            }
        }).catch(err => {
            ModalWindowService.ErrorPopup.showMessage(err)
        });
    }

    @bind
    importOrders() {

        let orders = this.state.ordersForImport,
            total = orders.reduce((sum, {lineItems}) => sum + lineItems.length, 0),
            n = 0,
            average;

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

        let promise = this.props.sourceHandler.restoreOrdersWithLineItems(
            orders,
            ({
                 lineItemCount,
                 lineItemsDone,
                 orderCount,
                 ordersDone,
                 timestamp
             }) => {
                if (average == null) {
                    average = timestamp;
                } else {
                    average = (average + timestamp) / 2;
                }

                n++;

                ModalWindowService.ProgressModal.setProgress([
                    {
                        title: `orders: ${ordersDone}/${orderCount}`,
                        progress: {value: (ordersDone / orderCount) * 100}
                    },
                    {
                        title: `line items: ${lineItemsDone}/${lineItemCount}`,
                        progress: {value: (lineItemsDone / lineItemCount) * 100}
                    },
                    {
                        title: `time remaining: ${moment(average * (total - n)).format(
                            "mm:ss"
                        )}`
                    }
                ]);
            }
        )
            .then(() => {
                ModalWindowService.AlertPopup.showMessage(
                    'Import has finished successfully.',
                    'Success!'
                );
            })
            .catch(({data: {errors}}) => {
                let fields = Object.keys(errors);
                ModalWindowService.ErrorPopup.showMessage(
                    "Import failed. File is damaged or invalid"
                    // fields.map((field, idx) => (
                    //     <div key={idx}>
                    //         <strong>{field}:</strong>&nbsp;{errors[field]}
                    //     </div>
                    // ))
                );
            })
            .finally(() => {
                this.loadOrders();
                ModalWindowService.ProgressModal.hideModal();
            });

        ModalWindowService.ProgressModal.onCancel(() =>
            promise.cancel("canceled by user")
        );
    }

    @bind
    exportSelected() {
        let {orderCount, lineItemCount: total, selected} = this.state,
            name = "default name",
            created = Date.now(),
            n = 0,
            average;

        if (selected.length === 1) {
            name = selected[0].name;
        }

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

        let promise = this.props.sourceHandler.collectOrderDataFromSet(
            selected,
            ({lineItemCount, lineItemsDone, orderCount, ordersDone, timestamp, lineItemsTotal}) => {
                if (this.state.canceled) return;
                if (lineItemsTotal) {
                    total = lineItemsTotal;
                }
                if (average == null) {
                    average = timestamp;
                } else {
                    average = (average + timestamp) / 2;
                }

                n++;

                ModalWindowService.ProgressModal.setProgress([
                    {
                        title: `orders: ${ordersDone}/${orderCount}`,
                        progress: {value: (ordersDone / orderCount) * 100}
                    },
                    {
                        title: `line items: ${lineItemsDone}/${lineItemCount}`,
                        progress: {value: (lineItemsDone / lineItemCount) * 100}
                    },
                    {
                        title: `time remaining: ${moment(average * (total - n)).format(
                            "mm:ss"
                        )}`
                    }
                ]);
            },
            this.state.canceled
        )
            .then(orders => ({
                name,
                orderCount,
                lineItemCount: total,
                created,
                orders,
                updated: null
            }))
            .then(result => {
                let data = JSON.stringify(result, null, "  "),
                    name = result.name;

                FileService.saveFile(data, `${name}.json`);
            })
            .finally(() => {
                ModalWindowService.ProgressModal.hideModal();
            });

        ModalWindowService.ProgressModal.onCancel(() => {
            this.setState({canceled: true});
            ModalWindowService.ProgressModal.hideModal();
            window.canceledExport = true;
            promise.cancel("canceled by user");

            this.timer = setTimeout(() => {
                this.setState({canceled: false});
                window.canceledExport = false
            }, 1000)
        });
    }

    @bind
    loadOrders() {
        console.log('loadOrders: ' + this.props.type);
        this.props.refreshOrders();
    }

    @bind
    archiveSelected() {
        let {selected, filter, filterFn} = this.state,
            status = filter === 2 ? "running" : "archived";

        selected = selected.filter(filterFn);

        ModalWindowService.ProgressModal.setProgress([
            {
                title: `orders: ${selected.length}`,
                progress: {value: 0}
            }
        ]);

        let promise = OrderController.updateOrderStatusInSet(
            selected,
            status,
            ({count, done}) => {
                ModalWindowService.ProgressModal.setProgress([
                    {
                        title: `orders: ${done}/${count}`,
                        progress: {value: (done / count) * 100}
                    }
                ]);
            }
        );

        ModalWindowService.ProgressModal.onCancel(() =>
            promise.cancel("canceled by user")
        );

        promise.finally(() => {
            ModalWindowService.ProgressModal.hideModal();
            this.loadOrders();
        });
    }

    @bind
    backupSelected() {
        let {orderCount, lineItemCount: total, selected} = this.state,
            name = "default name",
            created = Date.now(),
            n = 0,
            average;

        // this.hideModal()

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

        let promise = OrderController.collectOrderDataFromSet(
            selected,
            ({lineItemCount, lineItemsDone, orderCount, ordersDone, timestamp}) => {
                if (average == null) {
                    average = timestamp;
                } else {
                    average = (average + timestamp) / 2;
                }

                n++;

                ModalWindowService.ProgressModal.setProgress([
                    {
                        title: `orders: ${ordersDone}/${orderCount}`,
                        progress: {value: (ordersDone / orderCount) * 100}
                    },
                    {
                        title: `line items: ${lineItemsDone}/${lineItemCount}`,
                        progress: {value: (lineItemsDone / lineItemCount) * 100}
                    },
                    {
                        title: `time remaining: ${moment(average * (total - n)).format(
                            "mm:ss"
                        )}`
                    }
                ]);
            }
        )
            .then(orders => ({
                name,
                orderCount,
                lineItemCount: total,
                created,
                orders,
                updated: null
            }))
            .then(result => {
                MainController.keepInDraft(JSON.stringify(result));
                this.props.history.push("/backup/preview");
            })
            .finally(ModalWindowService.ProgressModal.hideModal);

        ModalWindowService.ProgressModal.onCancel(() =>
            promise.cancel("canceled by user")
        );
    }

    @bind
    onOrdersListUpdate(orders) {
        this.setState(
            {
                orders
            },
            () => this.calcSelected()
        );
    }

    calcSelected() {
        let selected = this.state.orders
            .filter(this.state.filterFn)
            .filter(({checked}) => checked);

        this.setState({
            orderCount: selected.length,
            lineItemCount: selected.reduce((sum, {lineItemCount}) => sum + lineItemCount, 0),
            selected
        });
    }

    @bind
    onFilterChange(event) {
        const {value, name} = event.target;

        this.filterChange(value);
    }

    filterChange(filter) {
        filter = Number(filter);
        this.setState({
            filter: filter,
            filterFn: this.props.sourceHandler.FILTER_FN[filter],
        }, () => {
            this.props.filterOrderStatus(filter)
        });
    }
}

const mapDispatchToProps = {
    setSwitcher: adServerActions.setSwitcher,
    refreshOrders: adServerActions.refreshOrders,
    filterOrderStatus: adServerActions.filterOrderStatus,
};

const mapStateToProps = state => ({
    orders: adServerSelectors.orders(state),
    ordersLoaded: adServerSelectors.ordersLoaded(state),
    dfpLoggedIn: adServerSelectors.dfpLoggedIn(state),
    type: adServerSelectors.switcherType(state),
    sourceHandler: adServerSelectors.sourceHandler(state),
    sourceHandlerReady: adServerSelectors.sourceHandlerStatus(state),

    ...adServerSelectors.filterOrderStatus(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(OrdersList)