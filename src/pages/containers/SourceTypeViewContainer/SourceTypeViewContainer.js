import React, {PureComponent} from 'react';
import {connect} from "react-redux";
import adServerSelectors from '../../../redux/selectors/adServer';
import {AD_SERVER_ADMOB, AD_SERVER_DFP, AD_SERVER_MOPUB} from "../../constants/source";
import bind from "bind-decorator";
import adServerActions from "../../../redux/actions/adServer";
import AuthModal from "../../sources/dfp/AuthModal";
import Promise from "bluebird";
import LoginLink from "../../components/Common/LoginLink"
import LogoutLink from "../../components/Common/LogoutLink"

class SourceTypeViewContainer extends PureComponent {

    state = {
        networkCode: "",
        username: '',
        loggedIn: null
    };

    componentDidMount() {
        this.setNetworkCode();

        window.MopubAutomation.username
            .then(username => this.setState({ username }));

        window.MopubAutomation.loggedIn
            .then(loggedIn => this.setState({ loggedIn }));

        window.AdMobAutomation.username
            .then(username => this.setState({ username }));

        window.AdMobAutomation.loggedIn
            .then(loggedIn => this.setState({ loggedIn }));
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

        const { username, loggedIn } = this.state;

        return (
            <div className={"username"}>
                <AuthModal/>
                {this.props.type === AD_SERVER_DFP ? (
                    <div>
                        {this.props.dfpLoggedIn ?
                        (
                            <div className="dfp-login-link" style={{display: "inline-block"}}>
                                <a href="https://admanager.google.com/" target="_blank">Logged in.</a>&nbsp;
                                <LogoutLink style={{textDecoration: "underline"}}>
                                    Logout
                                </LogoutLink>
                            </div>
                        ) :
                        (
                            <div className="dfp-login-link" style={{display: "inline-block"}}>Not logged in.&nbsp;
                                <LoginLink style={{textDecoration: "underline"}}>
                                    Login
                                </LoginLink>
                            </div>
                        )}
                        <a
                            href="#"
                            style={{color: "#ffffff"}}
                            onClick={this.changeNetworkCode}>
                                Network Code: {this.state.networkCode}
                        </a>
                    </div>
                ) : null}
                {this.props.type === AD_SERVER_MOPUB ?
                    loggedIn != null && loggedIn
                        ? (
                            <div>
                                <a href="https://app.mopub.com/dashboard/" target="_blank">{ username }</a>
                                &nbsp;
                                <LogoutLink style={{textDecoration: "underline"}}>
                                    Logout
                                </LogoutLink>
                            </div>
                        )
                        : (
                            <div className="login-link">Not logged in.&nbsp;
                                <LoginLink style={{textDecoration: "underline"}}>
                                    Log in.
                                </LoginLink>
                            </div>
                        )
                    : null}
                {this.props.type === AD_SERVER_ADMOB ?
                    loggedIn != null && loggedIn
                        ? (
                            <div>
                                <a href="https://apps.admob.com/v2/home" target="_blank">{ username }</a>
                                &nbsp;
                                <LogoutLink style={{textDecoration: "underline"}}>
                                    Logout
                                </LogoutLink>
                            </div>
                        )
                        : (
                            <div className="login-link">Not logged in.&nbsp;
                                <LoginLink style={{textDecoration: "underline"}}>
                                    Log in.
                                </LoginLink>
                            </div>
                        )
                    : null}
            </div>
        )
    }

    @bind
    mopubLogOut() {
        this.props.sourceHandler.logout()
            .then(() => {
                window.location.reload();
            });
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
