import React, { Component } from 'react'
import { Button } from 'reactstrap'
import Select from 'react-select'
import bind from 'bind-decorator'
import Promise from 'bluebird'
import moment from 'moment'
import BaseLayout from "../layouts/BaseLayout";
import { LineItemsTable } from '../LineItems'
import { ModalWindowService } from '../../services'
import { OrderController } from '../../controllers'
import { LineItemEditModal, CloneModal } from '../Popups'

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
        updates: [],
        clones: []
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
        let { order, isDirty, lineItems, filter, filterFn, updates, clones } = this.state

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
                    onClick={ () => this.setState({ clones: [ selected.length ] }) }
                >
                    Clone
                </Button>&nbsp;
                <Button
                    disabled={ !selected.length }
                    onClick={ () => this.setState({ updates: [ selected.length ] }) }
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

                <LineItemEditModal
                    isOpen={ !!updates.length }
                    onUpdate={ this.onEditUpdate }
                    onCancel={ this.hideUpdateModal }
                    updates={ updates }
                />

                <CloneModal
                    isOpen={ !!clones.length }
                    onClone={ this.onClone }
                    onCancel={ this.hideCloneModal }
                    clones={ clones }
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

        ModalWindowService.ProgressModal.setProgress([
            {
                title: `line items: ${selected.length}`,
                progress: { value: 0 }
            }
        ])

        let promise = OrderController.updateLineItems(selected, { enabled }, ({ done, count }) => {
                ModalWindowService.ProgressModal.setProgress([
                    {
                        title: `line items: ${done}/${count}`,
                        progress: { value: done / count *  100 }
                    }
                ])
            })
            .catch(err => {
                let { errors } = err.response.data

                ModalWindowService.ErrorPopup.showMessage(
                    errors.map(({ field, message }, idx) => (
                        <div key={ idx }><strong>{ field }:</strong>&nbsp;{ message }</div>
                    ))
                )
            })
            .finally(() => {
                ModalWindowService.ProgressModal.hideModal()
                this.loadOrder()
            })

        ModalWindowService.ProgressModal.onCancel(() => promise.cancel('canceled by user'))
    }

    @bind
    archiveSelected() {
        let { selected, filter } = this.state,
            status = filter === 4 ? 'play' : 'archive'

        ModalWindowService.ProgressModal.setProgress([
            {
                title: `line items: ${selected.length}`,
                progress: { value: 0 }
            }
        ])

        let promise = OrderController.updateLineItemStatusInSet(selected, status, ({ done, count }) =>
                ModalWindowService.ProgressModal.setProgress([
                    {
                        title: `line items: ${done}/${count}`,
                        progress: { value: done / count * 100 }
                    }
                ])
            )
            .finally(() => {
                ModalWindowService.ProgressModal.hideModal()
                this.loadOrder()
            })

        ModalWindowService.ProgressModal.onCancel(() => promise.cancel('canceled by user'))
    }

    @bind
    cloneSelected(number) {
        let { selected } = this.state,
            timestamp = Date.now(),
            average,
            promise

        ModalWindowService.ProgressModal.setProgress([
            {
                title: `line items: ${selected.length}`,
                progress: { value: 0 }
            }
        ])

        promise = OrderController.cloneLineItems(selected, number, ({ done, count }) => {
                if (average) {
                    average = (average + (Date.now() - timestamp)) / 2
                } else {
                    average = Date.now() - timestamp
                }

                timestamp = Date.now()

                ModalWindowService.ProgressModal.setProgress([
                    {
                        title: `line items: ${done}/${count}`,
                        progress: { value: done / count * 100 }
                    }, {
                        title: `time remaining: ${moment(average * (count - done)).format('mm:ss')}`
                    }
                ])
            })
            .finally(() => {
                ModalWindowService.ProgressModal.hideModal()
                this.loadOrder()
            })

        ModalWindowService.ProgressModal.onCancel(() => promise.cancel('canceled by user'))
    }

    @bind
    editSelected(updates) {
        let { selected } = this.state,
            promise

        ModalWindowService.ProgressModal.setProgress([
            {
                title: `line items: ${selected.length}`,
                progress: { value: 0 }
            }
        ])

        if (updates.valueType === 'type-single') {
            promise = OrderController.updateLineItems(selected, {
                [updates.field]: updates.value.single
            }, ({ done, count }) =>
                ModalWindowService.ProgressModal.setProgress([
                    {
                        title: `line items: ${done}/${count}`,
                        progress: { value: done / count * 100 }
                    }
                ])
            )
            .finally(() => {
                ModalWindowService.ProgressModal.hideModal()
                this.loadOrder()
            })
        }

        if (updates.valueType === 'type-step') {
            let current = Number(updates.value.start),
                step = Number(updates.value.step),
                next = current

            promise = Promise.mapSeries(selected, ({ key }, done, count) =>
                    OrderController.updateLineItem({ [updates.field]: next }, key)
                        .then(() => {
                            next += step

                            ModalWindowService.ProgressModal.setProgress([
                                {
                                    title: `line items: ${done + 1}/${count}`,
                                    progress: { value: (done + 1) / count * 100 }
                                }
                            ])
                        })
                )
                .finally(() => {
                    ModalWindowService.ProgressModal.hideModal()
                    this.loadOrder()
                })
        }


        ModalWindowService.ProgressModal.onCancel(() => promise.cancel('canceled by user'))
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
    onClone(number) {
        this.hideCloneModal()
        this.cloneSelected(number)
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
    hideUpdateModal() {
        this.setState({
            updates: []
        })
    }

    @bind
    hideCloneModal() {
        this.setState({
            clones: []
        })
    }
}
