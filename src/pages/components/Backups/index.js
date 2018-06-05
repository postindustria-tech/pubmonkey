import React, { Component } from 'react'
import { Table, Button } from 'reactstrap'
import moment from 'moment'
import { RPCController, FileService } from '../../services'

export class Backups extends Component {
    state = {
        backups: []
    }

    componentDidMount() {
        RPCController.getBackups()
            .then(backups => this.setState({ backups }))
    }


    render() {
        let { backups } = this.state

        return (
            <div className="backups-layout">
                <div className="container">
                    <h2>Mopub backpack Backups</h2>
                    <Button
                        color="primary"
                        onClick={ this.uploadBackup }
                    >
                        <i className="fa fa-cloud-upload"/>&nbsp;
                        upload file
                    </Button>
                    <Table className="backups-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Date</th>
                                <th>Orders count</th>
                                <th>Line Items count</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                backups.map(({ name, date, ordersCount, lineItemsCount, id }) => (
                                    <tr key={ id }>
                                        <td>{ name }</td>
                                        <td>{ moment(date).format('MM/DD/YYYY hh:mm') }</td>
                                        <td>{ ordersCount }</td>
                                        <td>{ lineItemsCount }</td>
                                        <td>
                                            <i className="fa fa-arrow-circle-up"/>
                                            <i className="fa fa-cloud-download"/>
                                            <i className="fa fa-pencil"/>
                                            <i className="fa fa-remove"/>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </Table>
                </div>
            </div>
        )
    }

    uploadBackup() {
        FileService.openFile()
            .then(JSON.parse)
            .then(console.log)
    }
}
