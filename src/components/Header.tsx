import * as React from "react";
import { Navbar, Nav, NavItem, Container } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { IBaseProps } from "../domain/IBaseProps";

export default class Header extends React.PureComponent<IBaseProps, undefined> {
  constructor(props: IBaseProps) {
      super(props);
  }

  render() {
      return (
        <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
          <Container fluid>
            <LinkContainer to="/index">
              <Navbar.Brand>
                <div style={{ display: "flex", flexDirection: "row" }}>
                    <div style={{ textAlign: "center", fontSize: "15px", color: "red", margin: "5px", background: "linear-gradient(to bottom, #0057b7 0%, #0057b7 50%, #ffd700 50%, #ffd700 100%)", width: "30px", height: "20px" }}>♥</div>
                    <span>Help for Ukraine</span>
                </div>
              </Navbar.Brand>
            </LinkContainer>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
            <Nav>
                { this.props.user &&
                  <LinkContainer to="/housing">
                    <NavItem>Housing</NavItem>
                  </LinkContainer>
                }
                { this.props.user &&
                  <LinkContainer to="/help">
                    <NavItem>Help</NavItem>
                  </LinkContainer>
                }
                { this.props.user &&
                  <LinkContainer to="/familyFinder">
                    <NavItem>Family Finder</NavItem>
                  </LinkContainer>
                }
                { this.props.user && this.props.user.is_admin &&
                  <LinkContainer to="/portalManagement">
                    <NavItem>Portal Management</NavItem>
                  </LinkContainer>
                }
            </Nav>
            <Nav className="justify-content-end">
              { !this.props.user && <LinkContainer to="/login">
                <NavItem>Login</NavItem>
              </LinkContainer> }
              { !this.props.user && <LinkContainer to="/signUp">
                <NavItem>Sign Up</NavItem>
              </LinkContainer> }
              { this.props.user && <LinkContainer to="/profile">
                <NavItem>Profile</NavItem>
              </LinkContainer> }
              { this.props.user && <LinkContainer to="/logout">
                <NavItem>Logout</NavItem>
              </LinkContainer> }
            </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      );
  }
}
