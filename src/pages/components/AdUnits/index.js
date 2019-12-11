import React, { Component } from 'react'
import { Redirect } from 'react-router'
import { Table } from 'reactstrap'
import BaseLayout from '../layouts/BaseLayout'
import adServerSelectors from '../../../redux/selectors/adServer'
import adServerActions from '../../../redux/actions/adServer'
import {connect} from "react-redux";
import SourceFactory from "../../sources/Factory";

class AdUnitsList extends Component {
    state = {
        adunits: []
    };

    componentDidMount() {
        this.props.setSwitcher(this.props.type);
        this.initHandler();
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.type !== prevProps.type) {
            this.initHandler();
        }
    }

    initHandler() {
        this.sourceHandler = SourceFactory.getHandler(this.props.type);
    }

    render() {
        let { adunits = [] } = this.props;

        return (
            <BaseLayout
                className="adunits-list-layout"
            >

                <h2>Ad Units</h2>
                <p>
                    {[...new Set(adunits.map(u => u.appKey))].length} apps,
                    {adunits.length} ad units
                </p>
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
                                    <td><a target="_blank" href={this.getAdUnitUrl(key)}>{name}</a></td>
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

    getAdUnitUrl(key) {
        if (this.sourceHandler) {
            return this.sourceHandler.getAdUnitUrl(key);
        }
        return null;
    }
}

const mapDispatchToProps = {
    setSwitcher: adServerActions.setSwitcher
};

const mapStateToProps = state => ({
    adunits: adServerSelectors.adunits(state),
    type: adServerSelectors.switcherType(state),
});

export default connect(mapStateToProps, mapDispatchToProps)(AdUnitsList)