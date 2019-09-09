import React, { Component } from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import moment from 'moment'
import bind from 'bind-decorator'
import { BackupsTable } from './Table'
import BaseLayout from "../layouts/BaseLayout";
import { FileService } from '../../services'
import { MainController } from '../../controllers'

export class BackupsList extends Component {
    state = {
        backups: []
    }

    componentDidMount() {
        this.loadBackups()
    }

    loadBackups() {
        MainController.getAllBackups()
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
                </Button>
                <Button
                    color="success"
                    onClick={ this.uploadFile }
                >
                    <i className="fa fa-cloud-upload"/>&nbsp;Load
                </Button>
                <BackupsTable
                    backups={ backups }
                    removeBackup={ this.removeBackup }
                    downloadBackup={ this.downloadBackup }
                />
            </BaseLayout>
        )
    }

    @bind
    uploadFile() {
        FileService.openFile()
            .then(result => {
                if (result) {
                    MainController.keepInDraft(result)
                        .then(() =>
                            this.props.history.push('/backup/preview')
                        )
                }
            })
    }

    @bind
    removeBackup(id) {
        MainController.deleteBackup(id)
            .then(() => this.loadBackups())
    }

    @bind
    downloadBackup(id) {
        MainController.getBackupById(id)
            .then(backup => {
                FileService.saveFile(
                    JSON.stringify(backup, null, '  '),
                    backup.name.replace(/\s/g, '-') + moment().format('-MM-DD-YYYY-hh-mm')
                )
            })
    }
}
