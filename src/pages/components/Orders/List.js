import React, { Component } from 'react'
import { Button } from 'reactstrap'
import Select from 'react-select'
import moment from 'moment'
import bind from 'bind-decorator'
import sha256 from 'sha256'
import { OrdersTable } from './Table'
import { BaseLayout } from '../layouts'
import { FileService, RPCController } from '../../services'
import { MainController, OrderController } from '../../controllers'
import { ProgressModal } from '../Popups'

const
      FILTER_FN = [
          () => true,
          ({ status }) => status === 'running',
          ({ status }) => status === 'archived'
      ],
      STATUS_OPTIONS = [
          { value: 0, label: 'all' },
          { value: 1, label: 'running' },
          { value: 2, label: 'archived' }
      ]

export class OrdersList extends Component {
    state = {
        orders: [],
        progress: [],
        selected: [],
        orderCount: 0,
        lineItemCount: 0,
        filter: 1,
        filterFn: FILTER_FN[1]
    }

    cancelToken = null

    componentDidMount() {
        this.loadOrders()
    }

    render() {
        let { orders, progress, orderCount, lineItemCount, filter, filterFn } = this.state

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
                        options={ STATUS_OPTIONS }
                        onChange={ this.onFilterChange }
                    />
                </div>

                <OrdersTable
                    orders={ orders }
                    filter={ filterFn }
                    onUpdate={ this.onOrdersListUpdate }
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

    @bind
    loadOrders() {
        OrderController.getAllOrders()
            .then((orders = []) => this.setState({ orders }))
    }

    @bind
    archiveSelected() {
        let { selected, filter, filterFn } = this.state,
            status = filter === 2 ? 'running' : 'archived'

        selected = selected.filter(filterFn)

        this.toggleModal()

        this.setState({
            progress: [{
                title: `orders: ${selected.length}`,
                progress: { value: 0 }
            }]
        })

        let promise = OrderController.updateOrderStatusInSet(selected, status, ({ count, done }) => {
                this.setState({
                    progress: [{
                        title: `orders: ${done}/${count}`,
                        progress: { value: done / count * 100}
                    }]
                })
            })

        this.onProgressCancel = () => promise.cancel('canceled by user')

        promise
            .then(this.toggleModal)
            .then(this.loadOrders)
            .catch(thrown => {
                console.log(thrown)
                // if (axios.isCancel(thrown)) {
                    this.toggleModal()
                    this.loadOrders()
                // }
            })
    }

    @bind
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

    @bind
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

    @bind
    onFilterChange({ value: filter }) {
        this.setState({
            filter,
            filterFn: FILTER_FN[filter]
         })
    }

    @bind
    toggleModal() {
        this.setState({
            progress: []
        })
    }
}
