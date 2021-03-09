import React, {Component, } from 'react';
import {connect} from "react-redux";
import adServerSelectors from '../../../redux/selectors/adServer';
import adServerActions from "../../../redux/actions/adServer";
import {AD_SERVER_DFP, AD_SERVER_MOPUB, AD_SERVER_ADMOB} from "../../constants/source";
import bind from "bind-decorator";


class LogoutLink extends Component {

    state = {
        loggedIn: null
    };

    componentDidMount() {
        window.MopubAutomation.loggedIn
            .then(loggedIn => this.setState({loggedIn}));
    }

    render() {

        const {loggedIn} = this.state;

        if(
            (this.props.type === AD_SERVER_DFP && !this.props.dfpLoggedIn)
            || (this.props.type === AD_SERVER_MOPUB && (loggedIn == null || !loggedIn))
        ){
            return (<React.Fragment></React.Fragment>)
        }

        if(this.props.type === AD_SERVER_DFP){
            return (<a style={this.props.style} href="#" onClick={this.dfpLogOut}>{this.props.children}</a>)
        }

        if(this.props.type === AD_SERVER_MOPUB){
            return (<a style={this.props.style} href="#" onClick={this.mopubLogOut}>{this.props.children}</a>)
        }

        if(this.props.type === AD_SERVER_ADMOB){
            return (<a style={this.props.style} href="#" onClick={this.mopubLogOut}>{this.props.children}</a>)
        }

        return (<React.Fragment></React.Fragment>)
    }

    @bind
    dfpLogOut() {
        this.props.sourceHandler.removeCachedAuthToken();
        this.props.sourceHandler.clear();
        this.props.dfpLogOut();
        this.props.setDFPLoggedIn(false);
        localStorage.removeItem("dfpToken");
    }

    @bind
    mopubLogOut() {
        this.props.sourceHandler.logout()
            .then(() => {
                window.location.reload();
            });
    }

}


const mapDispatchToProps = {
    dfpLogOut: adServerActions.dfpLogOut,
    setDFPLoggedIn: adServerActions.dfpLoggedIn,
};

const mapStateToProps = state => ({
    type: adServerSelectors.switcherType(state),
    sourceHandler: adServerSelectors.sourceHandler(state),
    dfpLoggedIn: adServerSelectors.dfpLoggedIn(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(LogoutLink)