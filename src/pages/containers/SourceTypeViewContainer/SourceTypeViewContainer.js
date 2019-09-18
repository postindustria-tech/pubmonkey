import React, { PureComponent } from 'react';
import { connect } from "react-redux";
import {Button, Col, Row} from "reactstrap";
import adServerSelectors from '../../../redux/selectors/adServer';
import {AD_SERVER_DFP, AD_SERVER_MOPUB} from "../../constants/source";
import bind from "bind-decorator";
import adServerActions from "../../../redux/actions/adServer";
import AuthModal from "../../sources/dfp/AuthModal";

class SourceTypeViewContainer extends PureComponent {

    state = {
        networkCode: ""
    };

    componentDidMount() {
        this.setNetworkCode();
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
        return (
            <Row>
                <AuthModal/>
                {this.props.type === AD_SERVER_DFP ? (
                    <div>
                        <a
                            href="#"
                            style={{color:"#ffffff"}}
                            onClick={this.changeNetworkCode}>Network Code: {this.state.networkCode}</a> {this.state.networkCode ?
                        (<a href="#" onClick={this.dfpLogOut}>Logout</a>) :
                        (<a href="#" onClick={this.dfpLogIn}>Login</a>)}
                    </div>
                ) : null}
                {this.props.type === AD_SERVER_MOPUB ? (
                    <div>MoPub</div>
                ) : null}
            </Row>
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
        localStorage.removeItem("dfpNetworkCode");
        this.setState({
            networkCode: ""
        })
    }

    @bind
    dfpLogIn() {
        this.props.dfpAuthModalToggle();
    }
}

const mapDispatchToProps = {
    dfpLogOut: adServerActions.dfpLogOut,
    dfpAuthModalToggle: adServerActions.dfpAuthModalToggle
};

const mapStateToProps = state => ({
    type: adServerSelectors.switcherType(state),
    sourceHandler: adServerSelectors.sourceHandler(state),
    networkCode: adServerSelectors.networkCode(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(SourceTypeViewContainer)