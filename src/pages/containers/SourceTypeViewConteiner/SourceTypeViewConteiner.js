import React, { PureComponent } from 'react';
import { connect } from "react-redux";
import {Button, Row} from "reactstrap";
import addServerSelectors from '../../../redux/selectors/adServer';
import {AD_SERVER_DFP, AD_SERVER_MOPUB} from "../../constants/source";

class SourceTypeViewConteiner extends PureComponent {

    state = {
        dfpNetworkCode: ""
    };

    componentDidMount() {
        const dfpNetworkCode = localStorage.getItem('dfpNetworkCode') || null;
        this.setState({dfpNetworkCode});
    }

    render() {
        return (
            <Row>
                {this.props.type === AD_SERVER_DFP ? (
                    <div>
                    Network Code: {this.state.dfpNetworkCode}
                    </div>
                ) : null}
                {this.props.type === AD_SERVER_MOPUB ? (
                    <div>
                        MoPub
                    </div>
                ) : null}
            </Row>
        )
    }
}


const mapStateToProps = state => ({
    type: addServerSelectors.switcherType(state)
});

export default connect(mapStateToProps)(SourceTypeViewConteiner)