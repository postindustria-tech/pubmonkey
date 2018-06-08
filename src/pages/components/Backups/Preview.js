import React, { Component } from 'react'
import { Redirect } from 'react-router'
import { Button } from 'reactstrap'
import moment from 'moment'
import { BaseLayout } from '../layouts'
import { OrdersTable } from '../Orders'
import { FileService, RPCController } from '../../services'

export class BackupPreview extends Component {
    state = {
        backup: null,
        orders: []
    }

    componentDidMount() {
        if (FileService.lastLoaded) {
            let backup = JSON.parse(FileService.lastLoaded),
                { orders } = backup

            this.setState({
                backup, orders
            })
        } else {
            this.props.history.push('/orders')
        }
    }

    render() {
        let { backup, orders } = this.state

        if (backup == null) {
            return false
        }

        let { orderCount, lineItemCount, name, date } = backup

        return (
            <BaseLayout
                className="backup-preview-layout"
            >
                <h2>Backup Preview</h2>
                <div>name: { name }</div>
                <div>date: { moment(date).format('MM/DD/YYYY hh:mm') }</div>
                <div>orders: { orderCount }</div>
                <div>line-items: { lineItemCount }</div>
                <Button
                    color="primary"
                    onClick={ () => this.restoreSelected() }
                >
                    restore selected
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

    onOrdersListUpdate(orders) {
        this.setState({
            orders
        })
    }
}
