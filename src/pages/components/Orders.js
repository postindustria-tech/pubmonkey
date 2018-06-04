import React, { Component } from 'react'
import { FileService } from '../services'

export class Orders extends Component {
    state = {
        orders: [{"status": "running", "advertiser": "order 0 adv", "description": "order 0 desc", "lineItemCount": 4, "key": "df287b78b96d4f60bce99313fea712b5", "name": "order 0"}, {"status": "running", "advertiser": "order 0 adv", "description": "order 0 desc", "lineItemCount": 2, "key": "b2d958bf9353428e86c8796e17e13d89", "name": "order 0"}, {"status": "running", "advertiser": "order 10 adv", "description": "order 10 desc", "lineItemCount": 4, "key": "d43ccc941f2f4e158d35146c505a7939", "name": "order 10"}, {"status": "running", "advertiser": "order 5 adv", "description": "order 5 desc", "lineItemCount": 2, "key": "ad4079e937654ed8b0d3e10acb8905ec", "name": "order 5"}, {"status": "running", "advertiser": "order 6 adv", "description": "order 6 desc", "lineItemCount": 1, "key": "c4aeb9eef4374bb0a2eb672394469011", "name": "order 6"}, {"status": "running", "advertiser": "order 7 adv", "description": "order 7 desc", "lineItemCount": 8, "key": "99a117cbaf9c4a11a454cdd8212eff8b", "name": "order 7"}, {"status": "running", "advertiser": "order 8 adv", "description": "order 8 desc", "lineItemCount": 4, "key": "ec7b511ae262473692dc9a36c0cccb0c", "name": "order 8"}, {"status": "running", "advertiser": "Some Test Advertiser", "description": "Some Test Description", "lineItemCount": 10, "key": "0be9df8cabc34b50ab3e60fd5937f519", "name": "TestOrder1"}, {"status": "archived", "advertiser": "Some Test Advertiser2", "description": "", "lineItemCount": 1, "key": "dfb5c711a1b041d2b833ee121bea20d1", "name": "TestOrder2"}, {"status": "running", "advertiser": "Test3", "description": "", "lineItemCount": 1, "key": "4f264b66eb3149eaada7ef7193cdb481", "name": "TestOrder3"}, {"status": "running", "advertiser": "Test4", "description": "", "lineItemCount": 1, "key": "467ff17e9844414a8120fd7ff62383f4", "name": "TestOrder4"}, {"status": "running", "advertiser": "Test444", "description": "desc", "lineItemCount": 1, "key": "d220b590e58149dd8d56d1df584d42cb", "name": "TestOrder444"}, {"status": "running", "advertiser": "Test544", "description": "desc", "lineItemCount": 1, "key": "85ffc8908b75456a91e63ae68c14fbbf", "name": "TestOrder544"}, {"status": "running", "advertiser": "Test545", "description": "desc", "lineItemCount": 1, "key": "b34b76f62e7b44c7a525b46305ac3933", "name": "TestOrder545"}, {"status": "running", "advertiser": "Test546", "description": "desc", "lineItemCount": 1, "key": "066242c57f76485aa9f2585f75763c30", "name": "TestOrder546"}]
    }

    constructor() {
        super()
        this.selectAll = this.selectAll.bind(this)
        this.backupSelected = this.backupSelected.bind(this)
    }

    render() {
        let { orders } = this.state

        return (
            <div className="orders">
                <button
                    onClick={ this.backupSelected }
                >backup selected</button>
                <button onClick={ () => FileService.openFile().then(result=>console.log(22,result)) }></button>
                <button onClick={ () => FileService.saveFile('blabla', 'asdas') }></button>
                <table>
                    <thead>
                        <tr>
                            <th><input type="checkbox" onClick={ this.selectAll } /></th>
                            <th>name</th>
                            <th>advertiser</th>
                            <th>line items</th>
                        </tr>
                    </thead>
                    <tbody>
                        { orders.map(({ name, advertiser, lineItemCount, key, checked = false }) => (
                            <tr key={ key } className="order">
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={ checked }
                                        onClick={ () => this.selectItem(key) }
                                    />
                                </td>
                                <td>{ name }</td>
                                <td>{ advertiser }</td>
                                <td>{ lineItemCount }</td>
                            </tr>
                        )) }
                    </tbody>
                </table>
            </div>
        )
    }

    backupSelected() {
        let { orders } = this.state
        console.log(orders.filter(({ checked }) => checked))
    }

    selectAll(e) {
        let { orders } = this.state,
            { checked } = e.target

        this.setState({
            orders: orders.map(order => ({ ...order, checked }))
        })
    }

    selectItem(_key) {
        let { orders } = this.state

        this.setState({
            orders: orders.map(order => {
                let { checked, key } = order

                if (key === _key) {
                    return { ...order, checked: !checked }
                }

                return order
            })
        })
    }
}
