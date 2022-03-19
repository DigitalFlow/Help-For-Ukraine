import * as React from "react";
import { Card } from "react-bootstrap";
import ValidationResult from "../model/ValidationResult";
import MessageBar from "./MessageBar";
import { ExtendedIBaseProps } from "../domain/IBaseProps";
import { withRouter } from "react-router-dom";
import { Well } from "./Well";
import { ensureSuccess } from "../domain/ensureSuccess";

export interface LogoutState {
}

class Logout extends React.PureComponent<ExtendedIBaseProps, LogoutState> {
    constructor(props: ExtendedIBaseProps) {
        super(props);
    }

    componentDidMount() {
        fetch("/logout",
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
            this.props.triggerUserReload();
            this.props.history.push("/index");
          }
          else {
            this.props.setErrors(result.errors.map(e => new Error(e)));
          }
        })
        .catch(e => {
          this.props.setErrors([e]);
        });
    }

    render() {
        return (
            <Well>
            </Well>
        );
    }
}

export default withRouter(Logout);