import * as React from "react";
import { DbPerson } from "../model/DbPerson";
import { Tab, Row, Col, NavItem, Nav, Table, ButtonToolbar, ButtonGroup, Button } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { ExtendedIBaseProps } from "../domain/IBaseProps";
import { withRouter } from "react-router-dom";
import { Well } from "./Well";
import { ReactTable } from "./ReactTable";
import { Column } from "react-table";

export interface PersonFinderState {
  persons: Array<DbPerson>;
  columns: Array<Column<DbPerson>>;
}

class PersonFinder extends React.PureComponent<ExtendedIBaseProps, PersonFinderState> {
  constructor (props: ExtendedIBaseProps) {
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
            }
      ]
    };

    this.fetchPersons = this.fetchPersons.bind(this);
  }

  fetchPersons () {
    return fetch("/persons",
    {
      credentials: "include"
    })
    .then(results => {
      return results.json();
    })
    .then((persons: Array<DbPerson>) => {
        this.setState({
            persons: persons
        });
    });
  }

  componentDidMount() {
    this.fetchPersons();
  }

  render () {
    return (
      <Well>
        <ButtonToolbar>
          <ButtonGroup>
            <LinkContainer key={ "newLink" } to={ "/person/new" }>
              <Button style={{margin: "5px" }} variant="primary">New Person</Button>
            </LinkContainer>
          </ButtonGroup>
        </ButtonToolbar>
        <ReactTable columns={this.state.columns} data={this.state.persons} navigationPath="person" />
      </Well>
    );
  }
}

export default withRouter(PersonFinder);