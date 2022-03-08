import * as React from "react";
import DbUser from "../model/DbUser";
import { LinkContainer } from "react-router-bootstrap";
import { Tab, Row, Col, NavItem, Nav, Table } from "react-bootstrap";
import { ExtendedIBaseProps } from "../domain/IBaseProps";
import { withRouter } from "react-router-dom";

export interface UserListState {
  users: Array<DbUser>;
}

class UserList extends React.PureComponent<ExtendedIBaseProps, UserListState> {
  constructor (props: ExtendedIBaseProps) {
    super(props);

    this.state = {
      users: []
    };

    this.fetchUsers = this.fetchUsers.bind(this);
  }

  fetchUsers() {
    return fetch("/userList",
    {
      credentials: "include"
    })
    .then(results => {
      return results.json();
    })
    .then((users: Array<DbUser>) => {
        this.setState({
            users: users
        });
    });
  }

  componentDidMount() {
    this.fetchUsers();
  }

  render () {
    return (
      <Table striped bordered hover>
        <thead>
            <tr>
                <th>Username</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>E-Mail</th>
                <th>Is Admin</th>
            </tr>
        </thead>
        <tbody>
          {
            this.state.users.map(user =>
              <LinkContainer key={ `${ user.user_name }_link` } to={ `/profile/${ user.id }` }>
                <tr>
                    <td>{ user.user_name }</td>
                    <td>{ user.first_name }</td>
                    <td>{ user.last_name }</td>
                    <td>{ user.email }</td>
                    <td>{ user.is_admin ? "True" : "False" }</td>
                </tr>
              </LinkContainer>)
          }
        </tbody>
        </Table>
      );
  }
}

export default withRouter(UserList);