import React, { Component } from 'react'
import { Navbar, NavbarBrand, Nav, NavItem, NavLink } from 'reactstrap'
import { NavLink as RRNavLink } from 'react-router-dom'
import classnames from 'classnames'
import { ProgressModal, ErrorPopup } from '../Popups'
import { ModalWindowService } from '../../services'


export class BaseLayout extends Component {
    state = {
        username: ''
    }

    componentDidMount() {
        window.MopubAutomation.username
            .then(username => this.setState({ username }))

        ModalWindowService.onUpdate = () => this.forceUpdate()
    }

    componentWillUnmount() {
        ModalWindowService.onUpdate = null
    }

    render() {
        let { className, children } = this.props,
            { username } = this.state

        return (
            <div className={ classnames('base-layout', className) }>
                <Navbar className="header">
                    <NavbarBrand>Mopub extension</NavbarBrand>
                    <Nav>
                        <div className="username">{ username }</div>
                        <NavItem>
                            <NavLink tag={ RRNavLink } activeClassName="active" to="/adunits">AdUnits</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink tag={ RRNavLink } activeClassName="active" to="/orders">Orders</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink tag={ RRNavLink } activeClassName="active" to="/backups">Backups</NavLink>
                        </NavItem>
                    </Nav>
                </Navbar>
                <div className="container">
                    { children }
                </div>

                <ErrorPopup
                    isOpen={ ModalWindowService.ErrorPopup.isOpen }
                    message={ ModalWindowService.ErrorPopup.message }
                    toggleModal={ ModalWindowService.ErrorPopup.hideModal }
                />

                <ProgressModal
                    isOpen={ ModalWindowService.ProgressModal.isOpen }
                    progress={ ModalWindowService.ProgressModal.progress }
                    toggleModal={ ModalWindowService.ProgressModal.hideModal }
                    onCancel={ ModalWindowService.ProgressModal.cancel }
                />
            </div>
        )
    }
}
