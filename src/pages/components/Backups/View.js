import React, { Component } from 'react'
import { Redirect } from 'react-router'
import { Button } from 'reactstrap'
import moment from 'moment'
import Promise from 'bluebird'
import { BaseLayout } from '../layouts'
import { OrdersTable } from '../Orders'
import { FileService, RPCController } from '../../services'
import { ProgressModal } from '../Popups'

export class BackupView extends Component {
    state = {
        backup: null,
        isExist: false,
        isDirty: false,
        orders: [],
        restoringInProgress: false,
        progress: 0
    }


    constructor() {
        super()

        this.toggleModal = this.toggleModal.bind(this)
    }

    componentDidMount() {
        let { history } = this.props,
            { location: { pathname } } = history

        if (pathname === '/backup/preview') {
            RPCController.getDraft()
                .then(draft => {
                    if (draft.length) {
                        let backup = JSON.parse(draft),
                            { orders } = backup

                        this.setState({ backup, orders, isExist: false })
                    } else {
                        history.push('/orders')
                    }
                })

            return
        }

        if (pathname.slice(0, 8) === '/backup/') {
            let { params: { id, key } } = this.props.match

            console.log(id, key)

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
        let { backup, orders, isExist, isDirty, restoringInProgress, progress } = this.state

        if (backup == null) {
            return false
        }

        let { orderCount, lineItemCount, name, created, updated } = backup

        return (
            <BaseLayout
                className="backup-view-layout"
            >
                <h2>Backup View</h2>
                <div>name:
                    <input
                        className="form-control"
                        type="text"
                        defaultValue={ name }
                        onChange={ e => this.updateBackup({ name: e.target.value })}
                    />
                </div>
                <div>created: { moment(created).format('MM/DD/YYYY hh:mm:ss') }</div>
                <div>updated: { moment(updated).format('MM/DD/YYYY hh:mm:ss') }</div>
                <div>orders: { orderCount }</div>
                <div>line-items: { lineItemCount }</div>
                <Button
                    onClick={ () => this.downloadBackup() }
                >
                    <i className="fa fa-cloud-download"/>
                </Button>
                <Button
                    onClick={ () => this.restoreSelected() }
                >
                    <i className="fa fa-arrow-circle-up"/>&nbsp;Restore
                </Button>
                <Button
                    onClick={ () => this.saveBackup() }
                    disabled={ !(!isExist || isDirty) }
                >
                    <i className="fa fa-save"/>&nbsp;Save
                </Button>
                <OrdersTable
                    orders={ orders }
                    allSelected={ true }
                    removeOrder={ true }
                    onUpdate={ orders => this.onOrdersListUpdate(orders) }
                />
                <ProgressModal
                    isOpen={ restoringInProgress }
                    progress={ progress }
                    toggleModal={ this.toggleModal }
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
        }, () => this.forceUpdate())
    }

    restoreSelected() {
        let { backup: { orders } } = this.state,
            step = 100 / this.state.backup.lineItemCount

        this.toggleModal()

        Promise.mapSeries(orders, order => {
            let lineItem = order.lineItems[0]

            return RPCController.restoreOrder(lineItem)
                .then(result => {
                    this.setState({ progress: this.state.progress + step })
                    return result
                })
                .then(({ redirect }) => redirect.replace(/.+\/(.+)\//,'$1'))
                .then(lineItemId => RPCController.getLineItemInfo(lineItemId))
                .then(({ orderKey }) => {
                    if (order.lineItems.length > 1) {
                        return Promise.mapSeries(order.lineItems.slice(1), lineItem =>
                            RPCController.restoreLineItem(lineItem, orderKey)
                                .then(result => {
                                    this.setState({ progress: this.state.progress + step })
                                    return result
                                })
                        )
                    }
                })
        })
        // .then(console.log)
        .then(() => this.toggleModal())
    }

    saveBackup() {
        let { backup, isExist } = this.state

        if (isExist) {
            RPCController.updateBackup(backup)
                .then(backup =>
                    this.setState({
                        backup,
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

    toggleModal() {
        this.setState({
            progress: 0,
            restoringInProgress: !this.state.restoringInProgress
        })
    }
}
