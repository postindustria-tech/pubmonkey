import React, {Component} from 'react';
import {connect} from "react-redux";
import adServerSelectors from '../../../redux/selectors/adServer';
import adServerActions from "../../../redux/actions/adServer";
import {AD_SERVER_DFP, AD_SERVER_MOPUB} from "../../constants/source";
import bind from "bind-decorator";

class LoginLink extends Component {

    state = {
        loggedIn: null
    }

    componentDidMount() {
        window.MopubAutomation.loggedIn
            .then(loggedIn => this.setState({loggedIn}));
    }

    render() {
        const {loggedIn} = this.state;

        if (
            (this.props.type === AD_SERVER_DFP && this.props.dfpLoggedIn)
            || (this.props.type === AD_SERVER_MOPUB && loggedIn != null && loggedIn)
        ) {
            return (<React.Fragment></React.Fragment>)
        }

        if (this.props.type === AD_SERVER_DFP) {
            return (<a style={this.props.style} href="#" onClick={this.dfpLogIn}>{this.props.children}</a>)
        }

        if (this.props.type === AD_SERVER_MOPUB) {
            return (<a href="#" onClick={window.MopubAutomation.openLoginPage}>{this.props.children}</a>)
        }

        return (<React.Fragment></React.Fragment>)
    }

    @bind
    async dfpLogIn() {
        const token = await this.getToken();
        if (token) {
            localStorage.setItem("dfpToken", token);
            localStorage.setItem("dfpTokenExpire", (Date.now() + 1000 * 60 * 10).toString());
            this.props.dfpLogIn(token);
        }
    }

    getToken() {
        return new Promise((resolve, reject) => {
            chrome.identity.getAuthToken({interactive: true}, function (token) {
                // console.log(token);
                resolve(token);
            });
        });
    }

}


const mapDispatchToProps = {
    dfpLogIn: adServerActions.dfpLogIn,
};

const mapStateToProps = state => ({
    type: adServerSelectors.switcherType(state),
    dfpLoggedIn: adServerSelectors.dfpLoggedIn(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginLink)