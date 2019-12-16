import React, {Component} from "react";
import {connect} from 'react-redux'
import {AD_SERVER_DFP, AD_SERVER_MOPUB} from '../../constants/source';
import adServerActions from "../../../redux/actions/adServer";
import adServerSelectors from "../../../redux/selectors/adServer";

class OrdersStats extends Component {

    render() {
        if(!this.props.ordersLoaded || !this.props.orders){
            return (<React.Fragment></React.Fragment>)
        }

        const orders = this.props.orders.filter(this.props.sourceHandler.FILTER_FN[0])
        if(!orders){
            return (<React.Fragment></React.Fragment>)
        }

        let lineItems = orders.map(o => o.lineItemCount)
        if(!lineItems){
            return (<React.Fragment></React.Fragment>)
        }

        if(this.props.type === AD_SERVER_MOPUB){
            lineItems = lineItems.reduce((a,b) => a + b, 0)
        }else{
            lineItems = lineItems.map(i => i.length && i[0] != '' ? parseInt(i[0].replace(/[^0-9]/ig, '')) : 0).reduce((a,b) => a + b, 0)
            lineItems = isNaN(lineItems) ? 0 : lineItems
        }


        return (
            <React.Fragment>
                 {orders.length} orders, {lineItems} line items
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

export default connect(mapStateToProps, mapDispatchToProps)(OrdersStats)