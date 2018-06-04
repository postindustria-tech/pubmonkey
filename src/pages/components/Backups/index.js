import React, { Component } from 'react'
import { Table, Button } from 'reactstrap'
import { RPCController } from '../../services'

export class Backups extends Component {
    state = {
        backups: []
    }

    render() {
        let { backups } = this.state

        return (
            <div className="backups-layout">
                <div className="container">
                    <h2>Mopub backpack Backups</h2>
                    <Button
                        color="primary"
                        onClick={ () => RPCController.addToStore({ backups: Math.random() }).then(result=>console.log(result)) }
                    >2</Button>
                    <Table className="backups-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Date</th>
                                <th>Orders count</th>
                                <th>Line Items count</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                backups.map(({ name, date, ordersCount, lineItemsCount, id }) => (
                                    <tr key={ id }>
                                        <td>{ name }</td>
                                        <td>{ date }</td>
                                        <td>{ ordersCount }</td>
                                        <td>{ lineItemsCount }</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </Table>
                </div>
            </div>
        )
    }
}
