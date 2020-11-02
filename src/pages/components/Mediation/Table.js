import React, {Component} from "react";
import classnames from "classnames";
import {Table} from "reactstrap";
import bind from "bind-decorator";
import adServerActions from "../../../redux/actions/adServer";
import {connect} from "react-redux";
import adServerSelectors from "../../../redux/selectors/adServer";
import {AD_SERVER_DFP} from "../../constants/source";
import {StatusSelect} from "../Select";
import {Col, Row} from "reactstrap";
import {isEmpty} from "../../helpers";

const workerOptions = ['Pause', 'Resume', 'Archive'];

class GroupsTable extends Component {

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

    resetChecked = () => {
        this.setState({'allSelected': false})
        this.props.setOrders(this.props.orders.map(order => {
            order.checked = false
            return order
        }))

    }

    actionsForSelectedItems = () => {
        if (isEmpty(this.props.orders)) {
            return (<React.Fragment></React.Fragment>)
        }
        const checked = this.props.orders.filter(this.props.filter).filter(order => order.checked)
        if (!checked.length) {
            return (<React.Fragment></React.Fragment>)
        }

        const hasArchived = checked.filter(order => order.status.toLowerCase() == "archived").length > 0
        const hasUnarchived = checked.filter(order => order.status.toLowerCase() != "archived").length > 0
        const hasPaused = checked.filter(order => order.status.toLowerCase() == "paused").length > 0
        const hasRunning = checked.filter(order => order.status.toLowerCase() == "running").length > 0

        return (
            <Row className="list-filter">
                <Col className={"col-sm-12"}>
                    <span className={"mp-label"}>
                        {checked.length} selected
                        {hasUnarchived && (
                            <i
                                className={classnames("fa", "fa-archive", {archived: false})}
                                title="Archive"
                                onClick={() => {
                                    checked.map(order => this.updateStatus("archived", order.key))
                                    this.resetChecked()
                                }}
                            ></i>)}
                        {hasArchived && (
                            <i
                                className={classnames("fa", "fa-archive", {archived: true})}
                                title="Unarchive"
                                onClick={() => {
                                    checked.map(order => this.updateStatus(this.props.type === AD_SERVER_DFP ? "unarchived" : "running", order.key))
                                    this.resetChecked()
                                }}
                            ></i>)}
                        {this.props.type !== AD_SERVER_DFP && (
                            <React.Fragment>
                                {hasRunning && <i
                                    className={classnames("fa", "fa-pause")}
                                    title="Disable"
                                    onClick={() => {
                                        checked.map(order => this.updateStatus("paused", order.key))
                                        this.resetChecked()
                                    }}
                                ></i>}
                                {hasPaused && <i
                                    className={classnames("fa", "fa-play")}
                                    title="Enable"
                                    onClick={() => {
                                        checked.map(order => this.updateStatus("running", order.key))
                                        this.resetChecked()
                                    }}
                                ></i>}
                            </React.Fragment>
                        )}
                    </span>
                </Col>
            </Row>
        )
    }

    render() {
        let {orders = [], filter = () => true} = this.props,
            {allSelected} = this.state;

        return (
            <React.Fragment>
                {/*{this.actionsForSelectedItems()}*/}
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
                        <th>Status</th>
                        <th>Name</th>
                        <th>Platform</th>
                        <th>Format</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {orders
                        .filter(filter)
                        .map(({name, status, platform, format, key, checked = false}, index) => (
                            <tr key={key} className="order">
                                <td className="select">
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => this.toggleSelected(key)}
                                    />
                                </td>
                                <td>{status}</td>
                                <td>
                                    <a target="_blank" href={this.getOrderUrl(key)}>
                                        {name}
                                    </a>
                                </td>
                                <td>{platform}</td>
                                <td>{format}</td>
                                <td className="actions"> </td>
                            </tr>
                        ))
                    }
                    </tbody>
                </Table>
            </React.Fragment>
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
        this.props.setSwitcher(this.props.adServer);
    }

    toggleAll(checked) {
        let {orders, onUpdate} = this.props;

        this.setState({
            allSelected: checked
        });

        if (orders && onUpdate) {
            onUpdate(
                orders.map(order => {
                    order.checked = checked;
                    return order;
                })
            );
        }
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

export default connect(mapStateToProps, mapDispatchToProps)(GroupsTable);
