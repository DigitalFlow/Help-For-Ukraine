import * as React from "react";
import { ButtonToolbar, ButtonGroup, Button, Form, Alert } from "react-bootstrap";
import { DbPerson } from "../model/DbPerson";
import { ExtendedIBaseProps } from "../domain/IBaseProps";
import ReactMarkdown from "react-markdown";
import MessageBar from "./MessageBar";
import * as uuid from "uuid";
import { withRouter } from "react-router-dom";
import { Well } from "./Well";
import { ensureSuccess, RateLimitError } from "../domain/ensureSuccess";
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
        this.publish = this.publish.bind(this);
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
            id: uuid.v4()
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
          }, () => {
            this.props.history.push(`/person/${this.state.person.id}`);
          });
      })
      .catch(e => {
        this.setState({
          errors: e instanceof RateLimitError
            ? [`Too many requests. Try again in ${e.response.headers.get("Retry-After")} seconds`]
            : [e.message]
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
          errors: [],
          modalSecret: r.contact_information
        });
      })
      .catch((e) => {
          this.setState({
            showModal: false,
            modalAnswer: "",
            errors: e instanceof RateLimitError
              ? [`Too many requests. Try again in ${e.response.headers.get("Retry-After")} seconds`]
              : ["Answer was not correct"]
          });
      });
    }

    publish() {
      const headers = new Headers();
      headers.set("Content-Type", "application/json");

      fetch(`/publishPerson/${ this.state.person.id }`,
      {
        method: "POST",
        credentials: "include",
        headers: headers
      })
      .then(ensureSuccess)
      .then((r) => r.json())
      .then((r: DbPerson) => {
        this.retrievePerson();
      })
      .catch((e) => {
          this.setState({
            showModal: false,
            modalAnswer: "",
            errors: e instanceof RateLimitError
              ? [`Too many requests. Try again in ${e.response.headers.get("Retry-After")} seconds`]
              : ["Error while publishing"]
          });
      });
    }

    render() {
      const isOwner = this.state.isNew || (this.state.person?.user_id && this.props.user?.id && this.state.person?.user_id === this.props.user?.id);
      const details = Object.values(this.state.person ?? {});

      return (
        <Well>
          { !this.props.user &&
            <Alert variant="info">Sign in to answer the question and get information on how to reach out</Alert>
          }
          { !this.state.isNew && !this.state.person?.approved &&
            <Alert variant="warning">This listing is not yet shown publicly. An admin will review it and publish it if everything is fine.</Alert>
          }
          {
            !this.state.isNew && this.state.person && (!this.state.person.contact_information !== !this.state.person.secret_answer) &&
            <Alert variant="warning">When you change the secret answer, you also have to change the message for your family and vice versa. Leave empty for not changing it.</Alert>
          }
          {
            this.state.person?.secret_answer && this.state.person.secret_answer.length < 4 &&
            <Alert variant="warning">Your secret works like a password. It should be not less than 4 characters, more are better.</Alert>
          }
          {
            (this.state.isNew && (details.length < 8 || details.some(v => !(v as string)?.trim()))) &&
            <Alert variant="warning">All fields have to be set on creation</Alert>
          }
          {
            this.state.showModal &&
            <UserPromptModal title={this.state.modalSecret ? "Success!" : "Answer question"} text={this.state.modalSecret ? this.state.modalSecret : this.state.person.question} customFooter={this.state.modalSecret && <Button onClick={this.hideModal} variant="primary">Ok</Button>} yesCallBack={this.answerQuestion} noCallBack={this.hideModal}>
              {
                !this.state.modalSecret &&
                <FieldGroup
                  id="modalAnswer"
                  control={ { type: "text", value: this.state.modalAnswer ?? "", placeholder: "Enter answer", onChange: this.setModalAnswer } }
                  label="Answer"
                />
              }
            </UserPromptModal>
          }
          { this.state.person &&
            <>
              <MessageBar message= { this.state.message } errors={ this.state.errors } />
              <ButtonGroup>
                <Button onClick={() => this.props.history.goBack()} style={{ marginRight: "5px" }}>←</Button>
                { isOwner && // On update, you must either pass both of contact_information and secret, or neither. On Create, all fields have to have values
                  <Button variant="primary" disabled={(this.state.person.secret_answer && this.state.person.secret_answer.length < 4) || (!this.state.isNew && (!this.state.person.contact_information !== !this.state.person.secret_answer)) || (this.state.isNew && (details.length < 8 || details.some(v => !(v as string)?.trim())))} onClick={ this.save }>Save</Button>
                }
                { !this.state.isNew &&
                  <Button variant="primary" disabled={!this.props.user} onClick={ this.showModal }>Answer Question</Button>
                }
                {
                  isOwner && !this.state.isNew &&
                  <Button variant="danger" onClick={ this.delete }>Delete</Button>
                }
                {
                  !this.state.person?.approved && this.props.user && this.props.user.is_admin &&
                  <Button variant="success" onClick={ this.publish }>Publish</Button>
                }
              </ButtonGroup>
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