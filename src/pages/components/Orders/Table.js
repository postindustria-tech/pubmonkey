import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Table } from 'reactstrap'
import { OrderController } from '../../controllers'

export class OrdersTable extends Component {
    state = {
        allSelected: false
    }

    componentDidMount() {
        if (this.props.allSelected) {
            this.toggleAll(true)
        }
    }

    render() {
        let { orders = [], filter = () => true } = this.props,
            { allSelected } = this.state

        return (
            <Table className="orders-table">
                <thead>
                    <tr>
                        <th className="select select-all">
                            <input
                                type="checkbox"
                                onChange={ e => this.toggleAll(e.target.checked) }
                                checked={ allSelected }
                            />
                        </th>
                        <th>name</th>
                        <th>advertiser</th>
                        <th>line items</th>
                        <th>status</th>
                        <th>actions</th>
                    </tr>
                </thead>
                <tbody>
                    { orders
                        .filter(filter)
                        .map(({ name, status, advertiser, lineItemCount, key, checked = false }) => (
                            <tr key={ key } className="order">
                                <td className="select">
                                    <input
                                        type="checkbox"
                                        checked={ checked }
                                        onChange={ () => this.toggleItem(key) }
                                    />
                                </td>
                                <td><a target="_blank" href={ `https://app.mopub.com/order?key=${key}` }>{ name }</a></td>
                                {/* <td><Link to={ `/order/${key}` }>{ name }</Link></td> */}
                                <td>{ advertiser }</td>
                                <td>{ lineItemCount }</td>
                                <td>{ status }</td>
                                <td className="actions">
                                    <i className="fa fa-archive"
                                        title={ status === 'archived' ? 'Unarchive' : 'Archive'}
                                        style={{ color: status === 'archived' ? '#ffad1f' : '#ccc' }}
                                        onClick={ () => this.archive(status, key) }
                                    ></i>
                                </td>
                            </tr>
                        )) }
                </tbody>
            </Table>
        )
    }

    archive(status, key) {
        let { onUpdate, orders } = this.props

        status = status === 'archived' ? 'running' : 'archived'

        OrderController.updateOrderStatus(status, key)
            .then(() => {
                onUpdate(
                    orders.map(order => {
                        if (order.key === key) {
                            order.status = status
                        }
                        return order
                    })
                )
            })
    }

    toggleAll(checked) {
        let { orders, onUpdate } = this.props

        this.setState({
            allSelected: checked
        })

        onUpdate(
            orders.map(order => {
                order.checked = checked
                return order
            })
        )
    }

    toggleItem(_key) {
        let { orders, onUpdate, filter = () => true } = this.props

        onUpdate(
            orders
                .filter(filter)
                .map(order => {
                    let { checked, key } = order

                    if (key === _key) {
                        order.checked = !order.checked
                    }

                    return order
                })
        )
    }
}
