import React, {PureComponent} from 'react'
import {Col, Row} from "reactstrap";
import adServerActions from '../../../redux/actions/adServer'
import adServerSelectors from '../../../redux/selectors/adServer'
import {connect} from "react-redux";
import {AD_SERVERS} from "../../constants/source";

class adServerSwitcherContainer extends PureComponent {

    handleAdServerChange = (type) => {
        this.props.setSwitcher(type)
    };

    render() {
        return (
            <Row className={"ad-server-switcher-wrapper"}>
                <Col className={"col-sm-12"}>
                {Object.keys(AD_SERVERS).map((option, index) => (
                    <div
                        key={index}
                        onClick={() => this.handleAdServerChange(option)}
                        className={`adserver-button ${this.props.type === option ? 'active' : ''}`}>{AD_SERVERS[option]}
                    </div>
                ))}
                </Col>
            </Row>
        )
    }
}

const mapDispatchToProps = {
    setSwitcher: adServerActions.setSwitcher
};

const mapStateToProps = state => ({
    type: adServerSelectors.switcherType(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(adServerSwitcherContainer)