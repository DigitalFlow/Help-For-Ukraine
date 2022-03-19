import * as React from "react";
import _ from "lodash";
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
  isNew: boolean;
  showModal: boolean;
  modalAnswer: string;
  modalSecret: string;
  answerAttempts: number;
}

const lockedOutMsg = new Error("You've been locked out for 60 seconds");

class Person extends React.PureComponent<ExtendedIBaseProps, PersonState> {
    constructor(props: ExtendedIBaseProps) {
        super(props);

        this.state = {
          person: undefined,
          isNew: false,
          showModal: false,
          modalAnswer: "",
          modalSecret: "",
          answerAttempts: 0
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
      .then(ensureSuccess)
      .then(results => {
        return results.json();
      })
      .then((persons: Array<DbPerson>) => {
          this.setState({
              person: persons[0]
          }, () => this.props.setMessageBar(undefined, undefined) );
      })
      .catch(e => {
        this.props.setErrors([e]);
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
          this.props.setMessageBar("Successfully deleted person", undefined);
      })
      .catch(e => {
        this.props.setErrors([e]);
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
              isNew: false
          }, () => {
            this.props.setMessageBar(
              "Successfully saved person",
              undefined
            );
            this.props.history.push(`/person/${this.state.person.id}`);
          });
      })
      .catch(e => {
        this.props.setErrors([e]);
      });
    }

    showModal() {
      this.setState({ showModal: true });
    }

    hideModal() {
      this.setState({ showModal: false, modalAnswer: "" });
    }

    updateAndGetAnswerAttempts = () => {
      let { answerAttempts } = this.state;
      let errors = this.props.getErrors();
      answerAttempts += 1;
      this.setState({ answerAttempts });

      if (answerAttempts > 1) {
        setTimeout(() => {
          errors = _.pull(errors, lockedOutMsg);
          this.setState({ answerAttempts: 0 });
          this.props.setErrors(errors);
        }, 60 * 1000);
      }

      return answerAttempts;
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
        }, () => this.props.setErrors(undefined));
      })
      .catch((e) => {
          const attempts = this.updateAndGetAnswerAttempts();
          const errors = e instanceof RateLimitError
            ? [e]
            : [new Error("Answer was not correct")];

          if (attempts > 1) {
            errors.push(lockedOutMsg);
          }

          this.setState({
            showModal: false,
            modalAnswer: "",
          }, () =>
            this.props.setErrors(errors)
          );
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
      .then(() => {
        this.retrievePerson();
      })
      .catch((e) => {
          this.setState({
            showModal: false,
            modalAnswer: "",
          }, () =>
            this.props.setErrors([e])
          );
      });
    }

    render() {
      const isOwner = this.state.isNew || (this.state.person?.user_id && this.props.user?.id && this.state.person?.user_id === this.props.user?.id);
      const details = Object.values(this.state.person ?? {});
      const { answerAttempts } = this.state;

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
              <ButtonGroup>
                <Button onClick={() => this.props.history.goBack()} style={{ marginRight: "5px" }}>←</Button>
                { isOwner && // On update, you must either pass both of contact_information and secret, or neither. On Create, all fields have to have values
                  <Button variant="primary" disabled={(this.state.person.secret_answer && this.state.person.secret_answer.length < 4) || (!this.state.isNew && (!this.state.person.contact_information !== !this.state.person.secret_answer)) || (this.state.isNew && (details.length < 8 || details.some(v => !(v as string)?.trim())))} onClick={ this.save }>Save</Button>
                }
                { !this.state.isNew &&
                  <Button variant="primary" disabled={!this.props.user || answerAttempts > 1} onClick={ this.showModal }>Answer Question</Button>
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
