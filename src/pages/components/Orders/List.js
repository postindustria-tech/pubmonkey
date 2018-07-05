import React, { Component } from 'react'
import { Button } from 'reactstrap'
import Select from 'react-select'
import moment from 'moment'
import Promise from 'bluebird'
import axios from 'axios'
import sha256 from 'sha256'
import { OrdersTable } from './Table'
import { BaseLayout } from '../layouts'
import { FileService, RPCController } from '../../services'
import { MainController, OrderController } from '../../controllers'
import { ProgressModal } from '../Popups'

Promise.config({
    cancellation: true
})

const DELAY = 0,
      FILTER_FN = [
          () => true,
          ({ status }) => status === 'running',
          ({ status }) => status === 'archived'
      ]

export class OrdersList extends Component {
    state = {
        orders: [],
        progress: [],
        backupInProgress: false,
        selected: [],
        orderCount: 0,
        lineItemCount: 0,
        filter: 1,
        filterFn: FILTER_FN[1]
    }

    cancelToken = null

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

                <div className="list-filter">
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
                    onCancel={ () => this.onProgressCancel && this.onProgressCancel() }
                />
            </BaseLayout>
        )
    }

    loadOrders() {
        OrderController.getAllOrders()
            .then((orders = []) => this.setState({ orders }))
    }

    archiveSelected() {
        let { selected } = this.state,
            step = 100 / selected.length

        this.toggleModal()

        this.setState({
            progress: []
        })

        Promise.mapSeries(selected, ({ key, status }) =>
                OrderController.updateOrderStatus(
                    status === 'archived' ? 'running' : 'archived'
                , key).then(() => {
                    this.setState({ progress: [{
                        title: 'orders',
                        progress: { value: this.state.progress + step }
                    }] })
                })
            )
            .then(this.toggleModal)
            .then(this.loadOrders)
    }

    backupSelected() {
        let { orderCount, lineItemCount: total, selected } = this.state,
            name = 'default name',
            created = Date.now(),
            n = 0,
            average

        this.toggleModal()

        this.setState({
            progress: [{
                title: 'ordres:',
                progress: { value: 0 }
            }, {
                title: 'line items:',
                progress: { value: 0 }
            }]
        })

        let promise = OrderController.collectOrderDataFromSet(selected,
            ({ lineItemCount, lineItemsDone, orderCount, ordersDone, timestamp }) => {
                if (average == null) {
                    average = timestamp
                } else {
                    average = (average + timestamp) / 2
                }

                n++

                console.log()

                this.setState({
                    progress: [{
                        title: `ordres: ${ordersDone}/${orderCount}`,
                        progress: { value: ordersDone / orderCount * 100 }
                    }, {
                        title: `line items: ${lineItemsDone}/${lineItemCount}`,
                        progress: { value: lineItemsDone / lineItemCount * 100 }
                    }, {
                        title: `time remaining: ${moment(average * (total - n)).format('mm:ss')}`
                    }]
                })
            }
            )

        this.onProgressCancel = () => promise.cancel('canceled by user')

        promise
            .then(orders => ({
                name,
                orderCount,
                lineItemCount: total,
                created,
                orders,
                updated: null
            }))
            .then(result => {
                MainController.keepInDraft(JSON.stringify(result))
                this.toggleModal()
                this.props.history.push('/backup/preview')
            })
            .catch(thrown => {
                console.log(thrown)
                // if (axios.isCancel(thrown)) {
                    this.toggleModal()
                // }
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
            progress: [],
            backupInProgress: !this.state.backupInProgress
        })
    }
}
