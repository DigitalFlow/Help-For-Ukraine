import * as React from "react";
import { ButtonToolbar, ButtonGroup, Button, Form } from "react-bootstrap";
import { DbPerson } from "../model/DbPerson";
import { ExtendedIBaseProps } from "../domain/IBaseProps";
import ReactMarkdown from "react-markdown";
import MessageBar from "./MessageBar";
import * as uuid from "uuid";
import { withRouter } from "react-router-dom";
import { Well } from "./Well";
import FieldGroup from "./FieldGroup";

interface PersonState {
  person: DbPerson;
  message: string;
  errors: Array<string>;
  isNew: boolean;
}

class Person extends React.PureComponent<ExtendedIBaseProps, PersonState> {
    constructor(props: ExtendedIBaseProps) {
        super(props);

        this.state = {
          person: undefined,
          isNew: false,
          message: "",
          errors: []
        };

        this.retrievePerson = this.retrievePerson.bind(this);
        this.save = this.save.bind(this);
        this.delete = this.delete.bind(this);
        this.setFirstName = this.setFirstName.bind(this);
        this.setLastName = this.setLastName.bind(this);
        this.setCity = this.setCity.bind(this);
        this.setDescription = this.setDescription.bind(this);
        this.setQuestion = this.setQuestion.bind(this);
        this.setContactInformation = this.setContactInformation.bind(this);
        this.setAnswer = this.setAnswer.bind(this);
    }

    componentDidMount() {
      this.retrievePerson();
    }

    setFirstName(e: any) {
      this.setState({ person: { ...this.state.person, first_name: e.target.value }});
    }

    setAnswer(e: any) {
      this.setState({ person: { ...this.state.person, secret_answer: e.target.value }});
    }

    setContactInformation(e: any) {
      this.setState({ person: { ...this.state.person, contact_information: e.target.value }});
    }

    setLastName(e: any) {
      this.setState({ person: { ...this.state.person, last_name: e.target.value }});
    }

    setCity(e: any) {
      this.setState({ person: { ...this.state.person, city: e.target.value }});
    }

    setDescription(e: any) {
      this.setState({ person: { ...this.state.person, description: e.target.value }});
    }

    setQuestion(e: any) {
      this.setState({ person: { ...this.state.person, question: e.target.value }});
    }

    retrievePerson() {
      const personId = (this.props.match.params as any).id;

      if (personId === "new") {
        return this.setState({
          person: { ...this.state.person, id: uuid.v4() },
          isNew: true
        });
      }

      fetch(`/persons/${ personId }`,
      {
        credentials: "include"
      })
      .then(results => {
        return results.json();
      })
      .then((persons: Array<DbPerson>) => {
          this.setState({
              person: persons[0]
          });
      });
    }

    delete() {
      const personId = this.state.person.id;

      fetch(`/persons/${ personId }`,
      {
        method: "DELETE",
        credentials: "include"
      })
      .then(() => {
          this.setState({
              errors: [],
              message: "Successfully deleted person"
          });
      })
      .catch(err => {
        this.setState({
          errors: [err.message]
        });
      });
    }

    save() {
      const personId = this.state.person.id;
      const headers = new Headers();
      headers.set("Content-Type", "application/json");

      fetch(`/persons/${ personId }`,
      {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(this.state.person),
        headers: headers
      })
      .then(() => {
          this.setState({
              errors: [],
              message: "Successfully saved person",
              isNew: false
          });
      })
      .catch(err => {
        this.setState({
          errors: [err.message]
        });
      });
    }

    render() {
        if (!this.state.person) {
          return <p>Loading</p>;
        }

        return (
          <Well>
            <MessageBar message= { this.state.message } errors={ this.state.errors } />
            <ButtonToolbar>
              <ButtonGroup>
                <Button variant="primary" onClick={ this.save }>Save</Button>
              </ButtonGroup>
              {
                !this.state.isNew &&
                <ButtonGroup>
                  <Button variant="danger" onClick={ this.delete }>Delete</Button>
                </ButtonGroup>
              }
            </ButtonToolbar>
            <h1>Person</h1>
            <Form>
              <FieldGroup
                id="firstNameText"
                control={ { type: "text", value: this.state.person?.first_name ?? "", placeholder: "Enter first name", onChange: this.setFirstName } }
                label="First Name"
                help="Will be shown publicly"
              />
              <FieldGroup
                id="lastNameText"
                control={ { type: "text", value: this.state.person?.last_name ?? "", placeholder: "Enter last name", onChange: this.setLastName } }
                label="Last Name"
                help="Will be shown publicly"
              />
              <FieldGroup
                id="cityText"
                control={ { type: "text", value: this.state.person?.city ?? "", placeholder: "Enter city", onChange: this.setCity } }
                label="City"
                help="Not your current city, but your home city. Will be shown publicly."
              />
              <FieldGroup
                id="descriptionText"
                control={ { type: "text", value: this.state.person?.description ?? "", placeholder: "Enter description", onChange: this.setDescription } }
                label="Description"
                help="You can tell something about yourself so that your relatives can recognize you. Will be shown publicly, be careful."
              />
              <FieldGroup
                id="questionText"
                control={ { type: "text", value: this.state.person?.question ?? "", placeholder: "Enter question", onChange: this.setQuestion } }
                label="Question"
                help="Ask a question that only your family can answer. Do _NOT_ use anything easy to guess such as your eye / hair color or similar."
              />
              <FieldGroup
                id="answerText"
                control={ { type: "text", value: this.state.person?.secret_answer ?? "", placeholder: "Enter answer to question (secret)", onChange: this.setAnswer } }
                label="Question Answer"
                help="Minimum length: 4 characters. Your family will have to give the same answer as you do to see your contact information, so choose something they will get right."
              />
              <FieldGroup
                id="contactInformationText"
                control={ { type: "text", value: this.state.person?.contact_information ?? "", placeholder: "Leave a message for your relatives, how can you be contacted?", onChange: this.setContactInformation } }
                label="Message for Family"
                help="The message for your family can contain information on how to reach you. It is stored encrypted and can only be decrypted with the correct answer. Only you and people knowing the answer can view it."
              />
            </Form>
        </Well>
        );
    }
}

export default withRouter(Person);