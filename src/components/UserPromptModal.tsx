import * as React from "react";
import { Modal, Button } from "react-bootstrap";

interface UserPromptModalProps {
  title: string;
  text: string;
  yesCallBack?: () => void;
  noCallBack?: () => void;
  finally?: () => void;
  customFooter?: React.ReactNode;
}

export default class UserPromptModal extends React.PureComponent<UserPromptModalProps, undefined> {
  constructor(props: UserPromptModalProps) {
    super(props);

    this.triggerCallback = this.triggerCallback.bind(this);
    this.callIfDefined = this.callIfDefined.bind(this);
  }

  callIfDefined(callBack: () => void) {
    if (callBack) {
      callBack();
    }
  }

  triggerCallback(choice: boolean) {
    if (choice) {
      this.callIfDefined(this.props.yesCallBack);
    }
    else {
      this.callIfDefined(this.props.noCallBack);
    }

    this.callIfDefined(this.props.finally);
  }

  render() {
    return (
      <Modal show={true}>
          <Modal.Header>
            <Modal.Title>{ this.props.title }</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <p>{ this.props.text }</p>
            { this.props.children }
          </Modal.Body>

          <Modal.Footer>
            {
              this.props.customFooter
              ? this.props.customFooter
              : <>
                <Button onClick={ () => this.triggerCallback(true) } variant="primary">Yes</Button>
                <Button onClick={ () => this.triggerCallback(false) } variant="default">No</Button>
              </>
            }
          </Modal.Footer>
        </Modal>
    );
  }
}
