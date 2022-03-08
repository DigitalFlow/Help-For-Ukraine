import * as React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { LinkContainer, IndexLinkContainer } from "react-router-bootstrap";
import { IBaseProps } from "../domain/IBaseProps";

export default class Header extends React.PureComponent<IBaseProps, undefined> {
  constructor(props: IBaseProps) {
      super(props);
  }

  render() {
      return (
        <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
          <Container fluid>
            <IndexLinkContainer to="/index">
              <Navbar.Brand>
                <div style={{ display: "flex", flexDirection: "row" }}>
                    <div style={{ textAlign: "center", fontSize: "15px", color: "red", margin: "5px", background: "linear-gradient(to bottom, #0057b7 0%, #0057b7 50%, #ffd700 50%, #ffd700 100%)", width: "30px", height: "20px" }}>♥</div>
                    <span>Help for Ukraine</span>
                </div>
              </Navbar.Brand>
            </IndexLinkContainer>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
              <Nav>
                  <IndexLinkContainer to="/index">
                    <Nav.Link>Home</Nav.Link>
                  </IndexLinkContainer>
                  { this.props.user &&
                    <LinkContainer to="/personFinder">
                      <Nav.Link>Person Finder</Nav.Link>
                    </LinkContainer>
                  }
                  {/* this.props.user &&
                    <LinkContainer to="/housing">
                      <Nav.Link>Housing</Nav.Link>
                    </LinkContainer>
                  }
                  { this.props.user &&
                    <LinkContainer to="/help">
                      <Nav.Link>Help</Nav.Link>
                    </LinkContainer>
                  */}

                  { this.props.user && this.props.user.is_admin &&
                    <LinkContainer to="/portalManagement">
                      <Nav.Link>Portal Management</Nav.Link>
                    </LinkContainer>
                  }
              </Nav>
              <Nav className="justify-content-end align-items-end">
                { !this.props.user && <LinkContainer to="/login">
                  <Nav.Link>Login</Nav.Link>
                </LinkContainer> }
                { !this.props.user && <LinkContainer to="/signUp">
                  <Nav.Link>Sign Up</Nav.Link>
                </LinkContainer> }
                { this.props.user && <LinkContainer to="/profile">
                  <Nav.Link>Profile</Nav.Link>
                </LinkContainer> }
                { this.props.user && <LinkContainer to="/logout">
                  <Nav.Link>Logout</Nav.Link>
                </LinkContainer> }
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      );
  }
}
