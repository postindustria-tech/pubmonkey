import React, {Component} from 'react'
import classnames from 'classnames'
import {Link} from 'react-router-dom'
import {Table} from 'reactstrap'
import {CreateOrderModal} from "../Popups/CreateOrder";
import SourceFactory from "../../sources/Factory";
import bind from "bind-decorator";
import adServerActions from "../../../redux/actions/adServer";
import {connect} from "react-redux";

class OrdersTable extends Component {

    sourceHandler = null;

    state = {
        allSelected: false,
        orderKey: null
    };

    componentDidMount() {
        if (this.props.allSelected) {
            this.toggleAll(true)
        }
        this.initHandler();
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.adServer !== prevProps.adServer) {
            this.initHandler();
        }
    }

    initHandler() {
        this.sourceHandler = SourceFactory.getHandler(this.props.adServer);
    }

    openModal = () => {
        this.orderModal.ask()
    };

    render() {
        let {orders = [], filter = () => true} = this.props,
            {allSelected} = this.state;

        return (
            <Table className="orders-table">
                <thead>
                <tr>
                    <th className="select select-all">
                        <input
                            type="checkbox"
                            onChange={e => this.toggleAll(e.target.checked)}
                            checked={allSelected}
                        />
                    </th>
                    <th>Name</th>
                    <th>Advertiser</th>
                    <th>Line items</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <CreateOrderModal
                    withButton={false}
                    adServer={this.props.adServer}
                    ref={orderModal => this.orderModal = orderModal}
                    toUpdate={this.loadOrders}
                />
                <tbody>
                {orders
                    .filter(filter)
                    .map(({name, status, advertiser, lineItemCount, key, checked = false}, index) => (
                        <tr key={key} className="order">
                            <td className="select">
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => this.toggleSelected(key)}
                                />
                            </td>
                            <td><a target="_blank" href={this.getOrderUrl(key)}>{name}</a></td>
                            <td>{advertiser}</td>
                            <td>{lineItemCount}</td>
                            <td>{status}</td>
                            <td className="actions">
                                <i className={classnames('fa', 'fa-archive', {archived: status === 'archived'})}
                                   title={status === 'archived' ? 'Unarchive' : 'Archive'}
                                   onClick={() => this.toggleArchive(status, key)}
                                ></i>
                                <i className={classnames('fa', {
                                    'fa-pause': status === 'running',
                                    'fa-play': status === 'paused'
                                })}
                                   title={status === 'running' ? 'Disable' : 'Enable'}
                                   onClick={() => this.togglePause(status, key)}
                                ></i>
                                <i className={classnames('fa', 'fa-copy')}
                                   title={'Dublicate Order'}
                                   onClick={() => this.toggleCopy(key)}
                                ></i>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        )
    }

    getOrderUrl(key) {
        if (this.sourceHandler) {
            return this.sourceHandler.getOrderUrl(key);
        }
        return null;
    }

    toggleCopy = (key) => {
        this.orderModal.toggle(null, key)
    };

    togglePause(status, key) {
        status = status === 'running' ? 'paused' : 'running';

        this.updateStatus(status, key)
    }

    toggleArchive(status, key) {
        status = status === 'archived' ? 'running' : 'archived';

        this.updateStatus(status, key)
    }

    updateStatus(status, key) {
        this.sourceHandler.updateOrderStatus(status, key).then(() => {
            this.props.updateOrderStatus(status, key);
        });
    }

    @bind
    loadOrders() {
        console.log('loadOrders: ' + this.props.adServer);
        this.props.setSwitcher(this.props.adServer)
    }

    toggleAll(checked) {
        let {orders, onUpdate} = this.props;

        this.setState({
            allSelected: checked
        });

        onUpdate(
            orders.map(order => {
                order.checked = checked;
                return order
            })
        )
    }

    toggleSelected(_key) {
        let {orders, onUpdate, filter = () => true} = this.props;

        orders = orders.map(order => {
            let {checked, key} = order;

            if (key === _key) {
                order.checked = !order.checked;
            }

            return order;
        });

        this.props.setOrders(orders);

        onUpdate(orders.filter(filter));
    }
}

const mapDispatchToProps = {
  updateOrderStatus: adServerActions.updateOrderStatus,
  setSwitcher: adServerActions.setSwitcher,
  setOrders: adServerActions.setOrders
};

export default connect(null, mapDispatchToProps)(OrdersTable)