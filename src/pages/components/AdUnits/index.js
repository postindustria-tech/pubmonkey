import React, { Component } from 'react'
import { Redirect } from 'react-router'
import { Table } from 'reactstrap'
import BaseLayout from '../layouts/BaseLayout'
import AdServerSwitcherContainer from "../../containers/adServerSwitcherContainer/adServerSwitcherContainer";
import adServerSelectors from '../../../redux/selectors/adServer'
import addServerActions from '../../../redux/actions/adServer'
import {connect} from "react-redux";

class AdUnitsList extends Component {
    state = {
        adunits: []
    };

    componentDidMount() {
        this.props.setSwitcher(this.props.type)
    }

    render() {
        let { adunits } = this.props;

        return (
            <BaseLayout
                className="adunits-list-layout"
            >

                <AdServerSwitcherContainer />

                <h2>Ad Units</h2>
                <Table className="adunits-table">
                    <thead>
                        <tr>
                            <th>App Name</th>
                            <th>Ad Unit Name</th>
                            <th>Format</th>
                            <th>Ad Unit ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            adunits.map(({ name, format, key, appName}) =>(
                                <tr key={ key }>
                                    <td>{ appName }</td>
                                    <td><a target="_blank" href={ `https://app.mopub.com/ad-unit?key=${key}` }>{ name }</a></td>
                                    <td>{ format }</td>
                                    <td>{ key }</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </Table>
            </BaseLayout>
        )
    }
}

const mapDispatchToProps = {
    setSwitcher: addServerActions.setSwitcher
};

const mapStateToProps = state => ({
    adunits: adServerSelectors.adunits(state),
    type: adServerSelectors.switcherType(state),
});

export default connect(mapStateToProps, mapDispatchToProps)(AdUnitsList)