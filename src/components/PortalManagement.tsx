import * as React from "react";
import { Tab, Row, Col, NavItem, Nav, Table, Card } from "react-bootstrap";
import IBaseProps from "../domain/IBaseProps";
import DbUser from "../model/DbUser";
import DbPost from "../model/DbPost";
import UserListView from "./UserListView";
import PostListView from "./PostListView";
import { withRouter } from "react-router-dom";
import { Well } from "./Well";

export class PortalManagementState {
  users: Array<DbUser>;
  posts: Array<DbPost>;
  postInput: string;
}

class PortalManagement extends React.Component<IBaseProps, PortalManagementState> {
    constructor(props: IBaseProps) {
      super(props);

      this.state = {
        users: [],
        posts: [],
        postInput: "Demo"
      };
    }

    render() {
      return (
        <Tab.Container id="left-tabs-example" defaultActiveKey="users">
          <Row className="clearfix">
            <Col sm={ 1 }>
              <Nav variant="pills" className="flex-column">
                <Nav.Item>
                  <Nav.Link eventKey="users">Users</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="posts">Posts</Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
            <Col sm={ 11 }>
              <Well>
                <Tab.Content>
                  <Tab.Pane eventKey="users">
                    <UserListView {...this.props} />
                  </Tab.Pane>
                  <Tab.Pane eventKey="posts">
                    <PostListView {...this.props} />
                  </Tab.Pane>
                </Tab.Content>
              </Well>
            </Col>
          </Row>
      </Tab.Container>);
  }
}

export default withRouter(PortalManagement);