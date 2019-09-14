import React, { PureComponent } from 'react';
import { connect } from "react-redux";
import {Button, Row} from "reactstrap";
import adServerSelectors from '../../../redux/selectors/adServer';
import {AD_SERVER_DFP, AD_SERVER_MOPUB} from "../../constants/source";

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
        const networkCode = this.props.networkCode || localStorage.getItem('dfpNetworkCode');
        this.setState({networkCode});
    }

    render() {
        return (
            <Row>
                {this.props.type === AD_SERVER_DFP ? (
                    <div>Network Code: {this.state.networkCode}</div>
                ) : null}
                {this.props.type === AD_SERVER_MOPUB ? (
                    <div>MoPub</div>
                ) : null}
            </Row>
        )
    }
}

const mapStateToProps = state => ({
    type: adServerSelectors.switcherType(state),
    networkCode: adServerSelectors.networkCode(state)
});

export default connect(mapStateToProps)(SourceTypeViewContainer)