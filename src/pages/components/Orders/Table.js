import React, { Component } from 'react'
import { Table } from 'reactstrap'

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
        let { orders = [] } = this.props,
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
                    </tr>
                </thead>
                <tbody>
                    { orders.map(({ name, advertiser, lineItemCount, key, checked = false }) => (
                        <tr key={ key } className="order">
                            <td className="select">
                                <input
                                    type="checkbox"
                                    checked={ checked }
                                    onChange={ () => this.toggleItem(key) }
                                />
                            </td>
                            <td>{ name }</td>
                            <td>{ advertiser }</td>
                            <td>{ lineItemCount }</td>
                        </tr>
                    )) }
                </tbody>
            </Table>
        )
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
        let { orders, onUpdate } = this.props

        onUpdate(
            orders.map(order => {
                let { checked, key } = order

                if (key === _key) {
                    order.checked = !order.checked
                }

                return order
            })
        )
    }
}
