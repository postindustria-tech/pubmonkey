import React, {Component} from "react";
import classnames from "classnames";
import {Table} from "reactstrap";
import bind from "bind-decorator";
import adServerActions from "../../../redux/actions/adServer";
import {connect} from "react-redux";
import adServerSelectors from "../../../redux/selectors/adServer";
import {AD_SERVER_DFP} from "../../constants/source";
import {StatusSelect} from "../Select";

const workerOptions = ['Pause', 'Resume', 'Archive'];

class OrdersTable extends Component {

    state = {
        allSelected: false,
        orderKey: null,
        updatedFiltersAt: null
    };

    componentDidMount() {
        if (this.props.allSelected) {
            this.toggleAll(true);
        }
    }

    componentWillReceiveProps = (props, state) => {
        if (props.updatedFiltersAt !== this.state.updatedFiltersAt) {
            this.setState({updatedFiltersAt: props.updatedFiltersAt});
            this.toggleAll(false)
        }
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
                            <td>
                                <a target="_blank" href={this.getOrderUrl(key)}>
                                    {name}
                                </a>
                            </td>
                            <td>{advertiser}</td>
                            <td>{Array.isArray(lineItemCount) ?
                                lineItemCount.map((item, i) => {
                                    return <p key={i}>{item}</p>;
                                }) :
                                lineItemCount}
                            </td>
                            <td>{status}{/*{this.props.type === AD_SERVER_DFP ?
                                <StatusSelect
                                    options={workerOptions}
                                    status={status}
                                    onSelect={status => this.changeOrderStatus(key, status)}
                                /> : status}*/}
                            </td>
                            <td className="actions">
                                <i
                                    className={classnames("fa", "fa-archive", {
                                        archived: status.toLowerCase() === "archived"
                                    })}
                                    title={status.toLowerCase() === "archived" ? "Unarchive" : "Archive"}
                                    onClick={() => this.toggleArchive(status, key)}
                                ></i>
                                <i
                                    className={classnames("fa", {
                                        "fa-pause": status === "running" || status === "",
                                        "fa-play": status === "paused"
                                    })}
                                    title={status === "running" ? "Disable" : "Enable"}
                                    onClick={() => this.togglePause(status, key)}
                                ></i>
                                <i
                                    className={classnames("fa", "fa-copy")}
                                    title={"Duplicate Order"}
                                    onClick={() => this.props.createOrderModalToggle(key)}
                                ></i>
                            </td>
                        </tr>
                    ))
                }
                </tbody>
            </Table>
        );
    }

    getOrderUrl(key) {
        if (this.props.sourceHandler) {
            return this.props.sourceHandler.getOrderUrl(key);
        }
        return null;
    }

    changeOrderStatus(key, status) {
        this.props.sourceHandler.updateOrderStatus(status, key).then(() => {
            this.props.updateOrderStatus(status, key);
        });
    }

    togglePause(status, key) {
        status = status === "running" ? "paused" : "running";

        this.updateStatus(status, key);
    }

    toggleArchive(status, key) {
        status =
            status.toLowerCase() === "archived"
                ? this.props.type === AD_SERVER_DFP ? "unarchived" : "running"
                : "archived";

        this.updateStatus(status, key);
    }

    updateStatus(status, key) {
        this.props.sourceHandler.updateOrderStatus(status, key).then((updatedOrder) => {
            this.props.updateOrderStatus(updatedOrder.status, key);
        });
    }

    @bind
    loadOrders() {
        console.log("loadOrders: " + this.props.adServer);
        this.props.setSwitcher(this.props.adServer);
    }

    toggleAll(checked) {
        let {orders, onUpdate} = this.props;

        this.setState({
            allSelected: checked
        });

        onUpdate(
            orders.map(order => {
                order.checked = checked;
                return order;
            })
        );
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
    setOrders: adServerActions.setOrders,
    createOrderModalToggle: adServerActions.createOrderModalToggle
};

const mapStateToProps = state => ({
    type: adServerSelectors.switcherType(state),
    sourceHandler: adServerSelectors.sourceHandler(state),
});

export default connect(mapStateToProps, mapDispatchToProps)(OrdersTable);
