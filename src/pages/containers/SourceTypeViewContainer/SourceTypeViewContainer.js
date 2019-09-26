import React, {PureComponent} from 'react';
import {connect} from "react-redux";
import {Button, Col, Row} from "reactstrap";
import adServerSelectors from '../../../redux/selectors/adServer';
import {AD_SERVER_DFP, AD_SERVER_MOPUB} from "../../constants/source";
import bind from "bind-decorator";
import adServerActions from "../../../redux/actions/adServer";
import AuthModal from "../../sources/dfp/AuthModal";
import Promise from "bluebird";

class SourceTypeViewContainer extends PureComponent {

    state = {
        networkCode: "",
        username: '',
        loggedIn: null
    };

    componentDidMount() {
        this.setNetworkCode();

        window.MopubAutomation.username
            .then(username => this.setState({username}));

        window.MopubAutomation.loggedIn
            .then(loggedIn => this.setState({loggedIn}));
    }

    componentDidUpdate(prevProps, prevState) {
        this.setNetworkCode();
    }

    setNetworkCode() {
        if (this.props.type === AD_SERVER_DFP) {
            const networkCode = this.props.networkCode || localStorage.getItem('dfpNetworkCode');
            this.setState({networkCode});
        }
    }

    render() {

        const {username, loggedIn} = this.state;

        return (
            <div className={"username"}>
                <AuthModal/>
                {this.props.type === AD_SERVER_DFP ? (
                    <div>
                        <a
                            href="#"
                            style={{color: "#ffffff"}}
                            onClick={this.changeNetworkCode}>Network
                            Code: {this.state.networkCode}</a> {this.props.dfpLoggedIn ?
                        (<a href="#" onClick={this.dfpLogOut}>Logout</a>) :
                        (<a href="#" onClick={this.dfpLogIn}>Login</a>)}
                    </div>
                ) : null}
                {this.props.type === AD_SERVER_MOPUB ?
                    loggedIn != null && loggedIn
                        ? (<a href="https://app.mopub.com/dashboard/" target="_blank">{username}</a>)
                        : (
                            <div className="login-link">Not logged in.&nbsp;
                                <a href="#" onClick={window.MopubAutomation.openLoginPage}>Log in.</a>
                            </div>
                        )
                    : null}
            </div>
        )
    }

    @bind
    changeNetworkCode() {
        this.props.dfpAuthModalToggle();
    }

    @bind
    dfpLogOut() {
        this.props.sourceHandler.removeCachedAuthToken();
        this.props.sourceHandler.clear();
        this.props.dfpLogOut();
        this.props.setDFPLoggedIn(false);
        localStorage.removeItem("dfpToken");
        // localStorage.removeItem("dfpNetworkCode");
        // this.setState({
        //     networkCode: ""
        // })
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
    dfpLogOut: adServerActions.dfpLogOut,
    setDFPLoggedIn: adServerActions.dfpLoggedIn,
    dfpAuthModalToggle: adServerActions.dfpAuthModalToggle
};

const mapStateToProps = state => ({
    type: adServerSelectors.switcherType(state),
    sourceHandler: adServerSelectors.sourceHandler(state),
    networkCode: adServerSelectors.networkCode(state),
    dfpLoggedIn: adServerSelectors.dfpLoggedIn(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(SourceTypeViewContainer)