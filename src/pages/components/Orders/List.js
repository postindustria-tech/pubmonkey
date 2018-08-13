import React, { Component } from 'react'
import { Button } from 'reactstrap'
import Select from 'react-select'
import moment from 'moment'
import bind from 'bind-decorator'
import sha256 from 'sha256'
import { OrdersTable } from './Table'
import { BaseLayout } from '../layouts'
import { FileService, RPCController, ModalWindowService } from '../../services'
import { MainController, OrderController } from '../../controllers'

const
      FILTER_FN = [
          ({ status }) => status !== 'archived',
          ({ status }) => status === 'running',
          ({ status }) => status === 'paused',
          ({ status }) => status === 'archived'
      ],
      STATUS_OPTIONS = [
          { value: 0, label: 'all except archived' },
          { value: 1, label: 'running' },
          { value: 2, label: 'paused' },
          { value: 3, label: 'archived' }
      ]

export class OrdersList extends Component {
    state = {
        orders: [],
        selected: [],
        orderCount: 0,
        lineItemCount: 0,
        filter: 0,
        filterFn: FILTER_FN[0]
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
                <h2>Orders</h2>
                <Button
                    color="primary"
                    onClick={ this.exportSelected }
                    // onClick={ this.backupSelected }
                    disabled={ !orderCount }
                >
                    <i className="fa fa-cloud-download"></i>&nbsp;
                    Export
                </Button>
                <Button
                    color="primary"
                    onClick={ this.importSelected }
                >
                    <i className="fa fa-cloud-upload"></i>&nbsp;
                    Import
                </Button>
                {/* <Button
                    color="primary"
                    onClick={ this.backupSelected }
                    disabled={ !orderCount }
                >
                    Create Backup
                </Button> */}
                {/* <Button
                    color="primary"
                    onClick={ this.archiveSelected }
                    disabled={ !orderCount }
                >
                    Archive/Unarchive
                </Button> */}

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
            </BaseLayout>
        )
    }

    @bind
    importSelected() {
        FileService.openFile()
            .then(result => {
                if (result) {
                    let { orders } = JSON.parse(result),
                        total = orders.reduce((sum, { lineItems }) => sum + lineItems.length, 0),
                        n = 0,
                        average

                    ModalWindowService.ProgressModal.setProgress([{
                            title: 'orders:',
                            progress: { value: 0 }
                        }, {
                            title: 'line items:',
                            progress: { value: 0 }
                        }
                    ])

                    let promise = OrderController.restoreOrdersWithLineItems(orders,
                        ({ lineItemCount, lineItemsDone, orderCount, ordersDone, timestamp }) => {
                            if (average == null) {
                                average = timestamp
                            } else {
                                average = (average + timestamp) / 2
                            }

                            n++

                            ModalWindowService.ProgressModal.setProgress([
                                {
                                    title: `orders: ${ordersDone}/${orderCount}`,
                                    progress: { value: ordersDone / orderCount * 100 }
                                }, {
                                    title: `line items: ${lineItemsDone}/${lineItemCount}`,
                                    progress: { value: lineItemsDone / lineItemCount * 100 }
                                }, {
                                   title: `time remaining: ${moment(average * (total - n)).format('mm:ss')}`
                                }
                            ])
                    })
                    .catch(err => {
                        let { errors } = err.response.data,
                            fields = Object.keys(errors)

                        ModalWindowService.ErrorPopup.showMessage(
                            fields.map((field, idx) => (<div key={ idx }><strong>{ field }:</strong>&nbsp;{ errors[field] }</div>))
                        )
                    })
                    .finally(() => {
                        this.loadOrders()
                        ModalWindowService.ProgressModal.hideModal()
                    })

                    ModalWindowService.ProgressModal.onCancel(() => promise.cancel('canceled by user'))
                }
            })
    }

    @bind
    exportSelected() {
        let { orderCount, lineItemCount: total, selected } = this.state,
            name = 'default name',
            created = Date.now(),
            n = 0,
            average

        if (selected.length === 1) {
            name = selected[0].name
        }

        ModalWindowService.ProgressModal.setProgress([
            {
                title: 'orders:',
                progress: { value: 0 }
            }, {
                title: 'line items:',
                progress: { value: 0 }
            }
        ])

        let promise = OrderController.collectOrderDataFromSet(selected,
            ({ lineItemCount, lineItemsDone, orderCount, ordersDone, timestamp }) => {
                if (average == null) {
                    average = timestamp
                } else {
                    average = (average + timestamp) / 2
                }

                n++

                ModalWindowService.ProgressModal.setProgress([
                    {
                        title: `orders: ${ordersDone}/${orderCount}`,
                        progress: { value: ordersDone / orderCount * 100 }
                    }, {
                        title: `line items: ${lineItemsDone}/${lineItemCount}`,
                        progress: { value: lineItemsDone / lineItemCount * 100 }
                    }, {
                        title: `time remaining: ${moment(average * (total - n)).format('mm:ss')}`
                    }
                ])
            })
            .then(orders => ({
                name,
                orderCount,
                lineItemCount: total,
                created,
                orders,
                updated: null
            }))
            .then(result => {
                let data = JSON.stringify(result, null, '  '),
                    name = result.name

                FileService.saveFile(data, name)
            })
            .finally(ModalWindowService.ProgressModal.hideModal)

        ModalWindowService.ProgressModal.onCancel(() => promise.cancel('canceled by user'))
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

        ModalWindowService.ProgressModal.setProgress([{
            title: `orders: ${selected.length}`,
            progress: { value: 0 }
        }])

        let promise = OrderController.updateOrderStatusInSet(selected, status, ({ count, done }) => {
                ModalWindowService.ProgressModal.setProgress([{
                    title: `orders: ${done}/${count}`,
                    progress: { value: done / count * 100}
                }])
            })

        ModalWindowService.ProgressModal.onCancel(() => promise.cancel('canceled by user'))

        promise
            .finally(() => {
                ModalWindowService.ProgressModal.hideModal()
                this.loadOrders()
            })
    }

    @bind
    backupSelected() {
        let { orderCount, lineItemCount: total, selected } = this.state,
            name = 'default name',
            created = Date.now(),
            n = 0,
            average

        // this.hideModal()

        ModalWindowService.ProgressModal.setProgress([
            {
                title: 'orders:',
                progress: { value: 0 }
            }, {
                title: 'line items:',
                progress: { value: 0 }
            }
        ])

        let promise = OrderController.collectOrderDataFromSet(selected,
            ({ lineItemCount, lineItemsDone, orderCount, ordersDone, timestamp }) => {
                if (average == null) {
                    average = timestamp
                } else {
                    average = (average + timestamp) / 2
                }

                n++

                ModalWindowService.ProgressModal.setProgress([
                    {
                        title: `orders: ${ordersDone}/${orderCount}`,
                        progress: { value: ordersDone / orderCount * 100 }
                    }, {
                        title: `line items: ${lineItemsDone}/${lineItemCount}`,
                        progress: { value: lineItemsDone / lineItemCount * 100 }
                    }, {
                        title: `time remaining: ${moment(average * (total - n)).format('mm:ss')}`
                    }
                ])
            })
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
                this.props.history.push('/backup/preview')
            })
            .finally(ModalWindowService.ProgressModal.hideModal)

        ModalWindowService.ProgressModal.onCancel(() => promise.cancel('canceled by user'))
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
}
