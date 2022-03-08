import * as React from "react";
import DbPost from "../model/DbPost";
import { Tab, Row, Col, NavItem, Nav, Table, ButtonToolbar, ButtonGroup, Button } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { ExtendedIBaseProps } from "../domain/IBaseProps";
import { withRouter } from "react-router-dom";

export interface PostListState {
  posts: Array<DbPost>;
}

class PostList extends React.PureComponent<ExtendedIBaseProps, PostListState> {
  constructor (props: ExtendedIBaseProps) {
    super(props);

    this.state = {
      posts: []
    };

    this.fetchPosts = this.fetchPosts.bind(this);
  }

  fetchPosts () {
    return fetch("/posts",
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

  componentDidMount() {
    this.fetchPosts();
  }

  render () {
    return (
      <div>
        <ButtonToolbar>
          <ButtonGroup>
            <LinkContainer key={ "newLink" } to={ "/post/new" }>
              <Button variant="primary">New Post</Button>
            </LinkContainer>
          </ButtonGroup>
        </ButtonToolbar>
        <Table striped bordered hover>
          <thead>
              <tr>
                  <th>Content</th>
                  <th>Created On</th>
              </tr>
          </thead>
          <tbody>
            {
              this.state.posts.map(p => {
                let content = p.content || "";
                content = content.trim();

                const firstLineBreak = content.indexOf("\n");

                if (firstLineBreak !== -1) {
                  content = content.substr(0, firstLineBreak);
                }

                content = content.replace(/[#]*/g, "");

                return (
                  <LinkContainer key={ `${ p.id }_link` } to={ `/post/${ p.id }` }>
                    <tr>
                    <td>{ content }</td>
                    <td>{ p.created_on }</td>
                    </tr>
                  </LinkContainer>
                );
              })
            }
          </tbody>
          </Table>
        </div>
      );
  }
}

export default withRouter(PostList);