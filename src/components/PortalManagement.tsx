import * as React from "react";
import { Tab, Row, Col, NavItem, Nav, Table, Card } from "react-bootstrap";
import { ExtendedIBaseProps } from "../domain/IBaseProps";
import { DbUser } from "../model/DbUser";
import  { DbPost } from "../model/DbPost";
import UserList from "./UserList";
import PostList from "./PostList";
import { withRouter } from "react-router-dom";
import { Well } from "./Well";
import { DbPerson } from "../model/DbPerson";
import PersonList from "./PersonList";

export class PortalManagementState {
  users: Array<DbUser>;
  posts: Array<DbPost>;
  unpublishedPersons: Array<DbPerson>;
  postInput: string;
}

class PortalManagement extends React.Component<ExtendedIBaseProps, PortalManagementState> {
    constructor(props: ExtendedIBaseProps) {
      super(props);

      this.state = {
        users: [],
        posts: [],
        unpublishedPersons: [],
        postInput: "Demo"
      };
    }

    render() {
      return (
        <Tab.Container id="left-tabs-example" defaultActiveKey="users">
          <Row className="clearfix">
            <Col xs={ 2 }>
              <Nav variant="pills" className="flex-column">
                <Nav.Item>
                  <Nav.Link eventKey="users">Users</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="posts">Posts</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="persons">Unpublished Persons</Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
            <Col xs={ 10 }>
              <Well>
                <Tab.Content>
                  <Tab.Pane eventKey="users">
                    <UserList {...this.props} />
                  </Tab.Pane>
                  <Tab.Pane eventKey="posts">
                    <PostList {...this.props} />
                  </Tab.Pane>
                  <Tab.Pane eventKey="persons">
                    <PersonList {...this.props} showUnpublished={true} />
                  </Tab.Pane>
                </Tab.Content>
              </Well>
            </Col>
          </Row>
      </Tab.Container>);
  }
}

export default withRouter(PortalManagement);