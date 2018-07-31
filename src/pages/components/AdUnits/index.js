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
                            <th>AdUnit Name</th>
                            <th>Format</th>
                            <th>Key</th>
                            <th>Internal Id</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            adunits.map(({ name, format, id, key, appName}) =>(
                                <tr key={ id }>
                                    <td>{ appName }</td>
                                    <td>{ name }</td>
                                    <td>{ format }</td>
                                    <td>{ key }</td>
                                    <td>{ id }</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </Table>
            </BaseLayout>
        )
    }
}
