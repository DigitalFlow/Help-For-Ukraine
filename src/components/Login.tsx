import * as React from "react";
import { Button, Form } from "react-bootstrap";
import FieldGroup from "./FieldGroup";
import UserDetail from "../model/UserDetail";
import ValidationResult from "../model/ValidationResult";
import MessageBar from "./MessageBar";
import { ExtendedIBaseProps } from "../domain/IBaseProps";
import { withRouter } from "react-router-dom";
import { Well } from "./Well";

export interface LoginProps extends ExtendedIBaseProps {
    redirectComponent?: string;
}

interface LoginState {
    userName: string;
    password: string;
    errors: Array<string>;
}

// 'HelloProps' describes the shape of props.
// State is never set so we use the 'undefined' type.
class Login extends React.PureComponent<LoginProps, LoginState> {
    constructor(props: LoginProps) {
        super(props);

        this.state = {
          userName: "",
          password: "",
          errors: []
        };

        this.setUsername = this.setUsername.bind(this);
        this.setPassword = this.setPassword.bind(this);
        this.login = this.login.bind(this);
    }

    setUsername(e: any) {
        this.setState({ userName: e.target.value });
    }

    setPassword(e: any) {
      this.setState({ password: e.target.value });
    }

    login() {
      const headers = new Headers();
      headers.set("Content-Type", "application/json");

      fetch("/login",
      {
        method: "POST",
        headers: headers,
        credentials: "include",
        body: JSON.stringify(new UserDetail({
          userName: this.state.userName,
          password: this.state.password
        }))
      })
      .then(results => {
        return results.json();
      })
      .then((data: ValidationResult) => {
        if (!data.success) {
          this.setState({
            errors: data.errors
          });
        }
        else {
          // Reload so that App initializes again with User in state.
          this.props.triggerUserReload();
          this.props.history.push("/index");
        }
      });
    }

    render() {
        return (
          <Well>
            <MessageBar errors={ this.state.errors } />
            <h1>Login</h1>
            <Form>
              <FieldGroup
                id="userNameText"
                control={ { type: "text", placeholder: "Enter username", onChange: this.setUsername } }
                label="Username"
              />
              <FieldGroup
                id="passwordText"
                control={ { type: "password", placeholder: "Enter password", onChange: this.setPassword } }
                label="Password"
              />
              <p>
                By logging in, you understand and agree that a persistent cookie is stored which keeps you logged in for a week after log in or until you logout.
              </p>
              <Button onClick={ this.login } type="button">
                Submit
              </Button>
            </Form>
          </Well>
        );
    }
}

export default withRouter(Login);