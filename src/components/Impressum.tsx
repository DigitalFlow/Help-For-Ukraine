import * as React from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import { ExtendedIBaseProps } from "../domain/IBaseProps";
import { withRouter } from "react-router-dom";
import { Well } from "./Well";

interface ImpressumState {
}

class Impressum extends React.PureComponent<ExtendedIBaseProps, ImpressumState> {
  constructor(props: ExtendedIBaseProps) {
      super(props);

      this.state = {
        posts: []
      };
  }

  render() {
    return (
      <Container fluid>
        <Well>
            <h1>Impressum</h1>
            <p>
                This is a private website serving exclusively personal and familial intents, without any business intent.
                <br />
                We do not serve any ads or generate income in any way.
                <br />
                Thus this page does not need a proper impressum containing the full address of the website operator according to German law.
                <br />
                We do this also to protect our identities.
                <br />
                Nonetheless we want to offer a way of communicating towards us for any matters you want to discuss. Especially requests for new features that would help people are always welcome.
                <br />
                Please write us an e-mail to <a href="mailto:help.ukraine.postmaster@gmail.com">help.ukraine.postmaster@gmail.com</a>.
            </p>
            <h1>About Us</h1>
            <p>
                We're an open collective interested in helping all Ukranian citizens in the current war.
                <br />
                The code of this website is open source, anyone interested in helping out (translations, feature requests, code contributions) is welcome to participate on <a href="https://github.com/DigitalFlow/Help-For-Ukraine">GitHub</a>.
            </p>
        </Well>
    </Container>
    );
  }
}

export default withRouter(Impressum);