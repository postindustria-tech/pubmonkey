import React, { Component } from 'react'
import { Button } from 'reactstrap'
import Select from 'react-select'
import bind from 'bind-decorator'
import { BaseLayout } from '../layouts'
import { LineItemsTable } from '../LineItems'
import { FileService, RPCController } from '../../services'
import { MainController, OrderController } from '../../controllers'
import { ProgressModal, LineItemEditModal } from '../Popups'

const
      FILTER_FN = [
          () => true,
          ({ status }) => status !== 'archived',
          ({ active }) => active,
          ({ status }) => status === 'paused',
          ({ status }) => status === 'archived'
      ],
      STATUS_OPTIONS = [
          { value: 0, label: 'all' },
          { value: 1, label: 'all except archived' },
          { value: 2, label: 'enabled' },
          { value: 3, label: 'paused' },
          { value: 4, label: 'archived' }
      ]

export class OrderView extends Component {
    state = {
        order: null,
        lineItems: [],
        isDirty: false,
        filter: 1,
        filterFn: FILTER_FN[1],
        progress: [],
        updates: []
    }

    componentDidMount() {
        this.loadOrder()
    }

    @bind
    loadOrder() {
        let { params: { key } } = this.props.match

        OrderController.getOrder(key)
            .then(order =>
                this.setState({
                    order,
                    lineItems: order.lineItems.map(item => ({ ...item, checked: true }))
                }, () => this.calcSelected())
            )
    }

    render() {
        let { order, isDirty, lineItems, filter, filterFn, progress, updates } = this.state

        if (order == null) {
            return false
        }

        let { name, advertiser, description } = order,
            selected = lineItems.filter(({ checked }) => checked)

        return (
            <BaseLayout className="order-view-layout">
                <h2>Order View</h2>
                <Button
                    onClick={ this.saveOrder }
                    disabled={ !isDirty }
                >
                    <i className="fa fa-save"/>&nbsp;Save
                </Button>
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

                <hr/>

                <Button
                    disabled={ !selected.length }
                    onClick={ () => this.enableSelected(true) }
                >
                    Enable
                </Button>&nbsp;
                <Button
                    disabled={ !selected.length }
                    onClick={ () => this.enableSelected(false) }
                >
                    Disable
                </Button>&nbsp;
                <Button
                    disabled={ !selected.length }
                    onClick={ this.archiveSelected }
                >
                    Archive/Unarchive
                </Button>&nbsp;
                <Button
                    disabled={ !selected.length }
                    onClick={ this.cloneSelected }
                >
                    Clone
                </Button>&nbsp;
                <Button
                    disabled={ !selected.length }
                    onClick={ () => this.setState({ updates: [true] }) }
                >
                    Edit
                </Button>
                <div className="list-filter">
                    show:<Select
                        multi={ false }
                        clearable={ false }
                        value={ filter }
                        options={ STATUS_OPTIONS }
                        onChange={ this.onFilterChange }
                    />
                </div>

                <LineItemsTable
                    lineItems={ lineItems }
                    allSelected={ true }
                    filter={ filterFn }
                    onUpdate={ this.onLineItemsListUpdate }
                />

                <ProgressModal
                    isOpen={ !!progress.length }
                    progress={ progress }
                    toggleModal={ this.hideProgressModal }
                    onCancel={ () => this.onProgressCancel && this.onProgressCancel() }
                />

                <LineItemEditModal
                    isOpen={ !!updates.length }
                    onUpdate={ this.onEditUpdate }
                    onCancel={ this.hideUpdateModal }
                />
            </BaseLayout>
        )
    }

    @bind
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

    @bind
    saveOrder() {
        let { order: { name, advertiser, description, key } } = this.state

        OrderController.updateOrder({
                name, advertiser, description
            }, key).then(() =>
                this.setState({
                    isDirty: false
                })
            )
    }

    @bind
    enableSelected(enabled) {
        let { selected } = this.state

        selected = selected.filter(({ active }) => enabled !== active)

        this.hideProgressModal()

        this.setState({
            progress: [{
                title: `line items: ${selected.length}`,
                progress: { value: 0 }
            }]
        })

        let promise = OrderController.updateLineItems(selected, { enabled }, ({ done, count }) => {
                this.setState({
                    progress: [{
                        title: `line items: ${done}/${count}`,
                        progress: { value: done / count *  100 }
                    }]
                })
            })
            .finally(() => {
                this.hideProgressModal()
                this.loadOrder()
            })

        this.onProgressCancel = () => promise.cancel('canceled by user')
    }

    @bind
    archiveSelected() {
        let { selected, filter } = this.state,
            status = filter === 4 ? 'play' : 'archive'

        this.hideProgressModal()

        this.setState({
            progress: [{
                title: `line items: ${selected.length}`,
                progress: { value: 0 }
            }]
        })

        let promise = OrderController.updateLineItemStatusInSet(selected, status, ({ done, count }) =>
                this.setState({
                    progress: [{
                        title: `line items: ${done}/${count}`,
                        progress: { value: done / count * 100 }
                    }]
                })
            )
            .finally(() => {
                this.hideProgressModal()
                this.loadOrder()
            })

        this.onProgressCancel = () => promise.cancel('canceled by user')
    }

    @bind
    cloneSelected() {
        let { selected } = this.state,
            promise

        this.hideProgressModal()

        this.setState({
            progress: [{
                title: `line items: ${selected.length}`,
                progress: { value: 0 }
            }]
        })

        promise = OrderController.cloneLineItems(selected, ({ done, count }) =>
                this.setState({
                    progress: [{
                        title: `line items: ${done}/${count}`,
                        progress: { value: done / count * 100 }
                    }]
                })
            )
            .finally(() => {
                this.hideProgressModal()
                this.loadOrder()
            })

        this.onProgressCancel = () => promise.cancel('canceled by user')
    }

    @bind
    editSelected(updates) {
        let { selected } = this.state,
            promise

        this.setState({
            progress: [{
                title: `line items: ${selected.length}`,
                progress: { value: 0 }
            }]
        })

        promise = OrderController.updateLineItems(selected, { 
                    [updates.field]: updates.value.single
                }, ({ done, count }) =>
                    this.setState({
                        progress: [{
                            title: `line items: ${done}/${count}`,
                            progress: { value: done / count * 100 }
                        }]
                    })
                )
                .finally(() => {
                    this.hideProgressModal()
                    this.loadOrder()
                })

        this.onProgressCancel = () => promise.cancel('canceled by user')
    }

    calcSelected() {
        let { filterFn, lineItems } = this.state,
            selected = lineItems
                .filter(filterFn)
                .filter(({ checked }) => checked)

        this.setState({
            selected
        })
    }

    @bind
    onEditUpdate(updates) {
        this.hideUpdateModal()
        this.editSelected(updates)
    }

    @bind
    onLineItemsListUpdate(lineItems) {
        this.setState({
            lineItems
        }, () => this.calcSelected())
    }

    @bind
    onFilterChange({ value: filter }) {
        this.setState({
            filter,
            filterFn: FILTER_FN[filter]
         })
    }

    @bind
    hideProgressModal() {
        this.setState({
            progress: []
        })
    }

    @bind
    hideUpdateModal() {
        this.setState({
            updates: []
        })
    }
}
