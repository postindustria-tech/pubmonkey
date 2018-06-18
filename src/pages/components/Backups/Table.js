import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Table } from 'reactstrap'
import moment from 'moment'

export class BackupsTable extends Component {
    render() {
        let { backups = [], removeBackup, downloadBackup } = this.props

        return (
            <Table className="backups-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Orders count</th>
                        <th>Line Items count</th>
                        <th>Created</th>
                        <th>Updated</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        backups.map(({ name, created, id, updated, orderCount, lineItemCount }) => (
                            <tr key={ id }>
                                <td>
                                    <Link to={ `/backup/${id}` }>{ name }</Link>
                                </td>
                                <td>{ orderCount }</td>
                                <td>{ lineItemCount }</td>
                                <td>{ moment(created).format('MM/DD/YYYY hh:mm') }</td>
                                <td>{ updated ? moment(updated).format('MM/DD/YYYY hh:mm') : 'never' }</td>
                                <td className="action">
                                    {/* <i className="fa fa-arrow-circle-up"/> */}
                                    <i className="fa fa-cloud-download"
                                        onClick={ () => downloadBackup(id) }
                                    />
                                    {/* <i className="fa fa-pencil"/> */}
                                    <i className="fa fa-remove"
                                        onClick={ () => removeBackup(id) }
                                    />
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </Table>
        )
    }
}
