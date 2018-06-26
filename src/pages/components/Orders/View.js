import React, { Component } from 'react'
import { Button } from 'reactstrap'
import { BaseLayout } from '../layouts'
import { LineItemsTable } from '../LineItems'
import { FileService, RPCController } from '../../services'

export class OrderView extends Component {
    state = {
        order: null,
        lineItems: [],
        isDirty: false
    }

    constructor() {
        super()

        this.saveOrder = this.saveOrder.bind(this)
        this.updateOrder = this.updateOrder.bind(this)
        this.onLineItemsListUpdate = this.onLineItemsListUpdate.bind(this)
    }

    componentDidMount() {
        let { params: { key } } = this.props.match

        RPCController.getOrder(key)
            .then(order => this.setState({ order, lineItems: order.lineItems }))
    }

    render() {
        let { order, isDirty, lineItems } = this.state

        if (order == null) {
            return false
        }

        let { name, advertiser, description } = order

        return (
            <BaseLayout className="order-view-layout">
                <h2>Order View</h2>
                <div>name:
                    <input
                        className="form-control"
                        type="text"
                        defaultValue={ name }
                        onChange={ e => this.updateOrder({ name: e.target.value })}
                    />
                </div>
                <div>advertiser:
                    <input
                        className="form-control"
                        type="text"
                        defaultValue={ advertiser }
                        onChange={ e => this.updateOrder({ advertiser: e.target.value })}
                    />
                </div>
                <div>description:
                    <input
                        className="form-control"
                        type="text"
                        defaultValue={ description }
                        onChange={ e => this.updateOrder({ description: e.target.value })}
                    />
                </div>
                <Button
                    onClick={ this.saveOrder }
                    disabled={ !isDirty }
                >
                    <i className="fa fa-save"/>&nbsp;Save
                </Button>

                <LineItemsTable
                    lineItems={ lineItems }
                    allSelected={ true }
                    onUpdate={ this.onLineItemsListUpdate }
                />
            </BaseLayout>
        )
    }

    updateOrder(data) {
        let { order } = this.state

        Object.keys(data).forEach(key =>
            order[key] = data[key]
        )

        this.setState({
            order,
            isDirty: true
        }, () => this.forceUpdate())
    }

    saveOrder() {
        let { order: { name, advertiser, description, key } } = this.state

        RPCController.updateOrder({
                name, advertiser, description
            }, key).then(() =>
                this.setState({
                    isDirty: false
                })
            )
    }

    onLineItemsListUpdate(lineItems) {
        this.setState({
            lineItems
        })
    }
}
