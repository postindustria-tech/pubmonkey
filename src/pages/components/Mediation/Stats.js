import React, {Component} from "react";
import {connect} from 'react-redux'
import adServerActions from "../../../redux/actions/adServer";
import adServerSelectors from "../../../redux/selectors/adServer";

class MediationGroupsStats extends Component {

    render() {
        if (!this.props.ordersLoaded || !this.props.orders) {
            return (<React.Fragment></React.Fragment>)
        }

        const orders = this.props.orders
        if (!orders) {
            return (<React.Fragment></React.Fragment>)
        }
        if (!orders.length) {
            return (<React.Fragment></React.Fragment>)
        }

        return (
            <React.Fragment>
                {orders.length} groups
            </React.Fragment>
        )
    }
}


const mapDispatchToProps = {
    filterOrderStatus: adServerActions.filterOrderStatus,
};

const mapStateToProps = state => ({
    orders: adServerSelectors.orders(state),
    ordersLoaded: adServerSelectors.ordersLoaded(state),
    sourceHandler: adServerSelectors.sourceHandler(state),
    sourceHandlerReady: adServerSelectors.sourceHandlerStatus(state),
    type: adServerSelectors.switcherType(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(MediationGroupsStats)