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

    constructor() {
        super()

        this.uploadFile = this.uploadFile.bind(this)
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
                    color="success"
                    onClick={ this.uploadFile }
                >
                    <i className="fa fa-cloud-upload"/>&nbsp;
                    upload file
                </Button>{ '  ' }
                {/* <Button
                    color="primary"
                    onClick={ this.toggleModal }
                >
                    show
                </Button> */}
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
                            backups.map(({ name, date, orderCount, lineItemCount }) => (
                                <tr key={ date }>
                                    <td>
                                        <Link to={ `/backup/${date}` }>{ name }</Link>
                                    </td>
                                    <td>{ moment(date).format('MM/DD/YYYY hh:mm') }</td>
                                    <td>{ orderCount }</td>
                                    <td>{ lineItemCount }</td>
                                    <td>
                                        <i className="fa fa-arrow-circle-up"/>
                                        <i className="fa fa-cloud-download"/>
                                        <i className="fa fa-pencil"/>
                                        <i className="fa fa-remove"
                                            onClick={ () =>
                                                RPCController.removeBackup(date)
                                                    .then(() => this.forceUpdate())
                                            }
                                        />
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </Table>
            </BaseLayout>
        )
    }

    uploadFile() {
        FileService.openFile()
            .then(result => {
                if (result) {
                    RPCController.keepInDraft(result)
                        .then(() =>
                            this.props.history.push('/backup/preview')
                        )
                }
            })
    }
}
