import React, { Component } from 'react'
import { Button } from 'reactstrap'
import Select from 'react-select'
import { BaseLayout } from '../layouts'
import { LineItemsTable } from '../LineItems'
import { FileService, RPCController } from '../../services'
import { MainController, OrderController } from '../../controllers'
import { ProgressModal } from '../Popups'

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
        progress: []
    }

    constructor() {
        super()

        this.saveOrder = this.saveOrder.bind(this)
        this.updateOrder = this.updateOrder.bind(this)
        this.onLineItemsListUpdate = this.onLineItemsListUpdate.bind(this)
        this.onFilterChange = this.onFilterChange.bind(this)
        this.archiveSelected = this.archiveSelected.bind(this)
        // this.enableSelected = this.enableSelected.bind(this)
        this.toggleModal = this.toggleModal.bind(this)
    }

    componentDidMount() {
        this.loadOrder()
        // let { params: { key } } = this.props.match
        //
        // MainController.getOrder(key)
        //     .then(order => this.setState({ order, lineItems: order.lineItems }))
    }

    loadOrder() {
        let { params: { key } } = this.props.match

        OrderController.getOrder(key)
            .then(order => this.setState({ order, lineItems: order.lineItems }))
    }

    render() {
        let { order, isDirty, lineItems, filter, filterFn, progress } = this.state

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
                    toggleModal={ this.toggleModal }
                    onCancel={ () => this.onProgressCancel && this.onProgressCancel() }
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

        MainController.updateOrder({
                name, advertiser, description
            }, key).then(() =>
                this.setState({
                    isDirty: false
                })
            )
    }

    enableSelected(enabled) {
        let { selected, filterFn } = this.state

        selected = selected.filter(filterFn)

        this.toggleModal()

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

        this.onProgressCancel = () => promise.cancel('canceled by user')

        promise
            .then(this.toggleModal)
            .then(this.loadOrder)
            .catch(thrown => {
                console.log(thrown)
                // if (axios.isCancel(thrown)) {
                    this.toggleModal()
                    this.loadOrder()
                // }
            })
    }

    archiveSelected() {
        let { selected, filterFn, filter } = this.state,
            status = filter === 4 ? 'play' : 'archive'

        selected = selected.filter(filterFn)

        this.toggleModal()

        this.setState({
            progress: [{
                title: `line items: ${selected.length}`,
                progress: { value: 0 }
            }]
        })

        let promise = OrderController.updateLineItemStatusInSet(selected, status, ({ done, count }) => {
                this.setState({
                    progress: [{
                        title: `line items: ${done}/${count}`,
                        progress: { value: done / count *  100 }
                    }]
                })
            })

        this.onProgressCancel = () => promise.cancel('canceled by user')

        promise
            .then(this.toggleModal)
            .then(this.loadOrder)
            .catch(thrown => {
                console.log(thrown)
                // if (axios.isCancel(thrown)) {
                    this.toggleModal()
                    this.loadOrder()
                // }
            })
    }

    onLineItemsListUpdate(lineItems) {
        this.setState({
            lineItems
        }, () => this.calcSelected())
    }

    calcSelected() {
        let selected = this.state.lineItems.filter(({ checked }) => checked)

        this.setState({
            selected
        })
    }

    onFilterChange({ value: filter }) {
        this.setState({
            filter,
            filterFn: FILTER_FN[filter]
         })
    }

    toggleModal() {
        this.setState({
            progress: []
        })
    }
}
