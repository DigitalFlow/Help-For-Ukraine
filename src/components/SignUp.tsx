import * as React from "react";
import { Card, Button, Form } from "react-bootstrap";
import FieldGroup from "./FieldGroup";
import UserDetail from "../model/UserDetail";
import ValidationResult from "../model/ValidationResult";
import MessageBar from "./MessageBar";
import { withRouter } from "react-router-dom";
import { ExtendedIBaseProps } from "../domain/IBaseProps";
import { Well } from "./Well";
import { ensureSuccess } from "../domain/ensureSuccess";

export interface SignUpProps extends ExtendedIBaseProps {
    redirectComponent?: string;
}

interface SignUpState {
    userName: string;
    password: string;
    repeatPassword: string;
    email: string;
}

// 'HelloProps' describes the shape of props.
// State is never set so we use the 'undefined' type.
class SignUp extends React.PureComponent<SignUpProps, SignUpState> {
    constructor(props: SignUpProps) {
        super(props);

        this.state = {
            userName: "",
            password: "",
            repeatPassword: "",
            email: ""
        };

        this.setUsername = this.setUsername.bind(this);
        this.setPassword = this.setPassword.bind(this);
        this.repeatPassword = this.repeatPassword.bind(this);
        this.setEmail = this.setEmail.bind(this);
        this.signUp = this.signUp.bind(this);
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

    signUp() {
      if (this.state.password !== this.state.repeatPassword) {
        return this.props.setErrors([ new Error("Password and repeat passwords don't match, please enter them again.") ]);
      }

      const headers = new Headers();
      headers.set("Content-Type", "application/json");

      fetch("/signUp",
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify(new UserDetail({
          userName: this.state.userName,
          password: this.state.password,
          email: this.state.email
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
            "Success! You may now log in.",
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
            <Form>
              <h1>Sign Up</h1>
              <FieldGroup
                id="userNameText"
                control={ { type: "text", placeholder: "Enter username", onChange: this.setUsername } }
                label="Username"
              />
              <FieldGroup
                id="formControlsEmail"
                control={ { type: "text", placeholder: "Enter email", onChange: this.setEmail } }
                label="E-Mail"
              />
              <FieldGroup
                id="formControlsPassword"
                control={ { type: "password", placeholder: "Enter password", onChange: this.setPassword } }
                label="Password"
              />
              <FieldGroup
                id="formControlsRepeatPassword"
                control={ { type: "password", placeholder: "Repeat password", onChange: this.repeatPassword } }
                label="Repeat Password"
              />
              <Button onClick={ this.signUp } type="button">
                Submit
              </Button>
            </Form>
          </Well>
        );
    }
}

export default withRouter(SignUp);