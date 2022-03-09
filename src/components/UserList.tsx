import * as React from "react";
import { DbUser } from "../model/DbUser";
import { LinkContainer } from "react-router-bootstrap";
import { Tab, Row, Col, NavItem, Nav, Table } from "react-bootstrap";
import { ExtendedIBaseProps } from "../domain/IBaseProps";
import { withRouter } from "react-router-dom";
import { Well } from "./Well";
import { Column } from "react-table";
import { ReactTable } from "./ReactTable";

export interface UserListState {
  users: Array<DbUser>;
  columns: Array<Column<DbUser>>;
}

class UserList extends React.PureComponent<ExtendedIBaseProps, UserListState> {
  constructor (props: ExtendedIBaseProps) {
    super(props);

    this.state = {
      users: [],
      columns: [
        {
            Header: "Username",
            accessor: "user_name"
        },
        {
            Header: "E-Mail",
            accessor: "email"
        },
        {
            Header: "Is Admin",
            accessor: "is_admin"
        },
        {
            Header: "Created On",
            accessor: "created_on"
        }
      ]
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
      <Well>
        <ReactTable columns={this.state.columns} data={this.state.users} navigationPath="profile" />
      </Well>
    );
  }
}

export default withRouter(UserList);