import React, { Component } from 'react'
import moment from 'moment'
import { FileService, RPCController } from '../services'

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
            <div className="orders">
                <button
                    onClick={ this.backupSelected }
                >backup selected</button>
                <table>
                    <thead>
                        <tr>
                            <th><input type="checkbox" onClick={ this.selectAll } /></th>
                            <th>name</th>
                            <th>advertiser</th>
                            <th>line items</th>
                        </tr>
                    </thead>
                    <tbody>
                        { orders.map(({ name, advertiser, lineItemCount, key, checked = false }) => (
                            <tr key={ key } className="order">
                                <td>
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
                </table>
            </div>
        )
    }

    backupSelected() {
        let { orders } = this.state

        return Promise.all(
            orders.filter(({ checked }) => checked)
                .map(({ key }) => this.collectOrderData(key))
        ).then(result => FileService.saveFile(result, 'backup-' + moment().format('MM-DD-YYYY')))
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
