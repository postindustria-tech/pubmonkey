import React, { Component } from 'react'
import { Navbar, NavbarBrand, Nav, NavItem, NavLink } from 'reactstrap'
import { NavLink as RRNavLink } from 'react-router-dom'
import classnames from 'classnames'
import { ProgressModal, ErrorPopup } from '../Popups'
import { ModalWindowService } from '../../services'
import { version } from '../../../misc.json'

export class BaseLayout extends Component {
    state = {
        username: '',
        loggedIn: null
    }

    componentDidMount() {
        window.MopubAutomation.username
            .then(username => this.setState({ username }))

        window.MopubAutomation.loggedIn
            .then(loggedIn => this.setState({ loggedIn }))

        ModalWindowService.onUpdate = () => this.forceUpdate()
    }

    componentWillUnmount() {
        ModalWindowService.onUpdate = null
    }

    render() {
        let { className, children } = this.props,
            { username, loggedIn } = this.state

        return (
            <div className={ classnames('base-layout', className) }>
                <Navbar className="header">
                    <NavbarBrand>MoPorter <small>v. { version }</small></NavbarBrand>
                    <div id="downloadManual">
                        <a href="https://postindustria.com/wp-content/uploads/2019/07/MoPorter-manual.pdf" target="_blank">Download manual</a>
                    </div>
                    <Nav>
                        <div className="username">
                            { loggedIn != null
                                && loggedIn
                                    ? (<a href="https://app.mopub.com/dashboard/" target="_blank">{ username }</a>)
                                    : (
                                        <div className="login-link">Not logged in.&nbsp;
                                            <a href="#" onClick={ window.MopubAutomation.openLoginPage }>Log in.</a>
                                        </div>
                                    )
                            }
                        </div>
                        <NavItem>
                            <NavLink tag={ RRNavLink } activeClassName="active" to="/adunits">Ad Units</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink tag={ RRNavLink } activeClassName="active" to="/orders">Orders</NavLink>
                        </NavItem>
                        {/* <NavItem>
                            <NavLink tag={ RRNavLink } activeClassName="active" to="/backups">Backups</NavLink>
                        </NavItem> */}
                    </Nav>
                </Navbar>
                <div className="container">
                    { children }
                </div>

                <footer>
                    Made by <a target="_blank" href="https://postindustria.com">Postindustria</a> &copy; 2006-{new Date().getFullYear()}
                </footer>

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
