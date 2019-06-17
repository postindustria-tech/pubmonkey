import React, { Component } from 'react'
import { Redirect } from 'react-router'
import { Table } from 'reactstrap'
import { BaseLayout } from '../layouts'

export class AdUnitsList extends Component {
    state = {
        adunits: []
    }

    componentDidMount() {
        window.MopubAutomation.adunits.then(adunits => this.setState({ adunits }))
    }

    render() {
        let { adunits } = this.state

        return (
            <BaseLayout
                className="adunits-list-layout"
            >
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
