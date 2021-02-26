import React, {Component} from "react";
import {connect} from 'react-redux'
import bind from "bind-decorator";
import GroupsTable from "./Table";
import BaseLayout from "../layouts/BaseLayout";
import adServerSelectors from '../../../redux/selectors/adServer'
import adServerActions from '../../../redux/actions/adServer'
import ConfirmModal from "../Popups/ConfirmModal";
import LoginLink from "../Common/LoginLink"
import {Button} from "reactstrap";
import CreateOrderModal from "../Popups/CreateOrder";

window.canceledExport = false;

class MediationGroups extends Component {

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
        canceled: false,
        loggedIn: null,
        ordersForImport: [],
        confirmModalMessage: null,
    };

    componentDidMount() {
        this.props.setSwitcher(this.props.type);
        window.AdMobAutomation.loggedIn.then(loggedIn => this.setState({loggedIn}));
    }

    componentWillUnmount() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }

    render() {
        let {
            orderCount,
            loggedIn
        } = this.state;

        return (
            <BaseLayout className="orders-list-layout">

                <h2>Mediation Groups</h2>
                <div className={"orders-list-actions"}>
                    <CreateOrderModal
                        toUpdate={this.loadOrders}
                    />
                </div>

                <GroupsTable
                    updatedFiltersAt={this.state.updatedFiltersAt}
                    orders={this.props.orders}
                    adServer={this.props.type}
                    onUpdate={this.onOrdersListUpdate}
                />

                {this.statusInOrdersTable()}

                <ConfirmModal
                    message={this.state.confirmModalMessage}
                    ref={modal => (this.confirmModal = modal)}
                    onConfirm={this.importOrders}
                />

            </BaseLayout>
        );
    }

    @bind
    changeNetworkCode() {
        this.props.dfpAuthModalToggle();
    }

    statusInOrdersTable() {
        console.log("type: "+this.props.type)
        console.log("login : "+this.state.loggedIn)
        const isLoggedIn = (this.state.loggedIn != null && this.state.loggedIn)

        if (!isLoggedIn) {
            return (
                <div className={"please-log-in"}>
                    <p>Please&nbsp;<LoginLink>login</LoginLink>&nbsp;to load orders</p>
                </div>
            )
        }

        if (this.props.ordersLoaded) {
            return (
                (this.props.orders === undefined) && (
                    <div className={"no-orders"}>
                        <p>No orders</p>
                    </div>
                )
            )
        }

        return (
            <div className={"loading-in-progress"}>
                <p>Loading...</p>
                <svg width="100px" height="100px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"
                     preserveAspectRatio="xMidYMid" className="lds-rolling" style={{"background": "none"}}>
                    <circle cx="50" cy="50" fill="none" stroke="#b3121e" strokeWidth="10" r="35"
                            strokeDasharray="164.93361431346415 56.97787143782138" transform="rotate(68.8726 50 50)">
                        <animateTransform attributeName="transform" type="rotate" calcMode="linear"
                                          values="0 50 50;360 50 50" keyTimes="0;1" dur="2.1s" begin="0s"
                                          repeatCount="indefinite"></animateTransform>
                    </circle>
                </svg>
            </div>
        )
    }

    @bind
    loadOrders() {
        this.props.refreshOrders();
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
        let selected = this.state.orders;

        this.setState({
            orderCount: selected.length,
            lineItemCount: selected.reduce((sum, {lineItemCount}) => sum + lineItemCount, 0),
            selected
        });
    }
}

const mapDispatchToProps = {
    setSwitcher: adServerActions.setSwitcher,
    refreshOrders: adServerActions.refreshOrders,
    dfpAuthModalToggle: adServerActions.dfpAuthModalToggle
};

const mapStateToProps = state => ({
    orders: adServerSelectors.orders(state),
    ordersLoaded: adServerSelectors.ordersLoaded(state),
    dfpLoggedIn: adServerSelectors.dfpLoggedIn(state),
    networkCode: adServerSelectors.networkCode(state),
    type: adServerSelectors.switcherType(state),
    sourceHandler: adServerSelectors.sourceHandler(state),
    sourceHandlerReady: adServerSelectors.sourceHandlerStatus(state),
});

export default connect(mapStateToProps, mapDispatchToProps)(MediationGroups)
