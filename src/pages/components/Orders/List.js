import React, { Component } from 'react'
import { Button, Progress, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import moment from 'moment'
import sha256 from 'sha256'
import { OrdersTable } from './Table'
import { BaseLayout } from '../layouts'
import { FileService, RPCController } from '../../services'

export class OrdersList extends Component {
    state = {
        orders: [],
        // isModalVisible: false,
        progress: 0,
        inProgress: false,
        selected: [],
        orderCount: 0,
        lineItemCount: 0
    }

    constructor() {
        super()
        this.backupSelected = this.backupSelected.bind(this)
        this.toggleModal = this.toggleModal.bind(this)
        this.onOrdersListUpdate = this.onOrdersListUpdate.bind(this)
    }

    componentDidMount() {
        RPCController.getAllOrders()
            .then((orders = []) => this.setState({ orders }))
    }

    render() {
        let { orders, progress, inProgress, orderCount, lineItemCount } = this.state

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
                </Button>{ '  ' }

                <OrdersTable
                    orders={ orders }
                    onUpdate={ this.onOrdersListUpdate }
                />

                <Modal
                    className={this.props.className}
                    // toggle={ this.toggleModal }
                    isOpen={ this.state.inProgress }
                >
                    {/* <ModalHeader toggle={ this.toggleModal }>Backup orders</ModalHeader> */}
                    <ModalHeader>Progress</ModalHeader>
                    <ModalBody>
                        <Progress value={ progress }/>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" disabled onClick={ this.toggleModal }>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </BaseLayout>
        )
    }

    backupSelected() {
        let { orderCount, lineItemCount, selected } = this.state,
            name = 'default name',
            date = Date.now()

        this.toggleModal()

        return Promise.all(
                selected
                    .map(({ key }) => this.collectOrderData(key))
            )
            .then(orders => ({
                name,
                orderCount,
                lineItemCount,
                date,
                orders
            }))
            // .then(result =>
            //     FileService.saveFile(result, 'backup-' + moment().format('MM-DD-YYYY-hh-mm'))
            // )
            .then(result => {
                RPCController.keepInDraft(JSON.stringify(result)) //JSON.stringify(result, null, '  ')
                this.toggleModal()
                this.props.history.push('/backup/preview')
            })
    }

    collectOrderData(id) {
        let total = this.state.lineItemCount,
            step = 100 / total

        this.setState({
            inProgress: true,
            progress: 0
        })

        return RPCController.getOrder(id)
            .then((order) => {
                let { lineItems } = order

                return Promise.all(
                        lineItems.map(({ key }) =>
                            RPCController.getLineItem(key)
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

    toggleModal() {
        this.setState({
            progress: 0,
            inProgress: !this.state.inProgress
        })
    }
}
