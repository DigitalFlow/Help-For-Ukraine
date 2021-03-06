import * as React from "react";
import { DbPerson } from "../model/DbPerson";
import { Tab, Row, Col, NavItem, Nav, Table, ButtonToolbar, ButtonGroup, Button, Alert } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { ExtendedIBaseProps } from "../domain/IBaseProps";
import { withRouter } from "react-router-dom";
import { Well } from "./Well";
import { ReactTable } from "./ReactTable";
import { Column } from "react-table";
import { ensureSuccess } from "../domain/ensureSuccess";

export interface PersonFinderState {
  persons: Array<DbPerson>;
  columns: Array<Column<DbPerson>>;
}

export interface PersonFinderProps extends ExtendedIBaseProps {
  showUnapproved?: boolean;
}

class PersonFinder extends React.PureComponent<PersonFinderProps, PersonFinderState> {
  constructor (props: PersonFinderProps) {
    super(props);

    this.state = {
      persons: [],
      columns: [
        {
            Header: "First Name",
            accessor: "first_name"
        },
        {
            Header: "Last Name",
            accessor: "last_name"
        },
        {
            Header: "City",
            accessor: "city"
        },
        {
            Header: "Created On",
            accessor: "created_on",
            Cell: (c) => c.row.original.created_on?.substring(0, 10) ?? ""
        }
      ]
    };

    this.fetchPersons = this.fetchPersons.bind(this);
  }

  fetchPersons () {
    return fetch(this.props.showUnapproved ? "/persons/unapproved" : "/persons",
    {
      credentials: "include"
    })
    .then(ensureSuccess)
    .then(results => {
      return results.json();
    })
    .then((persons: Array<DbPerson>) => {
        this.setState({
            persons: persons
        });
    })
    .catch(e => {
      this.props.setErrors([e]);
    });
  }

  componentDidMount() {
    this.fetchPersons();
  }

  render () {
    return (
      <Well>
        { !this.props.user &&
            <Alert variant="info">Sign in to create a listing</Alert>
        }
        <ButtonToolbar style={{ marginBottom: "5px" }}>
          <ButtonGroup>
            <LinkContainer key={ "newLink" } to={ "/person/new" }>
              <Button disabled={!this.props.user} style={{margin: "5px" }} variant="primary">New Person</Button>
            </LinkContainer>
          </ButtonGroup>
        </ButtonToolbar>
        <ReactTable columns={this.state.columns} data={this.state.persons} navigationPath="person" />
      </Well>
    );
  }
}

export default withRouter(PersonFinder);