import * as React from "react";
import { Card } from "react-bootstrap";
import { Well } from "./Well";

interface MessageBarProps {
  message?: string;
  errors: Array<string>;
}

const MessageBar = ( props: MessageBarProps ) => {
  if (props.message || (props.errors && props.errors.length)) {
    return (
      <Well>
        { props.message ? <div><span style={ { color: "green" } }>{ props.message }</span></div> : <div/> }
        { props.errors.map(e => (<div key={ e }><span style={ { color: "red" } }>{ e }</span><br /></div>)) }
      </Well>
    );
  }
  else {
    return (<div/>);
  }
};

export default MessageBar;
