import * as React from "react";
import { Card, Button, Form } from "react-bootstrap";
import FieldGroup from "./FieldGroup";
import { DbUser } from "../model/DbUser";
import UserDetail from "../model/UserDetail";
import ValidationResult from "../model/ValidationResult";
import MessageBar from "./MessageBar";
import { ExtendedIBaseProps } from "../domain/IBaseProps";
import { withRouter } from "react-router-dom";
import { Well } from "./Well";
import { ensureSuccess } from "../domain/ensureSuccess";

interface ProfileState {
    userName: string;
    password: string;
    repeatPassword: string;
    email: string;
    isAdmin: boolean;
}

// 'HelloProps' describes the shape of props.
// State is never set so we use the 'undefined' type.
class Profile extends React.PureComponent<ExtendedIBaseProps, ProfileState> {
    constructor(props: ExtendedIBaseProps) {
        super(props);

        this.state = {
          userName: "",
          password: "",
          repeatPassword: "",
          email: "",
          isAdmin: false
        };

        this.setUsername = this.setUsername.bind(this);
        this.setPassword = this.setPassword.bind(this);
        this.repeatPassword = this.repeatPassword.bind(this);
        this.setEmail = this.setEmail.bind(this);
        this.setIsAdmin = this.setIsAdmin.bind(this);
        this.update = this.update.bind(this);
        this.retrieveUser = this.retrieveUser.bind(this);
    }

    componentDidMount() {
      this.retrieveUser();
    }

    retrieveUser() {
      const userId = (this.props.match.params as any).userId;

      fetch(`/retrieveProfile${ userId ? `/${ userId }` : "" }`,
      {
        credentials: "include"
      })
      .then(ensureSuccess)
      .then(results => {
        return results.json();
      })
      .then((user: DbUser) => {
          this.setState({
              userName: user.user_name,
              password: "",
              repeatPassword: "",
              email: user.email,
              isAdmin: user.is_admin
          }, () => this.props.setMessageBar(undefined, undefined));
      })
      .catch(e => {
        this.props.setErrors([e]);
      });
    }

    setUsername(e: any) {
        this.setState({ userName: e.target.value });
    }

    setPassword(e: any) {
      this.setState({ password: e.target.value });
    }

    repeatPassword(e: any) {
      this.setState({ repeatPassword: e.target.value });
    }

    setEmail(e: any) {
      this.setState({ email: e.target.value });
    }

    setIsAdmin(e: any) {
      this.setState({ isAdmin: e.target.checked });
    }

    update() {
      if (this.state.password !== this.state.repeatPassword) {
        return this.props.setErrors([new Error("Password and repeat passwords don't match, please enter them again.")]);
      }

      const headers = new Headers();
      headers.set("Content-Type", "application/json");

      const userId = (this.props.match.params as any).userId;

      fetch(`/profile${ userId ? `/${ userId }` : "" }`,
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify(new UserDetail({
          userName: this.state.userName,
          password: this.state.password,
          email: this.state.email,
          isAdmin: this.state.isAdmin
        })),
        credentials: "include"
      })
      .then(ensureSuccess)
      .then(results => {
        return results.json();
      })
      .then((data: ValidationResult) => {
        if (!data.success) {
          this.props.setErrors(data.errors.map(e => new Error(e)));
        }
        else {
          this.props.setMessageBar(
            "Success! Profile updated.",
            undefined
          );
        }
      })
      .catch(e => {
        this.props.setErrors([e]);
      });
    }

    render() {
        return (
          <Well>
            <h1>Profile</h1>
            <div>
              <FieldGroup
                id="userNameText"
                control={ { type: "text", value: this.state.userName, placeholder: "Enter username", onChange: this.setUsername } }
                label="Username"
              />
              <FieldGroup
                id="formControlsEmail"
                control={ { type: "text", value: this.state.email, placeholder: "Enter email", onChange: this.setEmail } }
                label="E-Mail"
              />
              <FieldGroup
                id="formControlsPassword"
                control={ { type: "password", value: this.state.password, placeholder: "Leave empty for not updating", onChange: this.setPassword } }
                label="Password"
              />
              <FieldGroup
                id="formControlsRepeatPassword"
                control={ { type: "password", value: this.state.repeatPassword, placeholder: "Leave empty for not updating", onChange: this.repeatPassword } }
                label="Repeat Password"
              />
              { this.props.user && this.props.user.is_admin && <Form.Check key={ `${ this.state.userName }_isAdmin` } value={ this.state.isAdmin as any } label="Is Admin" onChange={ this.setIsAdmin } /> }
              <Button onClick={ this.update } type="submit">
                Submit
              </Button>
            </div>
          </Well>
        );
    }
}

export default withRouter(Profile);