import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Table, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import moment from 'moment'
import { BaseLayout } from '../layouts'
import { RPCController, FileService } from '../../services'

export class BackupsList extends Component {
    state = {
        backups: []
    }

    componentDidMount() {
        RPCController.getBackups()
            .then((backups = []) => this.setState({ backups }))
    }


    render() {
        let { backups } = this.state

        return (
            <BaseLayout
                className="backups-list-layout"
            >
                <h2>Backups List</h2>
                <Button
                    color="primary"
                    onClick={ this.uploadBackup }
                >
                    <i className="fa fa-cloud-upload"/>&nbsp;
                    upload file
                </Button>
                <Button
                    color="primary"
                    onClick={ this.toggleModal }
                >
                    show
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
                            backups.map(({ name, date, ordersCount, lineItemsCount }) => (
                                <tr key={ date }>
                                    <td>
                                        <Link to={ `/backup/${date}` }>{ name }</Link>
                                    </td>
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
            </BaseLayout>
        )
    }

    uploadBackup() {
        FileService.openFile()
            .then(JSON.parse)
            .then(console.log)
    }
}
