import * as React from "react";
import { ButtonToolbar, ButtonGroup, Button, Form } from "react-bootstrap";
import { DbPerson } from "../model/DbPerson";
import { ExtendedIBaseProps } from "../domain/IBaseProps";
import ReactMarkdown from "react-markdown";
import MessageBar from "./MessageBar";
import * as uuid from "uuid";
import { withRouter } from "react-router-dom";
import { Well } from "./Well";
import { ensureSuccess } from "../domain/ensureSuccess";
import { PersonEdit } from "./PersonEdit";
import { PersonReadonly } from "./PersonReadonly";
import UserPromptModal from "./UserPromptModal";
import FieldGroup from "./FieldGroup";

interface PersonState {
  person: DbPerson;
  message: string;
  errors: Array<string>;
  isNew: boolean;
  showModal: boolean;
  modalAnswer: string;
  modalSecret: string;
}

class Person extends React.PureComponent<ExtendedIBaseProps, PersonState> {
    constructor(props: ExtendedIBaseProps) {
        super(props);

        this.state = {
          person: undefined,
          isNew: false,
          message: "",
          errors: [],
          showModal: false,
          modalAnswer: "",
          modalSecret: ""
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
        this.showModal = this.showModal.bind(this);
        this.hideModal = this.hideModal.bind(this);
        this.setModalAnswer = this.setModalAnswer.bind(this);
        this.answerQuestion = this.answerQuestion.bind(this);
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

    setModalAnswer(e: any) {
      this.setState({ modalAnswer: e.target.value });
    }

    retrievePerson() {
      const personId = (this.props.match.params as any).id;

      if (personId === "new") {
        return this.setState({
          person: {
            ...this.state.person,
            id: uuid.v4(),
            user_id: this.props.user.id
          },
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
      .then(ensureSuccess)
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
      .then(ensureSuccess)
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

    showModal() {
      this.setState({ showModal: true });
    }

    hideModal() {
      this.setState({ showModal: false, modalAnswer: "" });
    }

    answerQuestion() {
      const personId = this.state.person.id;
      const headers = new Headers();
      headers.set("Content-Type", "application/json");

      fetch(`/personsecret/${ personId }`,
      {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ secret_answer: this.state.modalAnswer } as DbPerson),
        headers: headers
      })
      .then(ensureSuccess)
      .then((r) => r.json())
      .then((r: DbPerson) => {
        this.setState({
          modalSecret: r.contact_information
        });
      })
      .catch((e) => {
        this.setState({
          message: "Answer was not correct"
        });
      });
    }

    render() {
      const isOwner = this.state.person?.user_id === this.props.user?.id;
      const details = Object.values(this.state.person ?? {});

      return (
        <Well>
          {
            this.state.showModal &&
            <UserPromptModal title="Answer question" text={this.state.person.question} finally={this.hideModal} yesCallBack={this.answerQuestion} noCallBack={this.hideModal}>
              {
                !this.state.modalSecret
                ? <FieldGroup
                  id="modalAnswer"
                  control={ { type: "text", value: this.state.modalAnswer ?? "", placeholder: "Enter answer", onChange: this.setModalAnswer } }
                  label="Answer"
                />
                : <FieldGroup
                  id="modalSecret"
                  control={ { type: "text", value: this.state.modalSecret ?? "", onChange: () => {} } }
                  label="Secret"
                />
              }
            </UserPromptModal>
          }
          { this.state.person &&
            <>
              <MessageBar message= { this.state.message } errors={ this.state.errors } />
              <ButtonToolbar>
                { isOwner &&
                  <ButtonGroup>
                    <Button variant="primary" disabled={(!this.state.isNew && (!!this.state.person.contact_information && !!this.state.person.secret_answer)) || (this.state.isNew && (details.length < 8 || details.some(v => !(v as string)?.trim())))} onClick={ this.save }>Save</Button>
                  </ButtonGroup>
                }
                {
                  isOwner && !this.state.isNew &&
                  <ButtonGroup>
                    <Button variant="danger" onClick={ this.delete }>Delete</Button>
                  </ButtonGroup>
                }
                <ButtonGroup>
                  <Button variant="primary" onClick={ this.showModal }>Answer Question</Button>
                </ButtonGroup>
              </ButtonToolbar>
              <h1>Person</h1>
              {
                isOwner
                  ? <PersonEdit isNew={this.state.isNew} person={this.state.person} setFirstName={this.setFirstName} setLastName={this.setLastName} setCity={this.setCity} setDescription={this.setDescription} setQuestion={this.setQuestion} setAnswer={this.setAnswer} setContactInformation={this.setContactInformation} />
                  : <PersonReadonly person={this.state.person} />
              }
            </>
          }
        </Well>
      );
    }
}

export default withRouter(Person);