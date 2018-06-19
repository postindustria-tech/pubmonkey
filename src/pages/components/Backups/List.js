import React, { Component } from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import moment from 'moment'
import { BackupsTable } from './Table'
import { BaseLayout } from '../layouts'
import { RPCController, FileService } from '../../services'

export class BackupsList extends Component {
    state = {
        backups: []
    }

    constructor() {
        super()

        this.uploadFile = this.uploadFile.bind(this)
        this.removeBackup = this.removeBackup.bind(this)
        this.downloadBackup = this.downloadBackup.bind(this)
    }

    componentDidMount() {
        this.loadBackups()
    }

    loadBackups() {
        RPCController.getAllBackups()
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
                    disabled
                >
                    <i className="fa fa-file"/>&nbsp;New
                </Button>&nbsp;
                <Button
                    color="success"
                    onClick={ this.uploadFile }
                >
                    <i className="fa fa-cloud-upload"/>&nbsp;Load
                </Button>&nbsp;
                <BackupsTable
                    backups={ backups }
                    removeBackup={ this.removeBackup }
                    downloadBackup={ this.downloadBackup }
                />
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

    removeBackup(id) {
        RPCController.deleteBackup(id)
            .then(() => this.loadBackups())
    }

    downloadBackup(id) {
        RPCController.getBackupById(id)
            .then(backup => {
                FileService.saveFile(
                    JSON.stringify(backup, null, '  '),
                    backup.name.replace(/\s/g, '-') + moment().format('-MM-DD-YYYY-hh-mm')
                )
            })
    }
}
