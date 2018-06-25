import React, { Component } from 'react'
import { Button } from 'reactstrap'
import Select from 'react-select'
import moment from 'moment'
import Promise from 'bluebird'
import sha256 from 'sha256'
import { OrdersTable } from './Table'
import { BaseLayout } from '../layouts'
import { FileService, RPCController } from '../../services'
import { ProgressModal } from '../Popups'

const DELAY = 0,
      FILTER_FN = [
          () => true,
          ({ status }) => status === 'running',
          ({ status }) => status === 'archived'
      ]

export class OrdersList extends Component {
    state = {
        orders: [],
        progress: 0,
        backupInProgress: false,
        selected: [],
        orderCount: 0,
        lineItemCount: 0,
        filter: 1,
        filterFn: FILTER_FN[1]
    }

    constructor() {
        super()
        this.backupSelected = this.backupSelected.bind(this)
        this.archiveSelected = this.archiveSelected.bind(this)
        this.onFilterChange = this.onFilterChange.bind(this)
        this.loadOrders = this.loadOrders.bind(this)
        this.toggleModal = this.toggleModal.bind(this)
        this.onOrdersListUpdate = this.onOrdersListUpdate.bind(this)
    }

    componentDidMount() {
        this.loadOrders()
    }

    render() {
        let { orders, progress, backupInProgress, orderCount, lineItemCount, filter, filterFn } = this.state

        return (
            <BaseLayout
                 className="orders-list-layout"
            >
                <h2>Orders List</h2>
                <Button
                    color="primary"
                    onClick={ this.backupSelected }
                    disabled={ !orderCount }
                >
                    Create Backup
                </Button>
                <Button
                    color="primary"
                    onClick={ this.archiveSelected }
                    disabled={ !orderCount }
                >
                    Archive/Unarchive
                </Button>

                <div>
                    show:<Select
                        multi={ false }
                        clearable={ false }
                        value={ filter }
                        options={ [
                            { value: 0, label: 'all' },
                            { value: 1, label: 'running' },
                            { value: 2, label: 'archived' }
                        ] }
                        onChange={ this.onFilterChange }
                    />
                </div>

                <OrdersTable
                    orders={ orders }
                    filter={ filterFn }
                    onUpdate={ this.onOrdersListUpdate }
                />

                <ProgressModal
                    isOpen={ backupInProgress }
                    progress={ progress }
                    toggleModal={ this.toggleModal }
                />
            </BaseLayout>
        )
    }

    loadOrders() {
        RPCController.getAllOrders()
            .then((orders = []) => this.setState({ orders }))
    }

    archiveSelected() {
        let { selected } = this.state,
            step = 100 / selected.length

        this.toggleModal()

        Promise.mapSeries(selected, ({ key, status }) =>
                RPCController.updateOrder({
                    status: status === 'archived' ? 'running' : 'archived'
                }, key).then(() => {
                    this.setState({ progress: this.state.progress + step })
                })
            )
            .then(this.toggleModal)
            .then(this.loadOrders)
    }

    backupSelected() {
        let { orderCount, lineItemCount, selected } = this.state,
            name = 'default name',
            created = Date.now()

        this.toggleModal()

        Promise.mapSeries(selected, ({ key }) =>
                Promise.delay(DELAY, this.collectOrderData(key))
            )
            .then(orders => ({
                name,
                orderCount,
                lineItemCount,
                created,
                orders,
                updated: null
            }))
            .then(result => {
                RPCController.keepInDraft(JSON.stringify(result))
                this.toggleModal()
                this.props.history.push('/backup/preview')
            })
    }

    collectOrderData(id) {
        let step = 100 / this.state.lineItemCount

        return RPCController.getOrder(id)
            .then(order => {
                let { lineItems } = order

                return Promise.mapSeries(lineItems, ({ key }) =>
                        Promise.delay(DELAY, RPCController.getLineItem(key)
                            .then(result => {
                                this.setState({ progress: this.state.progress + step })
                                return result
                            })
                        )
                    ).then(lineItems => ({ ...order, lineItems }))
            })
    }

    onOrdersListUpdate(orders) {
        this.setState({
            orders
        }, () => this.calcSelected())
    }

    calcSelected() {
        let selected = this.state.orders.filter(({ checked }) => checked)

        this.setState({
            orderCount: selected.length,
            lineItemCount: selected.reduce((sum, { lineItemCount }) => sum + lineItemCount, 0),
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
            progress: 0,
            backupInProgress: !this.state.backupInProgress
        })
    }
}
