import * as React from "react";
import { ButtonToolbar, ButtonGroup, Button, Row, Col, Container } from "react-bootstrap";
import  { DbPost  } from "../model/DbPost";
import { ExtendedIBaseProps } from "../domain/IBaseProps";
import ReactMarkdown from "react-markdown";
import MessageBar from "./MessageBar";
import * as uuid from "uuid";
import { withRouter } from "react-router-dom";
import { ensureSuccess } from "../domain/ensureSuccess";

interface PostEditState {
  post: DbPost;
}

class PostEdit extends React.PureComponent<ExtendedIBaseProps, PostEditState> {
    constructor(props: ExtendedIBaseProps) {
        super(props);

        this.state = {
          post: undefined,
        };

        this.retrievePost = this.retrievePost.bind(this);
        this.markdownChanged = this.markdownChanged.bind(this);
        this.save = this.save.bind(this);
        this.delete = this.delete.bind(this);
        this.openHelp = this.openHelp.bind(this);
    }

    componentDidMount() {
      this.retrievePost();
    }

    retrievePost() {
      const postId = (this.props.match.params as any).id;

      if (postId === "new") {
        return this.setState({
          post: { ...this.state.post, id: uuid.v4() }
        });
      }

      fetch(`/posts/${ postId }`,
      {
        credentials: "include"
      })
      .then(ensureSuccess)
      .then(results => {
        return results.json();
      })
      .then((posts: Array<DbPost>) => {
          this.setState({
              post: posts[0]
          });
      })
      .catch(e => {
        this.props.setErrors([e]);
      });
    }

    markdownChanged(e: any) {
      this.setState({
        post: { ...this.state.post, content: e.target.value }
      });
    }

    delete() {
      const postId = this.state.post.id;

      fetch(`/posts/${ postId }`,
      {
        method: "DELETE",
        credentials: "include"
      })
      .then(ensureSuccess)
      .then(() => {
          this.props.setMessageBar(
            "Successfully deleted post",
            undefined
          );
      })
      .catch(e => {
        this.props.setErrors([e]);
      });
    }

    save() {
      const postId = this.state.post.id;
      const headers = new Headers();
      headers.set("Content-Type", "application/json");

      fetch(`/posts/${ postId }`,
      {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(this.state.post),
        headers: headers
      })
      .then(ensureSuccess)
      .then(() => {
          this.props.setMessageBar(
              "Successfully saved post",
              undefined
          );
      })
      .catch(e => {
        this.props.setErrors([e]);
      });
    }

    openHelp() {
        window.open("https://github.github.com/gfm/", "about:blank");
    }

    render() {
        if (!this.state.post) {
          return <p>Loading</p>;
        }

        return (
          <div>
            <ButtonToolbar>
              <ButtonGroup>
                <Button variant="primary" onClick={ this.openHelp }>Help</Button>
                <Button variant="primary" onClick={ this.save }>Save</Button>
              </ButtonGroup>
              <ButtonGroup>
                <Button variant="danger" onClick={ this.delete }>Delete</Button>
              </ButtonGroup>
            </ButtonToolbar>
            <Container fluid>
              <Row>
                <Col xs={6}>
                  <textarea style={ { "height": "100vh" } } value={ this.state.post.content } onChange={ this.markdownChanged } />
                </Col>
                <Col xs={6}>
                  <ReactMarkdown
                    className="result"
                    children={ this.state.post.content }
                    skipHtml={ true }
                  />
                </Col>
              </Row>
            </Container>
          </div>
        );
    }
}

export default withRouter(PostEdit);