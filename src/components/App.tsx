import * as React from "react";
import Header from "./Header";
import Main from "./Main";
import ValidationResult from "../model/ValidationResult";
import UserInfo from "../model/UserInfo";
import { ensureSuccess } from "../domain/ensureSuccess";
import MessageBar from "./MessageBar";

export interface AppState {
  user: UserInfo;
  message: string;
  errors: Array<Error>;
}

export default class App extends React.PureComponent<any, AppState> {
  constructor(props: any) {
    super(props);

    this.state = {
      user: undefined,
      message: undefined,
      errors: undefined
    };

    this.setUser = this.setUser.bind(this);
    this.triggerUserReload = this.triggerUserReload.bind(this);
    this.setMessage = this.setMessage.bind(this);
    this.setErrors = this.setErrors.bind(this);
    this.getErrors = this.getErrors.bind(this);
    this.setMessageBar = this.setMessageBar.bind(this);
  }

  componentDidMount() {
    this.setUser();
  }

  setMessage (message: string) {
    this.setState({ message });
  }

  setErrors (errors: Array<Error>) {
    this.setState({ errors });
  }

  getErrors () {
    return this.state.errors;
  }

  setMessageBar (message: string, errors: Array<Error>) {
    this.setState({ message, errors });
  }

  setUser() {
    fetch("/login",
    {
      method: "POST",
      headers: [
        ["Content-Type", "application/json"]
      ],
      credentials: "include",
      body: JSON.stringify({ })
    })
    .then(ensureSuccess)
    .then(results => {
      return results.json();
    })
    .then((result: ValidationResult) => {
      if (result.success) {
          this.setState({ user: result.userInfo });
      }
      else {
          this.setState({ user: undefined });
      }
    })
    .catch(e => {
      this.setErrors([e]);
    });
  }

  triggerUserReload() {
    this.setUser();
  }

  render() {
    return (
      <div>
        <Header {...this.props} user={ this.state.user } triggerUserReload={ this.triggerUserReload } setMessage={ this.setMessage } setErrors={ this.setErrors } getErrors={ this.getErrors } setMessageBar={ this.setMessageBar } />
        <MessageBar message={this.state.message} errors={this.state.errors} setMessage={this.setMessage} setErrors={this.setErrors} setMessageBar={this.setMessageBar} />
        <Main {...this.props} user={ this.state.user } triggerUserReload={ this.triggerUserReload } setMessage={ this.setMessage } setErrors={ this.setErrors } getErrors={ this.getErrors } setMessageBar={ this.setMessageBar } />
      </div>
    );
  }
}
