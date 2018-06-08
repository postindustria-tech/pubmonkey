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

                        this.setState({ backup, orders })
                    } else {
                        history.push('/orders')
                    }
                })

            return
        }

        if (pathname.slice(0, 8) === '/backup/') {
            let { params: { date } } = this.props.match

            RPCController.getBackupByDate(date)
                .then(result => {
                    if (result.length) {
                        let backup = result[0],
                            { orders } = backup

                        this.setState({ backup, orders })
                    } else {
                        history.push('/backups')
                    }
                })
        }
    }

    componentWillUnmount() {
        RPCController.clearDraft()
    }

    render() {
        let { backup, orders } = this.state

        if (backup == null) {
            return false
        }

        let { orderCount, lineItemCount, name, date } = backup

        return (
            <BaseLayout
                className="backup-view-layout"
            >
                <h2>Backup View</h2>
                <div>name: <input type="text" ref="name" defaultValue={ name }/></div>
                <div>date: { moment(date).format('MM/DD/YYYY hh:mm') }</div>
                <div>orders: { orderCount }</div>
                <div>line-items: { lineItemCount }</div>
                <Button
                    color="primary"
                    onClick={ () => this.restoreSelected() }
                >
                    restore selected
                </Button>{ '  ' }
                <Button
                    color="secondary"
                    onClick={ () => this.saveBackup() }
                >
                    save to backpack
                </Button>
                <OrdersTable
                    orders={ orders }
                    allSelected={ true }
                    onUpdate={ orders => this.onOrdersListUpdate(orders) }
                />
            </BaseLayout>
        )
    }

    restoreSelected() {
        console.log('restore')
    }

    saveBackup() {
        let { backup } = this.state

        backup.name = this.refs.name.value

        RPCController.addBackup(backup)
            .then(() =>
                this.props.history.push('/backups')
            )
    }

    onOrdersListUpdate(orders) {
        this.setState({
            orders
        })
    }
}
