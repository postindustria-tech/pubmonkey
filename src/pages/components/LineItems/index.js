import React, { Component } from 'react'
import { Table } from 'reactstrap'

export class LineItemsTable extends Component {
    state = {
        allSelected: false
    }

    componentDidMount() {
        if (this.props.allSelected) {
            this.toggleAll(true)
        }
    }

    render() {
        let { lineItems = [], removeLineItem, filter = () => true } = this.props,
            { allSelected } = this.state

        return (
            <Table className="line-items-table">
                <thead>
                    <tr>
                        <th className="select select-all">
                            <input
                                type="checkbox"
                                onChange={ e => this.toggleAll(e.target.checked) }
                                checked={ allSelected }
                            />
                        </th>
                        <th>name</th>
                        <th>rate</th>
                        <th>enabled</th>
                        {/* {
                            removeLineItem && <th>actions</th>
                        } */}
                    </tr>
                </thead>
                <tbody>
                    { lineItems
                        .filter(filter)
                        .map(({ name, bid, key, active, status, checked }) => {
                            return (
                                <tr key={ key }>
                                    <td className="select">
                                        <input
                                            type="checkbox"
                                            onChange={ () => this.toggleItem(key) }
                                            checked={ checked || false }
                                        />
                                    </td>
                                    <td>{ name }</td>
                                    <td>{ bid }</td>
                                    <td>
                                        <i className="fa fa-power-off"
                                            style={{ color: active ? '#0f0' : '#f00' }}
                                        />
                                        { status === 'archived' ? 'archived' :
                                          status === 'paused' ? 'paused' : ''
                                        }
                                    </td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </Table>
        )
    }

    toggleAll(checked) {
        let { lineItems, onUpdate } = this.props

        this.setState({
            allSelected: checked
        })

        onUpdate(
            lineItems.map(lineItem => {
                lineItem.checked = checked
                return lineItem
            })
        )
    }

    toggleItem(_key) {
        let { lineItems, onUpdate } = this.props

        onUpdate(
            lineItems.map(lineItem => {
                let { checked, key } = lineItem

                if (key === _key) {
                    lineItem.checked = !lineItem.checked
                }

                return lineItem
            })
        )
    }
}
