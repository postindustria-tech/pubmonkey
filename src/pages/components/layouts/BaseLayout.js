import React, { Component } from 'react'
import { Navbar, NavbarBrand, Nav, NavItem, NavLink } from 'reactstrap'
import { NavLink as RRNavLink } from 'react-router-dom'
import classnames from 'classnames'
import { ProgressModal, ErrorPopup } from '../Popups'
import { ModalWindowService } from '../../services'
import { version } from '../../../misc.json'
import SourceTypeViewContainer from '../../containers/SourceTypeViewContainer/SourceTypeViewContainer';
import adServerSelectors from "../../../redux/selectors/adServer";
import {connect} from "react-redux";

class BaseLayout extends Component {

    componentDidMount() {
        ModalWindowService.onUpdate = () => this.forceUpdate()
    }

    componentWillUnmount() {
        ModalWindowService.onUpdate = null
    }

    render() {
        let { className, children, type } = this.props;

        return (
            <div className={ classnames('base-layout', className) }>
                <Navbar className="header">
                    <NavbarBrand>PubMonkey <small>v. { version }</small></NavbarBrand>
                    <div id="downloadManual">
                        <a href="https://postindustria.com/wp-content/uploads/2019/07/PubMonkey-manual.pdf" target="_blank">Download manual</a>
                    </div>
                    <Nav>
                        <SourceTypeViewContainer />
                        <NavItem>
                            <NavLink tag={ RRNavLink } activeClassName="active" to="/adunits">Ad Units</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink tag={ RRNavLink } activeClassName="active" to="/orders">Orders</NavLink>
                        </NavItem>
                        {/*<NavItem>
                            <NavLink tag={ RRNavLink } activeClassName="active" to="/backups">Backups</NavLink>
                        </NavItem>*/}
                    </Nav>
                </Navbar>
                <div className="container">
                    { children }
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