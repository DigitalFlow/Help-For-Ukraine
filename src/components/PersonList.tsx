import * as React from "react";
import { DbPerson } from "../model/DbPerson";
import { Tab, Row, Col, NavItem, Nav, Table, ButtonToolbar, ButtonGroup, Button } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { ExtendedIBaseProps } from "../domain/IBaseProps";
import { withRouter } from "react-router-dom";
import { Well } from "./Well";

export interface PersonFinderState {
  persons: Array<DbPerson>;
}

class PersonFinder extends React.PureComponent<ExtendedIBaseProps, PersonFinderState> {
  constructor (props: ExtendedIBaseProps) {
    super(props);

    this.state = {
      persons: []
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
              <Button variant="primary">New Person</Button>
            </LinkContainer>
          </ButtonGroup>
        </ButtonToolbar>
        <Table size="sm" striped bordered hover>
          <thead>
              <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>City</th>
                  <th>Created On</th>
              </tr>
          </thead>
          <tbody>
            {
              this.state.persons.map(p => {
                return (
                  <LinkContainer key={ `${ p.id }_link` } to={ `/person/${ p.id }` }>
                    <tr>
                    <td>{ p.first_name }</td>
                    <td>{ p.last_name }</td>
                    <td>{ p.city }</td>
                    <td>{ p.created_on }</td>
                    </tr>
                  </LinkContainer>
                );
              })
            }
          </tbody>
          </Table>
        </Well>
      );
  }
}

export default withRouter(PersonFinder);