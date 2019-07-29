import React, { Component } from 'react'
import { Redirect } from 'react-router'
import { Button } from 'reactstrap'
import moment from 'moment'
import bind from 'bind-decorator'
import { BaseLayout } from '../layouts'
import { OrdersTable } from '../Orders'
import { FileService, ModalWindowService } from '../../services'
import { MainController, OrderController } from '../../controllers'

export class BackupView extends Component {
    state = {
        backup: null,
        isExist: false,
        isDirty: false,
        orders: []
    }

    componentDidMount() {
        this.loadBackup()
    }

    loadBackup() {
        let { history } = this.props,
            { location: { pathname } } = history

        if (pathname === '/backup/preview') {
            MainController.getDraft()
                .then(draft => {
                    if (draft.length) {
                        let backup = JSON.parse(draft),
                            { orders } = backup

                        this.setState({
                            backup,
                            orders,
                            isExist: false
                        }, () => this.calcSelected())

                    } else {
                        history.push('/orders')
                    }
                })

            return
        }

        if (pathname.slice(0, 8) === '/backup/') {
            let { params: { id, key } } = this.props.match

            MainController.getBackupById(Number(id))
                .then(backup => {
                    if (backup == null) {
                        throw 'no backup with id ' + id
                    }

                    let { orders } = backup

                    this.setState({
                        backup,
                        orders,
                        isExist: true
                    }, () => this.calcSelected())
                })
        }
    }

    componentWillUnmount() {
        MainController.clearDraft()
    }

    render() {
        let { backup, orders, isExist, isDirty } = this.state

        if (backup == null) {
            return false
        }

        let { orderCount, lineItemCount, name, created, updated } = backup

        return (
            <BaseLayout
                className="backup-view-layout"
            >
                <h2>Backup View</h2>
                <div>name:
                    <input
                        className="form-control"
                        type="text"
                        defaultValue={ name }
                        onChange={ e => this.updateBackup({ name: e.target.value })}
                    />
                </div>
                <div>created: { moment(created).format('MM/DD/YYYY hh:mm:ss') }</div>
                <div>updated: { moment(updated).format('MM/DD/YYYY hh:mm:ss') }</div>
                <div>orders: { orderCount }</div>
                <div>line-items: { lineItemCount }</div>
                <Button
                    onClick={ () => this.downloadBackup() }
                >
                    <i className="fa fa-cloud-download"/>
                </Button>
                <Button
                    onClick={ this.restoreSelected }
                >
                    <i className="fa fa-arrow-circle-up"/>&nbsp;Restore
                </Button>
                <Button
                    onClick={ this.saveBackup }
                    disabled={ !(!isExist || isDirty) }
                >
                    <i className="fa fa-save"/>&nbsp;Save
                </Button>

                <OrdersTable
                    orders={ orders }
                    allSelected={ true }
                    removeOrder={ true }
                    onUpdate={ this.onOrdersListUpdate }
                />
            </BaseLayout>
        )
    }

    @bind
    updateBackup(data) {
        let { backup } = this.state

        Object.keys(data).forEach(key =>
            backup[key] = data[key]
        )

        this.setState({
            backup,
            isDirty: true
        })
    }

    @bind
    restoreSelected() {
        let { backup: { orders, lineItemCount: total } } = this.state,
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
        .finally(ModalWindowService.ProgressModal.hideModal)

        ModalWindowService.ProgressModal.onCancel(() => promise.cancel('canceled by user'))
    }

    @bind
    saveBackup() {
        let { backup, isExist } = this.state

        if (isExist) {
            MainController.updateBackup(backup)
                .then(backup =>
                    this.setState({
                        backup,
                        isDirty: false
                    })
                )
        } else {
            MainController.createBackup(backup)
                .then(() =>
                    this.setState({
                        isExist: true,
                        isDirty: false
                    })
                )
        }
    }

    @bind
    downloadBackup() {
        let { backup } = this.state,
            data = JSON.stringify(backup, null, '  '),
            name = backup.name.replace(/\s/g, '-') + moment().format('-MM-DD-YYYY-hh-mm')

        FileService.saveFile(data, name)
    }

    @bind
    onOrdersListUpdate(orders) {
        this.setState({
            orders
        }, () => this.calcSelected())
    }

    calcSelected() {
        let { orders } = this.state,
            selected = orders
                .filter(({ checked }) => checked)

        this.setState({
            selected
        })
    }
}
