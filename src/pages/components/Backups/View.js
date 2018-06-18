import React, { Component } from 'react'
import { Redirect } from 'react-router'
import { Button } from 'reactstrap'
import moment from 'moment'
import { BaseLayout } from '../layouts'
import { OrdersTable } from '../Orders'
import { FileService, RPCController } from '../../services'

export class BackupView extends Component {
    state = {
        backup: null,
        isExist: false,
        isDirty: false,
        orders: []
    }

    componentDidMount() {
        let { history } = this.props,
            { location: { pathname } } = history

        if (pathname === '/backup/preview') {
            RPCController.getDraft()
                .then(draft => {
                    if (draft.length) {
                        let backup = JSON.parse(draft.pop()),
                            { orders } = backup

                        this.setState({ backup, orders, isExist: false })
                    } else {
                        history.push('/orders')
                    }
                })

            return
        }

        if (pathname.slice(0, 8) === '/backup/') {
            let { params: { id } } = this.props.match

            RPCController.getBackupById(Number(id))
                .then(backup => {
                    if (backup == null) {
                        throw 'no backup with id ' + id
                    }

                    let { orders } = backup

                    this.setState({ backup, orders, isExist: true })
                })
        }
    }

    componentWillUnmount() {
        RPCController.clearDraft()
    }

    render() {
        let { backup, orders, isExist, isDirty } = this.state

        if (backup == null) {
            return false
        }

        let { orderCount, lineItemCount, name, date } = backup

        return (
            <BaseLayout
                className="backup-view-layout"
            >
                <h2>Backup View</h2>
                <div>name:
                    <input
                        type="text"
                        ref="name"
                        defaultValue={ name }
                        onChange={ e => this.updateBackup({ name: e.target.value })}
                    />
                </div>
                <div>date: { moment(date).format('MM/DD/YYYY hh:mm') }</div>
                <div>orders: { orderCount }</div>
                <div>line-items: { lineItemCount }</div>
                <Button
                    onClick={ () => this.downloadBackup() }
                >
                    <i className="fa fa-cloud-download"/>
                </Button>&nbsp;
                <Button
                    onClick={ () => this.restoreSelected() }
                >
                    <i className="fa fa-arrow-circle-up"/>&nbsp;Restore
                </Button>&nbsp;
                <Button
                    onClick={ () => this.saveBackup() }
                    disabled={ !(!isExist || isDirty) }
                >
                    <i className="fa fa-save"/>&nbsp;Save
                </Button>
                <OrdersTable
                    orders={ orders }
                    allSelected={ true }
                    onUpdate={ orders => this.onOrdersListUpdate(orders) }
                />
            </BaseLayout>
        )
    }

    updateBackup(data) {
        let { backup } = this.state

        Object.keys(data).forEach(key =>
            backup[key] = data[key]
        )

        this.setState({
            backup,
            isDirty: true
        })
    }

    restoreSelected() {
        console.log('restore')
    }

    saveBackup() {
        let { backup, isExist } = this.state

        if (isExist) {
            RPCController.updateBackup(backup)
                .then(() =>
                    this.setState({
                        isDirty: false
                    })
                )
        } else {
            RPCController.createBackup(backup)
                .then(() =>
                    this.setState({
                        isExist: true,
                        isDirty: false
                    })
                )
        }
    }

    downloadBackup() {
        let { backup } = this.state

        backup.name = this.refs.name.value

        FileService.saveFile(
            JSON.stringify(backup, null, '  '),
            backup.name.replace(/\s/g, '-') + moment().format('-MM-DD-YYYY-hh-mm')
        )
    }

    onOrdersListUpdate(orders) {
        this.setState({
            orders
        })
    }
}
