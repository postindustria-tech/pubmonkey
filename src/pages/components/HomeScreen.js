import React, {Component} from "react";
import {connect} from 'react-redux'
import {AD_SERVER_ADMOB} from "../constants/source";
import adServerSelectors from '../../redux/selectors/adServer'
import MediationGroups from "../components/Mediation/Groups";
import OrdersList from "../components/Orders/List";

class HomeScreen extends Component {

    render() {
        return this.props.type === AD_SERVER_ADMOB ? <MediationGroups/> : <OrdersList/>
    }
}

const mapStateToProps = state => ({
    type: adServerSelectors.switcherType(state),
});

export default connect(mapStateToProps, null)(HomeScreen)
