import React, { Component } from 'react'
import { Navbar, NavbarBrand, Nav, NavItem, NavLink } from 'reactstrap'
import { NavLink as RRNavLink } from 'react-router-dom'
import classnames from 'classnames'

export class BaseLayout extends Component {
    state = {
        username: ''
    }

    componentDidMount() {
        window._mopub_acc_name
            .then(username => this.setState({ username }))
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
            </div>
        )
    }
}
