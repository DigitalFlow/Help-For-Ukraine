import * as React from "react";
import { Alert, Card } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { RateLimitError } from "../domain/ensureSuccess";
import { Well } from "./Well";

interface MessageBarProps {
  message?: string;
  errors: Array<Error>;
  setMessage: (message: string) => void;
  setErrors: (errors: Array<Error>) => void;
  setMessageBar: (message: string, errors: Array<Error>) => void;
}

const MessageBar = ( props: MessageBarProps ) => {
  const location = useLocation();

  React.useEffect(() => {
    props.setMessageBar(undefined, undefined);
  }, [location.pathname]);

  return (
    <>
      { props.message && <Alert variant="success" onClose={() => props.setMessage(undefined)} dismissible><span>{ props.message }</span></Alert> }
      {
        props.errors &&
        <Alert variant="danger" onClose={() => props.setErrors(undefined)} dismissible>
          {
            props.errors.map(e => (
              <span key={ e.message }>
              {
                e instanceof RateLimitError
                  ? [`Too many requests. Try again in ${e.response.headers.get("Retry-After")} seconds`]
                  : [e.message]
              }
              </span>))
            }
        </Alert>
      }
    </>
  );
};

export default MessageBar;
