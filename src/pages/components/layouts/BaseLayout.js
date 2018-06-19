import React, { Component } from 'react'
import { Navbar, NavbarBrand, Nav, NavItem, NavLink } from 'reactstrap'
import { NavLink as RRNavLink } from 'react-router-dom'
import classnames from 'classnames'

export class BaseLayout extends Component {
    render() {
        let { className, children } = this.props

        return (
            <div className={ classnames('base-layout', className) }>
                <Navbar className="header">
                    <NavbarBrand>Mopub extension</NavbarBrand>
                    <Nav>
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
