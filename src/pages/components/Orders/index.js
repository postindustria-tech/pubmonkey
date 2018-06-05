import React, { Component } from 'react'
import { Table, Button } from 'reactstrap'
import moment from 'moment'
import sha256 from 'sha256'
import { FileService, RPCController } from '../../services'

export class Orders extends Component {
    state = {
        orders: []
    }

    constructor() {
        super()
        this.selectAll = this.selectAll.bind(this)
        this.backupSelected = this.backupSelected.bind(this)
    }

    componentDidMount() {
        RPCController.getAllOrders()
            .then(orders => this.setState({ orders }))
    }

    render() {
        let { orders } = this.state

        return (
            <div className="orders-layout">
                <div className="container">
                    <Button
                        color="primary"
                        onClick={ this.backupSelected }
                    >backup selected</Button>
                    <Table className="orders-table">
                        <thead>
                            <tr>
                                <th className="select select-all">
                                    <input type="checkbox" onClick={ this.selectAll } />
                                </th>
                                <th>name</th>
                                <th>advertiser</th>
                                <th>line items</th>
                            </tr>
                        </thead>
                        <tbody>
                            { orders.map(({ name, advertiser, lineItemCount, key, checked = false }) => (
                                <tr key={ key } className="order">
                                    <td className="select">
                                        <input
                                            type="checkbox"
                                            checked={ checked }
                                            onClick={ () => this.selectItem(key) }
                                        />
                                    </td>
                                    <td>{ name }</td>
                                    <td>{ advertiser }</td>
                                    <td>{ lineItemCount }</td>
                                </tr>
                            )) }
                        </tbody>
                    </Table>
                </div>
            </div>
        )
    }

    backupSelected() {
        let { orders } = this.state

        return Promise.all(
            orders.filter(({ checked }) => checked)
                .map(({ key }) => this.collectOrderData(key))
            )
            .then(data => RPCController.addBackup({
                name: 'backup-' + moment().format('MM-DD-YYYY hh:mm'),
                id: sha256(Date.now()),
                date: Date.now(),
                ordersCount: 0,
                lineItemsCount: 0,
                data
            }))
            .then(() => this.props.history.push('/backups'))
            // .then(result =>
            //     FileService.saveFile(result, 'backup-' + moment().format('MM-DD-YYYY'))
            // )
    }

    collectOrderData(id) {
        return RPCController.getOrder(id)
            .then((order) => {
                let { lineItems } = order

                return Promise.all(
                        lineItems.map(({ key }) => RPCController.getLineItem(key))
                    ).then(lineItems => ({ ...order, lineItems }))
            })
    }

    selectAll(e) {
        let { orders } = this.state,
            { checked } = e.target

        this.setState({
            orders: orders.map(order => ({ ...order, checked }))
        })
    }

    selectItem(_key) {
        let { orders } = this.state

        this.setState({
            orders: orders.map(order => {
                let { checked, key } = order

                if (key === _key) {
                    return { ...order, checked: !checked }
                }

                return order
            })
        })
    }
}
