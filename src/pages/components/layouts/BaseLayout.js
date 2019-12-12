import React, { Component } from 'react'
import {Navbar, NavbarBrand, Nav, NavItem, NavLink, Button} from 'reactstrap'
import { NavLink as RRNavLink } from 'react-router-dom'
import classnames from 'classnames'
import { ProgressModal, ErrorPopup, AlertPopup } from '../Popups'
import { ModalWindowService } from '../../services'
import { version } from '../../../misc.json'
import SourceTypeViewContainer from '../../containers/SourceTypeViewContainer/SourceTypeViewContainer';
import adServerSelectors from "../../../redux/selectors/adServer";
import {connect} from "react-redux";
import AdServerSwitcherContainer from "../../containers/adServerSwitcherContainer/adServerSwitcherContainer";
import OrdersStats from '../Orders/Stats'
import AdUnitsStats from '../AdUnits/Stats'

class BaseLayout extends Component {

    componentDidMount() {
        ModalWindowService.onUpdate = () => this.forceUpdate()
    }

    componentWillUnmount() {
        ModalWindowService.onUpdate = null
    }

    render() {
        let { className, children, type } = this.props;

        const isActive = (match, location) => {
            if (!match) {
                return location.pathname === "/";
            }
            return match.url === location.pathname;
        };

        return (

            <div className={ classnames('base-layout d-flex', className) } id="wrapper">

                <div className={"bg-light sticky-top"} id="sidebar-wrapper" style={{height: "100%"}}>
                    <div className={"sidebar-heading"}>
                        <NavbarBrand>PubMonkey <small>v. { version }</small></NavbarBrand>
                    </div>
                    <div className={"list-group list-group-flush"}>
                        <NavLink
                            tag={ RRNavLink }
                            className={"list-group-item list-group-item-action bg-light"}
                            activeClassName="active"
                            to="/orders"
                            isActive={isActive}
                        >
                            <i className="fas fa-truck"/>
                            &nbsp; Orders<br />
                            <OrdersStats />
                        </NavLink>
                        <NavLink
                            tag={ RRNavLink }
                            className={"list-group-item list-group-item-action bg-light"}
                            activeClassName="active"
                            to="/adunits"
                        >
                            <i className="fas fa-boxes"/>
                            &nbsp; Ad Units<br />
                            <AdUnitsStats />
                        </NavLink>
                        <a
                            className={"list-group-item list-group-item-action bg-light"}
                            href="https://postindustria.com/wp-content/uploads/2019/07/PubMonkey-manual.pdf"
                            target="_blank">
                            <i className="fas fa-question-circle"/>
                            &nbsp; Download manual
                        </a>
                    </div>
                    {/*<div className={"list-group list-group-flush"}>
                        <a
                            className={"list-group-item list-group-item-action bg-light"}
                            href="https://postindustria.com/wp-content/uploads/2019/07/PubMonkey-manual.pdf"
                            target="_blank">
                            <i className="far fa-question-circle"/>
                            &nbsp;Download manual
                        </a>
                    </div>*/}
                </div>

                <div id="page-content-wrapper" className={"border-left"}>

                    <Navbar className="header sticky-top">
                        <AdServerSwitcherContainer/>
                        <SourceTypeViewContainer />
                    </Navbar>
                    <div className="container">
                        { children }
                    </div>

                </div>

                <footer>
                    Made by <a target="_blank" href="https://postindustria.com">Postindustria</a> &copy; {new Date().getFullYear()}
                </footer>

                <ErrorPopup
                    isOpen={ ModalWindowService.ErrorPopup.isOpen }
                    header={ ModalWindowService.ErrorPopup.header }
                    message={ ModalWindowService.ErrorPopup.message }
                    toggleModal={ ModalWindowService.ErrorPopup.hideModal }
                />

                <AlertPopup
                    isOpen={ ModalWindowService.AlertPopup.isOpen }
                    header={ ModalWindowService.AlertPopup.header }
                    message={ ModalWindowService.AlertPopup.message }
                    toggleModal={ ModalWindowService.AlertPopup.hideModal }
                />

                <ProgressModal
                    isOpen={ ModalWindowService.ProgressModal.isOpen }
                    progress={ ModalWindowService.ProgressModal.progress }
                    toggleModal={ ModalWindowService.ProgressModal.hideModal }
                    onCancel={ ModalWindowService.ProgressModal.cancel }
                    adServer={ type }
                />
            </div>
        )
    }
}

const mapStateToProps = state => ({
    type: adServerSelectors.switcherType(state)
});

export default connect(mapStateToProps)(BaseLayout)