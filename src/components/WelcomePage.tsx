import * as React from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import IBaseProps from "../domain/IBaseProps";
import DbPost from "../model/DbPost";
import PostView from "./PostView";
import { withRouter } from "react-router-dom";
import { Well } from "./Well";

interface WelcomePageState {
  posts: Array<DbPost>;
}

class WelcomePage extends React.PureComponent<IBaseProps, WelcomePageState> {
  constructor(props: IBaseProps) {
      super(props);

      this.state = {
        posts: []
      };
  }

  componentDidMount() {
    fetch("/posts?postCount=10",
    {
      credentials: "include"
    })
    .then(results => {
      return results.json();
    })
    .then((posts: Array<DbPost>) => {
        this.setState({
            posts: posts
        });
    });
  }

  render() {
    return (
      <Container fluid>
        <Row>
          <Col xs={6}>
            <Well>
              <h1>Welcome { this.props.user && this.props.user.first_name }</h1>
              <p>Find missing family members, housing or help</p>
            </Well>
          </Col>
          <Col xs={6}>
            <Well>
              <h1>News</h1>
              { this.props.user ? this.state.posts.map(p => <PostView key={ p.id } post={ p } />) : "" }
            </Well>
          </Col>
        </Row>
    </Container>
    );
  }
}

export default withRouter(WelcomePage);