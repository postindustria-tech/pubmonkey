import React, { Component } from 'react'
import { Redirect } from 'react-router'
import { Table } from 'reactstrap'
import BaseLayout from '../layouts/BaseLayout'
import adServerSelectors from '../../../redux/selectors/adServer'
import adServerActions from '../../../redux/actions/adServer'
import {connect} from "react-redux";
import SourceFactory from "../../sources/Factory";
import AdUnitsStats from './Stats'
import {FileService} from "../../services";
import classnames from "classnames";
import {AD_SERVER_DFP} from "../../constants/source";

class AdUnitsList extends Component {
    state = {
        adunits: [],
        exportInProgress: []
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
                <p><AdUnitsStats /></p>
                <Table className="adunits-table">
                    <thead>
                        <tr>
                            <th>App Name</th>
                            <th>Ad Unit Name</th>
                            <th>Format</th>
                            <th>Ad Unit ID</th>
                            {this.props.type !== AD_SERVER_DFP && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {
                            adunits.map(adunit =>(
                                <tr key={ adunit.key }>
                                    <td>{ adunit.appName }</td>
                                    <td><a target="_blank" href={this.getAdUnitUrl(adunit.key)}>{adunit.name}</a></td>
                                    <td>{ adunit.format }</td>
                                    <td>{ adunit.key }</td>
                                    {this.state.exportInProgress.includes(adunit.key) && <td><i className="fa fa-spinner fa-spin" aria-hidden="true"></i></td>}
                                    {this.props.type !== AD_SERVER_DFP && !this.state.exportInProgress.includes(adunit.key) && <td>
                                        <i className={classnames("fa", "fa-download")} title={"Export ad sources"} onClick={() => this.export(adunit)}></i>
                                    </td>}
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

    export(adUnit) {
        if (this.sourceHandler) {
            let exportInProgress = this.state.exportInProgress
            exportInProgress.push(adUnit.key)
            this.setState({exportInProgress: exportInProgress})

            this.sourceHandler.getAdUnit(adUnit.key).then((adUnit) => {
                let data = adUnit.adSources.map(adSource => {

                    let type = adSource.type
                    if(type == 'non_gtee'){
                        type = 'Non-guaranteed'
                    }else if(type == 'gtee'){
                        type = 'Guaranteed'
                    }

                    return [
                        adSource.name,
                        type,
                        adSource.status,
                        adSource.disabled ? 'disabled' : 'enabled',
                        adSource.priority,
                        adSource.bid,
                        adSource.start,
                        adSource.end,
                        adSource.budgetType
                    ].join(',')
                })
                data.unshift([
                    'Name',
                    'Type',
                    'Status',
                    'Disabled/Enabled',
                    'Priority',
                    'Bid',
                    'Start',
                    'End',
                    'Budget Type'
                ])

                FileService.saveFile(data.join('\n'), `${adUnit.name}.csv`);
                this.setState({exportInProgress: this.state.exportInProgress.filter(key => key != adUnit.key)})
            })
        }
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