import React, {Component} from "react";
import {connect} from 'react-redux'
import adServerSelectors from "../../../redux/selectors/adServer";

class AdUnitsStats extends Component {

    render() {
        if(!this.props.adunits){
            return (<React.Fragment></React.Fragment>)
        }
        const apps = [...new Set(this.props.adunits.map(u => u.appKey))].length
        const length = this.props.adunits.length
        return (
            <React.Fragment>
                {apps} apps, {length} ad units
            </React.Fragment>
        )
    }
}



const mapDispatchToProps = {
};

const mapStateToProps = state => ({
    adunits: adServerSelectors.adunits(state),
});

export default connect(mapStateToProps, mapDispatchToProps)(AdUnitsStats)